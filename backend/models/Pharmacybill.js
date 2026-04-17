import mongoose from 'mongoose';

// ── Bill line: one per DISPENSED medication ───────────────────
const billLineSchema = new mongoose.Schema({
  medicationName: { type: String, required: true },
  drugId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Drug', default: null },
  qtyDispensed:   { type: Number, required: true, min: 0 },
  unitPrice:      { type: Number, required: true, min: 0 },
  lineTotal:      { type: Number, required: true, min: 0 },
  stockEntries:   [{ stockId: String, deducted: Number }], // FEFO trail
}, { _id: true });

// ── Unavailable line: out_of_stock / not_in_formulary ─────────
const unavailableLineSchema = new mongoose.Schema({
  medicationName:  { type: String, required: true },
  dosage:          { type: String, default: '' },
  duration:        { type: String, default: '' },
  availability:    { type: String, default: 'out_of_stock' }, // out_of_stock | not_in_formulary
  pharmacistNote:  { type: String, default: '' },
}, { _id: true });

// ── Main bill schema ───────────────────────────────────────────
const pharmacyBillSchema = new mongoose.Schema({
  // Auto-generated bill number e.g. BILL-2026-0001
  billNumber: { type: String, required: true, unique: true },

  // Links
  pharmacyPrescriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PharmacyPrescription',
    required: true,
    unique: true, // one bill per pharmacy prescription
  },
  prescriptionRef: { type: String, required: true }, // RX-2026-0001
  patientName:     { type: String, required: true },
  patientId:       { type: String, default: '' },
  doctorName:      { type: String, required: true },
  channelingNo:    { type: String, default: '' },

  // Dispensed items (available lines)
  lines: { type: [billLineSchema], default: [] },

  // Unavailable items — listed on bill for cashier/patient awareness
  unavailableLines: { type: [unavailableLineSchema], default: [] },

  // True if ANY unavailable lines exist (quick flag for cashier dashboard)
  hasUnavailable: { type: Boolean, default: false },

  // Totals
  subtotal:    { type: Number, required: true, default: 0 },
  discount:    { type: Number, default: 0 },
  totalAmount: { type: Number, required: true, default: 0 },

  // Payment
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'no_charge'],
    default: 'unpaid',
  },
  paymentMethod: { type: String, default: '' },
  paidAt:        { type: Date, default: null },
  collectedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  // Note highlight flag — if prescription had a generalNote, flag for cashier
  hasNote:       { type: Boolean, default: false },
  noteContent:   { type: String, default: '' },

  // Who created the bill
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

}, { timestamps: true });

// ── Indexes ───────────────────────────────────────────────────
pharmacyBillSchema.index({ paymentStatus: 1 });
pharmacyBillSchema.index({ patientId: 1 });
pharmacyBillSchema.index({ createdAt: -1 });

// ── Auto-generate billNumber ──────────────────────────────────
pharmacyBillSchema.statics.generateBillNumber = async function () {
  const year = new Date().getFullYear();
  const last = await this.findOne({ billNumber: new RegExp(`^BILL-${year}-`) }).sort({ createdAt: -1 });
  let seq = 1;
  if (last?.billNumber) {
    const n = parseInt(last.billNumber.split('-').pop());
    if (!isNaN(n)) seq = n + 1;
  }
  return `BILL-${year}-${String(seq).padStart(4, '0')}`;
};

export default mongoose.model('PharmacyBill', pharmacyBillSchema);
