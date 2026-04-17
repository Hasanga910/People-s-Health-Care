import PharmacyBill from '../models/Pharmacybill.js';

// ── GET ALL bills ────────────────────────────────────────────
// GET /api/bills
// Query: status (unpaid|paid|all), search, limit
export const getAllBills = async (req, res) => {
  try {
    const { status, search, limit = 200 } = req.query;

    const filter = {};
    if (status && status !== 'all') {
      if (status === 'unpaid') filter.paymentStatus = 'unpaid';
      else if (status === 'paid') filter.paymentStatus = 'paid';
      else if (status === 'no_charge') filter.paymentStatus = 'no_charge';
      else filter.paymentStatus = status;
    }
    if (search) {
      filter.$or = [
        { patientName:    { $regex: search, $options: 'i' } },
        { billNumber:     { $regex: search, $options: 'i' } },
        { prescriptionRef:{ $regex: search, $options: 'i' } },
      ];
    }

    const bills = await PharmacyBill.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('createdBy', 'name')
      .populate('collectedBy', 'name');

    const totals = await PharmacyBill.aggregate([
      { $group: {
        _id: '$paymentStatus',
        count: { $sum: 1 },
        amount: { $sum: '$totalAmount' },
      }},
    ]);

    const summary = { unpaidCount: 0, unpaidAmount: 0, paidCount: 0, paidAmount: 0, noChargeCount: 0 };
    for (const t of totals) {
      if (t._id === 'unpaid')    { summary.unpaidCount   = t.count; summary.unpaidAmount = t.amount; }
      if (t._id === 'paid')      { summary.paidCount     = t.count; summary.paidAmount   = t.amount; }
      if (t._id === 'no_charge') { summary.noChargeCount = t.count; }
    }

    res.status(200).json({ success: true, bills, summary });
  } catch (error) {
    console.error('getAllBills error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


// ── GET single bill ─────────────────────────────────────────
// GET /api/bills/:id
export const getBill = async (req, res) => {
  try {
    const bill = await PharmacyBill.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('collectedBy', 'name')
      .populate('lines.drugId', 'name brand form strength');

    if (!bill)
      return res.status(404).json({ success: false, message: 'Bill not found' });

    res.status(200).json({ success: true, bill });
  } catch (error) {
    console.error('getBill error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


// ── MARK PAID ────────────────────────────────────────────────
// PATCH /api/bills/:id/pay
// Body: { paymentMethod: 'Cash' | 'Card' | 'Online', discount? }
export const markBillPaid = async (req, res) => {
  try {
    const { paymentMethod, discount = 0 } = req.body;

    if (!paymentMethod)
      return res.status(400).json({ success: false, message: 'paymentMethod is required' });

    const bill = await PharmacyBill.findById(req.params.id);
    if (!bill)
      return res.status(404).json({ success: false, message: 'Bill not found' });

    if (bill.paymentStatus === 'paid')
      return res.status(400).json({ success: false, message: 'Bill already paid' });
    if (bill.paymentStatus === 'no_charge')
      return res.status(400).json({ success: false, message: 'No charge — all drugs unavailable' });

    bill.paymentStatus = 'paid';
    bill.paymentMethod = paymentMethod;
    bill.paidAt        = new Date();
    bill.collectedBy   = req.user._id;
    bill.discount      = Number(discount) || 0;
    bill.totalAmount   = Math.max(0, bill.subtotal - bill.discount);
    await bill.save();

    res.status(200).json({ success: true, message: 'Payment recorded', bill });
  } catch (error) {
    console.error('markBillPaid error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};