import Prescription from '../models/Prescription.js';
import LabRequest    from '../models/LabRequest.js';
import Appointment   from '../models/Appointment.js';
import PDFDocument   from 'pdfkit';
import User          from '../models/User.js';

// ── Clinic details ─────────────────────────────────────────
const CLINIC = {
  name:    "People's Health Care",
  doctor:  'Dr. M.T.D Jayaweera',
  quals:   'MBBS (Sri Lanka)',
  slmc:    'SLMC Reg No- 14508',
  address: 'No. 123, Akuressa Road, Isadeen Town, Matara.',
  tel:     'Tele - 041 2221761',
};

// ── Create prescription ────────────────────────────────────
export const createPrescription = async (req, res) => {
  try {
    const {
      patientName, patientId,
      appointmentId,
      medications, clinicalNotes,
      labTests, labPriority, labNotes,
    } = req.body;

    if (!patientName)
      return res.status(400).json({ success: false, message: 'Patient name is required' });
    if (!medications?.length)
      return res.status(400).json({ success: false, message: 'At least one medication is required' });

    const prescriptionId = await Prescription.generatePrescriptionId();

    let labRequest = null;
    if (labTests?.length > 0) {
      const labRequestId = await LabRequest.generateLabRequestId();
      labRequest = await LabRequest.create({
        labRequestId,
        source: 'from_prescription',
        doctorId:     req.user._id,
        doctorName:   req.user.name,
        patientId:    patientId || null,
        patientName,
        tests:        labTests,
        priority:     labPriority || 'Routine',
        clinicalNotes: labNotes || '',
        status: 'pending',
        prescriptionRef: prescriptionId,
      });
    }

    const prescription = await Prescription.create({
      prescriptionId,
      doctorId:      req.user._id,
      doctorName:    req.user.name,
      patientId:     patientId || null,
      patientName,
      appointmentId: appointmentId || null,
      medications,
      clinicalNotes: clinicalNotes || '',
      labRequestId:  labRequest?._id         || null,
      labRequestRef: labRequest?.labRequestId || null,
    });

    if (appointmentId) {
      try {
        await Appointment.findOneAndUpdate(
          { appointmentId, status: { $in: ['Pending', 'In Progress'] } },
          { status: 'Completed' }
        );
      } catch (apptErr) {
        console.warn('Could not auto-complete appointment:', apptErr.message);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      prescription,
      labRequest: labRequest || null,
    });

  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ── Get prescriptions (role-filtered) ─────────────────────
export const getPrescriptions = async (req, res) => {
  try {
    const { pharmacyStatus, patientId, appointmentId, limit = 50, recent } = req.query;
    const filter = {};
    const role   = req.user.role;

    if (role === 'doctor')
      filter.doctorId = req.user._id;

    if (role === 'pharmacy' || role === 'cashier')
      filter.pharmacyStatus = pharmacyStatus || { $in: ['pending', 'in_progress', 'dispensed'] };

    // ── FIXED: patient filter uses userId string not ObjectId ──
    if (role === 'patient')
      filter.patientId = req.user.userId;
    // req.user.userId is the string "PAT-2026-0001"
    // Prescriptions store patientId as a string so this must match exactly

    if (role === 'admin' && pharmacyStatus)
      filter.pharmacyStatus = pharmacyStatus;

    if (patientId)     filter.patientId     = patientId;
    if (appointmentId) filter.appointmentId = appointmentId;

    if (recent === 'true') {
      const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
      filter.createdAt = { $gte: thirtyMinAgo };
    }

    const prescriptions = await Prescription.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({ success: true, count: prescriptions.length, prescriptions });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ── Get single prescription ────────────────────────────────
export const getPrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const prescription = id.startsWith('RX-')
      ? await Prescription.findOne({ prescriptionId: id })
      : await Prescription.findById(id);
    if (!prescription)
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    res.status(200).json({ success: true, prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ── Update pending prescription ────────────────────────────
export const updatePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription)
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    if (prescription.doctorId.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });
    if (prescription.pharmacyStatus !== 'pending')
      return res.status(400).json({ success: false, message: 'Can only edit pending prescriptions' });

    const { patientName, appointmentId, medications, clinicalNotes, labTests, labPriority, labNotes } = req.body;

    if (patientName)   prescription.patientName  = patientName;
    if (appointmentId !== undefined) prescription.appointmentId = appointmentId || null;
    if (medications?.length) prescription.medications = medications;
    if (clinicalNotes !== undefined) prescription.clinicalNotes = clinicalNotes;

    if (labTests !== undefined) {
      if (prescription.labRequestId) {
        if (labTests.length === 0) {
          await LabRequest.findByIdAndDelete(prescription.labRequestId);
          prescription.labRequestId  = null;
          prescription.labRequestRef = null;
        } else {
          await LabRequest.findByIdAndUpdate(prescription.labRequestId, {
            tests: labTests, priority: labPriority || 'Routine', clinicalNotes: labNotes || '',
          });
        }
      } else if (labTests.length > 0) {
        const labRequestId = await LabRequest.generateLabRequestId();
        const lr = await LabRequest.create({
          labRequestId, source: 'from_prescription',
          doctorId: req.user._id, doctorName: req.user.name,
          patientId: prescription.patientId, patientName: prescription.patientName,
          tests: labTests,
          priority: labPriority || 'Routine', clinicalNotes: labNotes || '',
          status: 'pending', prescriptionRef: prescription.prescriptionId,
        });
        prescription.labRequestId  = lr._id;
        prescription.labRequestRef = lr.labRequestId;
      }
    }

    await prescription.save();
    res.status(200).json({ success: true, message: 'Prescription updated', prescription });

  } catch (error) {
    console.error('Update prescription error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ── Mark in progress ───────────────────────────────────────
export const markInProgress = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription)
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    if (prescription.pharmacyStatus === 'dispensed')
      return res.status(400).json({ success: false, message: 'Already dispensed' });
    if (prescription.pharmacyStatus === 'in_progress')
      return res.status(400).json({ success: false, message: 'Already in progress' });
    prescription.pharmacyStatus = 'in_progress';
    await prescription.save();
    res.status(200).json({ success: true, message: 'Marked as in progress', prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ── Mark dispensed ─────────────────────────────────────────
export const markDispensed = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription)
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    if (prescription.pharmacyStatus === 'dispensed')
      return res.status(400).json({ success: false, message: 'Already dispensed' });
    prescription.pharmacyStatus = 'dispensed';
    prescription.dispensedAt    = new Date();
    prescription.dispensedBy    = req.user._id;
    await prescription.save();
    res.status(200).json({ success: true, message: 'Marked as dispensed', prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ── Cancel prescription ───────────────────────────────────────
// ── Doctor: cancel (hard delete) ─────────────────────────────
// Removes the prescription entirely from the DB.
// Blocked if the pharmacy has already dispensed or started preparing.
// Optional body flag: { cancelLabToo: true } → also deletes the linked lab request if it's still pending.
export const cancelPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription)
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    if (prescription.doctorId.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });
    if (prescription.pharmacyStatus === 'dispensed')
      return res.status(400).json({ success: false, message: 'Cannot cancel — already dispensed' });
    if (prescription.pharmacyStatus === 'in_progress')
      return res.status(400).json({ success: false, message: 'Cannot cancel — pharmacy has started preparing' });

    let labCancelled = false;
    if (req.body?.cancelLabToo && prescription.labRequestId) {
      const labRequest = await LabRequest.findById(prescription.labRequestId);
      if (labRequest?.status === 'pending') {
        await labRequest.deleteOne();
        labCancelled = true;
      }
    }

    let labCancelled = false;

    // Optionally delete the linked lab request too
    if (req.body?.cancelLabToo && prescription.labRequestId) {
      const labRequest = await LabRequest.findById(prescription.labRequestId);
      if (labRequest) {
        if (labRequest.status === 'pending') {
          await labRequest.deleteOne();
          labCancelled = true;
        }
        // If lab is already in_progress or completed, we skip silently —
        // the prescription is still deleted but the lab request stays
      }
    }

    await prescription.deleteOne();
    res.status(200).json({
      success: true,
      message: 'Prescription deleted',
      labCancelled,  // frontend uses this to update its state
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
