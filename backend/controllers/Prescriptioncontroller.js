import Prescription from '../models/Prescription.js';
import LabRequest    from '../models/LabRequest.js';
import Appointment   from '../models/Appointment.js';   // ← needed to auto-complete appointment

// ── Create prescription (+ optional lab request in one call) ──
export const createPrescription = async (req, res) => {
  try {
    const {
      patientName, patientId, channelingNo,
      appointmentId,          // human-readable e.g. "APT-2026-0001"
      medications, clinicalNotes,
      labTests, labPriority, labNotes,
    } = req.body;

    if (!patientName) return res.status(400).json({ success: false, message: 'Patient name is required' });
    if (!medications?.length) return res.status(400).json({ success: false, message: 'At least one medication is required' });

    const prescriptionId = await Prescription.generatePrescriptionId();

    // If lab tests were included, create a LabRequest first
    let labRequest = null;
    if (labTests?.length > 0) {
      const labRequestId = await LabRequest.generateLabRequestId();
      labRequest = await LabRequest.create({
        labRequestId,
        source: 'from_prescription',
        doctorId:   req.user._id,
        doctorName: req.user.name,
        patientId:  patientId || null,
        patientName,
        channelingNo: channelingNo || '',
        tests:       labTests,
        priority:    labPriority || 'Routine',
        clinicalNotes: labNotes || '',
        status: 'pending',
        prescriptionRef: prescriptionId,
      });
    }

    const prescription = await Prescription.create({
      prescriptionId,
      doctorId:   req.user._id,
      doctorName: req.user.name,
      patientId:  patientId || null,
      patientName,
      channelingNo:  channelingNo  || '',
      appointmentId: appointmentId || null,
      medications,
      clinicalNotes: clinicalNotes || '',
      labRequestId:  labRequest?._id        || null,
      labRequestRef: labRequest?.labRequestId || null,
    });

    // ── Auto-complete the linked appointment ──────────────────
    // When a prescription is issued for an appointment, the consultation
    // is done — move the appointment from "In Progress" → "Completed".
    // We look up by the human-readable appointmentId field (APT-YYYY-NNNN).
    if (appointmentId) {
      try {
        await Appointment.findOneAndUpdate(
          {
            appointmentId,
            status: { $in: ['Pending', 'In Progress'] }, // only update if still active
          },
          { status: 'Completed' }
        );
      } catch (apptErr) {
        // Log but don't fail the whole request — prescription is already saved
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

// ── Get prescriptions (role-filtered) ────────────────────────
// Supports query params:
//   ?pharmacyStatus=pending|dispensed|cancelled
//   ?patientId=...
//   ?limit=50
//   ?recent=true  → only prescriptions from the last 30 minutes (for dashboard)
export const getPrescriptions = async (req, res) => {
  try {
    const { pharmacyStatus, patientId, limit = 50, recent } = req.query;
    const filter = {};
    const role = req.user.role;

    if (role === 'doctor')   filter.doctorId = req.user._id;
    if (role === 'pharmacy' || role === 'cashier')
      filter.pharmacyStatus = pharmacyStatus || { $in: ['pending', 'in_progress', 'dispensed'] };
    if (role === 'patient')  filter.patientId = req.user._id;
    if (role === 'admin' && pharmacyStatus) filter.pharmacyStatus = pharmacyStatus;
    if (patientId) filter.patientId = patientId;

    // ── Dashboard "recent" mode — last 30 minutes ────────────
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

// ── Get single prescription ───────────────────────────────────
export const getPrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const prescription = id.startsWith('RX-')
      ? await Prescription.findOne({ prescriptionId: id })
      : await Prescription.findById(id);
    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found' });
    res.status(200).json({ success: true, prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ── Update pending prescription ───────────────────────────────
export const updatePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found' });
    if (prescription.doctorId.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });
    if (prescription.pharmacyStatus !== 'pending')
      return res.status(400).json({ success: false, message: 'Can only edit pending prescriptions' });

    const { patientName, channelingNo, appointmentId, medications, clinicalNotes, labTests, labPriority, labNotes } = req.body;

    if (patientName)           prescription.patientName = patientName;
    if (channelingNo !== undefined) prescription.channelingNo = channelingNo;
    if (appointmentId !== undefined) prescription.appointmentId = appointmentId || null;  // ← NEW
    if (medications?.length)   prescription.medications = medications;
    if (clinicalNotes !== undefined) prescription.clinicalNotes = clinicalNotes;

    if (labTests !== undefined) {
      if (prescription.labRequestId) {
        if (labTests.length === 0) {
          await LabRequest.findByIdAndDelete(prescription.labRequestId);
          prescription.labRequestId  = null;
          prescription.labRequestRef = null;
        } else {
          await LabRequest.findByIdAndUpdate(prescription.labRequestId, {
            tests: labTests,
            priority: labPriority || 'Routine',
            clinicalNotes: labNotes || '',
          });
        }
      } else if (labTests.length > 0) {
        const labRequestId = await LabRequest.generateLabRequestId();
        const lr = await LabRequest.create({
          labRequestId,
          source: 'from_prescription',
          doctorId:   req.user._id,
          doctorName: req.user.name,
          patientId:  prescription.patientId,
          patientName: prescription.patientName,
          channelingNo: prescription.channelingNo,
          tests:       labTests,
          priority:    labPriority || 'Routine',
          clinicalNotes: labNotes || '',
          status: 'pending',
          prescriptionRef: prescription.prescriptionId,
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

// ── Pharmacy: mark in progress (pharmacy has started preparing) ──
export const markInProgress = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found' });
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

// ── Pharmacy: mark dispensed ──────────────────────────────────
export const markDispensed = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found' });
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
export const cancelPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found' });
    if (prescription.doctorId.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });
    if (prescription.pharmacyStatus === 'dispensed')
      return res.status(400).json({ success: false, message: 'Cannot cancel — already dispensed' });
    if (prescription.pharmacyStatus === 'in_progress')
      return res.status(400).json({ success: false, message: 'Cannot cancel — pharmacy has started preparing this prescription' });

    await prescription.deleteOne();
    res.status(200).json({ success: true, message: 'Prescription deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};