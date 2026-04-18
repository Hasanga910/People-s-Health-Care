import PharmacyPrescription from '../models/PharmacyPrescription.js';
import PharmacyBill         from '../models/Pharmacybill.js';
import Prescription         from '../models/Prescription.js';
import Drug                 from '../models/Drug.js';
import DrugStock            from '../models/DrugStock.js';

// ═══════════════════════════════════════════════════════════════
//  PHARMACY PRESCRIPTION CONTROLLER
//
//  Flow:
//    1. Doctor creates Prescription  (pharmacyStatus = 'pending')
//    2. GET /api/pharmacy  auto-pulls pending prescriptions into queue
//    3. Pharmacist reviews → PUT /:id/review
//         · links Drug records + sets availability + qty
//         · status → in_review or partially_available
//    4. Pharmacist dispenses → POST /:id/dispense
//         · deducts stock via FEFO immediately
//         · calculates bill (qty × unitPrice per stock entry)
//         · creates PharmacyBill → cashier sees it instantly
//         · marks prescription dispensed
// ═══════════════════════════════════════════════════════════════


// ── 1. RECEIVE prescription into pharmacy ─────────────────────
// POST /api/pharmacy/:prescriptionId/receive
export const receivePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.prescriptionId);
    if (!prescription)
      return res.status(404).json({ success: false, message: 'Prescription not found' });

    const existing = await PharmacyPrescription.findOne({ prescriptionId: prescription._id });
    if (existing)
      return res.status(200).json({
        success: true,
        message: 'Already received',
        pharmacyPrescription: existing,
      });

    if (prescription.pharmacyStatus === 'dispensed')
      return res.status(400).json({ success: false, message: 'Already dispensed' });
    if (prescription.pharmacyStatus === 'cancelled')
      return res.status(400).json({ success: false, message: 'Prescription cancelled' });

    const lines = prescription.medications.map((med) => ({
      medicationName: med.name,
      dosage:         med.dosage,
      duration:       med.duration,
      drugId:         null,
      qtyToDispense:  0,
      availability:   'available',
      pharmacistNote: '',
      stockDeducted:  false,
    }));

    const pharmacyPrescription = await PharmacyPrescription.create({
      prescriptionId:  prescription._id,
      prescriptionRef: prescription.prescriptionId,
      patientName:     prescription.patientName,
      patientId:       prescription.patientId,
      doctorName:      prescription.doctorName,
      lines,
      status:          'pending',
    });

    res.status(201).json({ success: true, pharmacyPrescription });
  } catch (error) {
    console.error('receivePrescription error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


// ── 2. REVIEW lines – link drugs, check stock ─────────────────
// PUT /api/pharmacy/:id/review
// Body: { lines: [{ _id, drugId, qtyToDispense, availability, pharmacistNote }], generalNote }
//
// NOTE: This step does NOT deduct stock yet. Stock is deducted only on dispense.
//       This allows the pharmacist to adjust before committing.
export const reviewPrescription = async (req, res) => {
  try {
    const pharmacyPrescription = await PharmacyPrescription.findById(req.params.id);
    if (!pharmacyPrescription)
      return res.status(404).json({ success: false, message: 'Pharmacy prescription not found' });

    if (pharmacyPrescription.status === 'dispensed')
      return res.status(400).json({ success: false, message: 'Already dispensed — cannot edit' });
    if (pharmacyPrescription.status === 'cancelled')
      return res.status(400).json({ success: false, message: 'Prescription cancelled' });

    const { lines, generalNote } = req.body;

    if (!Array.isArray(lines) || lines.length === 0)
      return res.status(400).json({ success: false, message: 'lines array is required' });

    // Update each line
    for (const updatedLine of lines) {
      const lineId = updatedLine._id || updatedLine.lineId;
      const line   = pharmacyPrescription.lines.id(lineId);
      if (!line) continue;

      if (updatedLine.drugId         !== undefined) line.drugId         = updatedLine.drugId || null;
      if (updatedLine.qtyToDispense  !== undefined) line.qtyToDispense  = Number(updatedLine.qtyToDispense) || 0;
      if (updatedLine.availability   !== undefined) line.availability   = updatedLine.availability;
      if (updatedLine.pharmacistNote !== undefined) line.pharmacistNote = updatedLine.pharmacistNote || '';

      // Validate unavailable lines have a note
      if (line.availability !== 'available' && !line.pharmacistNote?.trim())
        return res.status(400).json({
          success: false,
          message: `Add a note for "${line.medicationName}" — marked as ${line.availability.replace(/_/g, ' ')}`,
        });

      // Validate available lines
      if (line.availability === 'available') {
        if (!line.drugId)
          return res.status(400).json({
            success: false,
            message: `Link an inventory drug for "${line.medicationName}"`,
          });
        if (line.qtyToDispense <= 0)
          return res.status(400).json({
            success: false,
            message: `Set qty > 0 for "${line.medicationName}"`,
          });

        // Live stock check (warn if insufficient — but don't block, pharmacist can mark out_of_stock)
        const totalStock = await DrugStock.getTotalStock(line.drugId);
        if (totalStock < line.qtyToDispense) {
          const drug = await Drug.findById(line.drugId).select('name');
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for "${drug?.name ?? line.medicationName}" — available: ${totalStock}, requested: ${line.qtyToDispense}. Mark as out_of_stock instead.`,
          });
        }
      }
    }

    if (generalNote !== undefined) pharmacyPrescription.generalNote = generalNote;
    pharmacyPrescription.pharmacistId = req.user._id;
    pharmacyPrescription.reviewedAt   = new Date();
    // pre-save hook auto-sets partially_available if any line is unavailable
    await pharmacyPrescription.save();

    // Return populated so frontend sees drugId objects
    const populated = await PharmacyPrescription.findById(pharmacyPrescription._id)
      .populate('pharmacistId', 'name')
      .populate('lines.drugId', 'drugId name brand form strength unit unitPrice');

    res.status(200).json({
      success: true,
      message: 'Prescription reviewed successfully',
      pharmacyPrescription: populated,
    });
  } catch (error) {
    console.error('reviewPrescription error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


// ── 3. DISPENSE – deduct stock via FEFO + create bill ─────────
// POST /api/pharmacy/:id/dispense
export const dispensePrescription = async (req, res) => {
  try {
    const pharmacyPrescription = await PharmacyPrescription.findById(req.params.id)
      .populate('lines.drugId', 'drugId name brand form strength unit unitPrice');

    if (!pharmacyPrescription)
      return res.status(404).json({ success: false, message: 'Pharmacy prescription not found' });

    if (pharmacyPrescription.status === 'dispensed')
      return res.status(400).json({ success: false, message: 'Already dispensed' });
    if (pharmacyPrescription.status === 'cancelled')
      return res.status(400).json({ success: false, message: 'Prescription is cancelled' });

    // Check all available lines are linked + have qty
    const unready = pharmacyPrescription.lines.filter(
      l => l.availability === 'available' && (!l.drugId || l.qtyToDispense <= 0)
    );
    if (unready.length > 0)
      return res.status(400).json({
        success: false,
        message: `Complete review first — ${unready.length} line(s) still unlinked or have no qty`,
      });

    // ── FEFO stock deduction + bill line building ──────────────
    const billLines         = [];  // dispensed (available) lines
    const unavailableLines  = [];  // out_of_stock / not_in_formulary lines

    for (const line of pharmacyPrescription.lines) {
      // ── Unavailable lines: collect for bill display ──────────
      if (line.availability !== 'available') {
        unavailableLines.push({
          medicationName: line.medicationName,
          dosage:         line.dosage        || '',
          duration:       line.duration      || '',
          availability:   line.availability,
          pharmacistNote: line.pharmacistNote || '',
        });
        continue;
      }

      // ── Available lines: skip if incomplete or already deducted
      if (!line.drugId || line.qtyToDispense <= 0) continue;
      if (line.stockDeducted) continue; // idempotent

      // Deduct stock via FEFO — returns array of { stockId, deducted }
      const touched = await DrugStock.deductFEFO(line.drugId, line.qtyToDispense);
      line.stockDeducted = true;

      // Weighted average unit price across touched batches
      const drugDoc      = line.drugId; // populated
      const catalogPrice = typeof drugDoc === 'object' ? (drugDoc.unitPrice || 0) : 0;

      let totalCost = 0;
      let totalQty  = 0;
      for (const t of touched) {
        const stockEntry = await DrugStock.findOne({ stockId: t.stockId }).select('unitPrice');
        const price = stockEntry?.unitPrice || catalogPrice;
        totalCost += price * t.deducted;
        totalQty  += t.deducted;
      }
      const effectiveUnitPrice = totalQty > 0 ? Math.round((totalCost / totalQty) * 100) / 100 : catalogPrice;

      billLines.push({
        medicationName: line.medicationName,
        drugId:         typeof drugDoc === 'object' ? drugDoc._id : drugDoc,
        qtyDispensed:   line.qtyToDispense,
        unitPrice:      effectiveUnitPrice,
        lineTotal:      Math.round(effectiveUnitPrice * line.qtyToDispense * 100) / 100,
        stockEntries:   touched,
      });
    }

    // ── Mark prescription dispensed ───────────────────────────
    pharmacyPrescription.status       = 'dispensed';
    pharmacyPrescription.dispensedAt  = new Date();
    pharmacyPrescription.pharmacistId = req.user._id;
    await pharmacyPrescription.save();

    // Sync parent Prescription
    await Prescription.findByIdAndUpdate(pharmacyPrescription.prescriptionId, {
      pharmacyStatus: 'dispensed',
      dispensedAt:    pharmacyPrescription.dispensedAt,
      dispensedBy:    req.user._id,
    });

    // ── Always create PharmacyBill (even if all lines are unavailable)
    const originalRx = await Prescription.findById(pharmacyPrescription.prescriptionId).select('channelingNo');
    const subtotal   = billLines.reduce((sum, l) => sum + l.lineTotal, 0);
    const billNumber = await PharmacyBill.generateBillNumber();

    const bill = await PharmacyBill.create({
      billNumber,
      pharmacyPrescriptionId: pharmacyPrescription._id,
      prescriptionRef:        pharmacyPrescription.prescriptionRef,
      patientName:            pharmacyPrescription.patientName,
      patientId:              pharmacyPrescription.patientId || '',
      doctorName:             pharmacyPrescription.doctorName,
      channelingNo:           originalRx?.channelingNo || '',

      // Dispensed items + their totals
      lines:       billLines,
      subtotal:    Math.round(subtotal * 100) / 100,
      discount:    0,
      totalAmount: Math.round(subtotal * 100) / 100,

      // Unavailable items — listed on bill, no cost
      unavailableLines,
      hasUnavailable: unavailableLines.length > 0,

      paymentStatus: subtotal > 0 ? 'unpaid' : 'no_charge',

      // Notes — general note OR auto-flag when drugs are missing
      hasNote:     !!(pharmacyPrescription.generalNote?.trim()) || unavailableLines.length > 0,
      noteContent: pharmacyPrescription.generalNote || '',

      createdBy: req.user._id,
    });

    // Return populated prescription + bill
    const populated = await PharmacyPrescription.findById(pharmacyPrescription._id)
      .populate('pharmacistId', 'name')
      .populate('lines.drugId', 'drugId name brand form strength unit unitPrice');

    res.status(200).json({
      success: true,
      message: 'Prescription dispensed and bill sent to cashier',
      pharmacyPrescription: populated,
      bill,
    });
  } catch (error) {
    console.error('dispensePrescription error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


// ── GET ALL pharmacy prescriptions ────────────────────────────
// GET /api/pharmacy
export const getAllPharmacyPrescriptions = async (req, res) => {
  try {
    const { status, patientId, limit = 100 } = req.query;

    // Auto-pull any doctor prescriptions not yet in queue
    const pendingDoctorRx = await Prescription.find({ pharmacyStatus: 'pending' });
    for (const rx of pendingDoctorRx) {
      const exists = await PharmacyPrescription.findOne({ prescriptionId: rx._id });
      if (!exists) {
        const lines = (rx.medications || []).map((med) => ({
          medicationName: med.name,
          dosage:         med.dosage || '',
          duration:       med.duration || '',
          drugId:         null,
          qtyToDispense:  0,
          availability:   'available',
          pharmacistNote: '',
          stockDeducted:  false,
        }));
        await PharmacyPrescription.create({
          prescriptionId:  rx._id,
          prescriptionRef: rx.prescriptionId,
          patientName:     rx.patientName,
          patientId:       rx.patientId || '',
          doctorName:      rx.doctorName,
          lines,
          status:          'pending',
        });
      }
    }

    const filter = {};
    if (status    && status !== 'all') filter.status    = status;
    if (patientId)                     filter.patientId = patientId;

    const list = await PharmacyPrescription.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('pharmacistId', 'name')
      .populate('lines.drugId', 'drugId name brand form strength unit unitPrice');

    res.status(200).json({
      success: true,
      count: list.length,
      prescriptions: list,
      pharmacyPrescriptions: list,
    });
  } catch (error) {
    console.error('getAllPharmacyPrescriptions error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


// ── GET single pharmacy prescription ─────────────────────────
// GET /api/pharmacy/:id
export const getPharmacyPrescription = async (req, res) => {
  try {
    // Guard: reject non-ObjectId strings before Mongoose throws CastError
    if (!/^[a-f\d]{24}$/i.test(req.params.id))
      return res.status(400).json({ success: false, message: `Invalid id: "${req.params.id}"` });

    const pharmacyPrescription = await PharmacyPrescription.findById(req.params.id)
      .populate('prescriptionId')
      .populate('pharmacistId', 'name')
      .populate('lines.drugId', 'drugId name brand form strength unit unitPrice');

    if (!pharmacyPrescription)
      return res.status(404).json({ success: false, message: 'Pharmacy prescription not found' });

    res.status(200).json({ success: true, pharmacyPrescription });
  } catch (error) {
    console.error('getPharmacyPrescription error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


// ── GET by reference ─────────────────────────────────────────
// GET /api/pharmacy/ref/:ref
export const getPharmacyPrescriptionByRef = async (req, res) => {
  try {
    const pharmacyPrescription = await PharmacyPrescription.findOne({
      prescriptionRef: req.params.ref,
    })
      .populate('prescriptionId')
      .populate('pharmacistId', 'name')
      .populate('lines.drugId', 'drugId name brand form strength unit unitPrice');

    if (!pharmacyPrescription)
      return res.status(404).json({ success: false, message: 'No pharmacy record for this reference' });

    res.status(200).json({ success: true, pharmacyPrescription });
  } catch (error) {
    console.error('getPharmacyPrescriptionByRef error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


// ── CANCEL pharmacy prescription ─────────────────────────────
// PATCH /api/pharmacy/:id/cancel
export const cancelPharmacyPrescription = async (req, res) => {
  try {
    const pharmacyPrescription = await PharmacyPrescription.findById(req.params.id);
    if (!pharmacyPrescription)
      return res.status(404).json({ success: false, message: 'Pharmacy prescription not found' });

    if (pharmacyPrescription.status === 'dispensed')
      return res.status(400).json({ success: false, message: 'Cannot cancel — already dispensed' });

    pharmacyPrescription.status = 'cancelled';
    await pharmacyPrescription.save();

    await Prescription.findByIdAndUpdate(pharmacyPrescription.prescriptionId, {
      pharmacyStatus: 'cancelled',
    });

    res.status(200).json({
      success: true,
      message: 'Prescription cancelled',
      pharmacyPrescription,
    });
  } catch (error) {
    console.error('cancelPharmacyPrescription error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


// ── PHARMACY DASHBOARD ────────────────────────────────────────
// GET /api/pharmacy/dashboard
export const getPharmacyDashboard = async (req, res) => {
  try {
    const now   = new Date();
    const today = new Date(now); today.setHours(0,0,0,0);
    const todayEnd = new Date(now); todayEnd.setHours(23,59,59,999);

    const [pending, inReview, partiallyAvailable, dispensedToday, cancelled] = await Promise.all([
      PharmacyPrescription.countDocuments({ status: 'pending' }),
      PharmacyPrescription.countDocuments({ status: 'in_review' }),
      PharmacyPrescription.countDocuments({ status: 'partially_available' }),
      PharmacyPrescription.countDocuments({ status: 'dispensed', dispensedAt: { $gte: today, $lte: todayEnd } }),
      PharmacyPrescription.countDocuments({ status: 'cancelled' }),
    ]);

    // Active queue — pending + in_review + partially_available, newest first
    const pendingQueue = await PharmacyPrescription.find({
      status: { $in: ['pending', 'in_review', 'partially_available'] },
    })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate('lines.drugId', 'name strength form unit unitPrice');

    res.status(200).json({
      success: true,
      dashboard: {
        prescriptionQueue: {
          pending, inReview, partiallyAvailable, dispensedToday, cancelled,
          pendingQueue,
        },
      },
    });
  } catch (error) {
    console.error('getPharmacyDashboard error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
// ── GET PHARMACY NOTIFICATIONS ────────────────────────────────
// GET /api/pharmacy/notifications
// Returns:
//   - Pending prescriptions (not yet dispensed)
//   - Low stock drugs (below threshold)
//   - Recently dispensed items
export const getPharmacyNotifications = async (req, res) => {
  try {
    const LOW_STOCK_THRESHOLD = 20; // Alert if stock < 20 units

    // 1. Get pending/in-review prescriptions
    const pendingPrescriptions = await PharmacyPrescription.find({
      status: { $in: ["pending", "in_review", "partially_available"] },
    })
      .select("prescriptionRef patientName status createdAt lines")
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("lines.drugId", "name strength form unit");

    // 2. Get low stock drugs
    const lowStockDrugs = await DrugStock.aggregate([
      {
        $match: {
          quantity: { $lt: LOW_STOCK_THRESHOLD },
        },
      },
      {
        $lookup: {
          from: "drugs",
          localField: "drugId",
          foreignField: "_id",
          as: "drug",
        },
      },
      {
        $unwind: "$drug",
      },
      {
        $project: {
          drugName: "$drug.name",
          strength: "$drug.strength",
          form: "$drug.form",
          unit: "$drug.unit",
          quantity: 1,
          batchNo: 1,
          expiryDate: 1,
          unitPrice: 1,
        },
      },
      {
        $sort: { quantity: 1 },
      },
      {
        $limit: 10,
      },
    ]);

    // 3. Format notifications
    const prescriptionNotifications = pendingPrescriptions.map((rx) => ({
      type: "prescription",
      id: rx._id,
      ref: rx.prescriptionRef,
      message: `${rx.patientName} - ${rx.prescriptionRef}`,
      details: `${rx.lines?.length || 0} medications`,
      status: rx.status,
      time: rx.createdAt,
      icon: "💊",
    }));

    const stockNotifications = lowStockDrugs.map((drug) => ({
      type: "low_stock",
      id: drug._id,
      drugName: drug.drugName,
      message: `${drug.drugName} ${drug.strength || ""}`.trim(),
      details: `${drug.quantity} ${drug.unit} remaining`,
      quantity: drug.quantity,
      expiryDate: drug.expiryDate,
      icon: "⚠️",
      time: new Date(),
    }));

    // Combine all notifications, sorted by time (newest first)
    const allNotifications = [
      ...prescriptionNotifications,
      ...stockNotifications,
    ].sort((a, b) => new Date(b.time) - new Date(a.time));

    res.status(200).json({
      success: true,
      notifications: allNotifications,
      summary: {
        pendingPrescriptions: pendingPrescriptions.length,
        lowStockItems: lowStockDrugs.length,
        total: allNotifications.length,
      },
    });
  } catch (error) {
    console.error("getPharmacyNotifications error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
