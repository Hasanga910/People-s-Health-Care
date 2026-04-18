import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({

  appointmentId: { type: String, required: true, unique: true },

  patientId:    { type: String, default: null },
  patientName:  { type: String, required: true },
  date:          { type: String, required: true },
  session: {
    type: String,
    required: true,
    enum: ['Morning', 'Evening'],
  },

  channelingNo:  { type: String, default: '' },

  estimatedTime: { type: String, default: '' },

  // ── Status now includes 'In Progress' ──────────────────────
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Cancelled', 'Completed'],
    default: 'Pending',
  },

  // ── Cancellation metadata ──────────────────────────────────
  // Populated only when the appointment is cancelled (either by the
  // patient, or automatically when the doctor marks a holiday).
  //
  // source = 'holiday'  → auto-cancelled because doctor marked the
  //                       session/day as a holiday. Triggers the
  //                       patient-side toast notification.
  // source = 'patient'  → patient self-cancelled from their portal.
  cancellation: {
    source: {
      type: String,
      enum: ['patient', 'holiday', 'system'],
      default: null,
    },
    reason:      { type: String, default: '' },
    cancelledAt: { type: Date,   default: null },
    // Tracks whether the patient has already seen the toast for this
    // cancellation. Flips to true after the first successful poll.
    notifiedAt:  { type: Date,   default: null },
  },

}, { timestamps: true });

appointmentSchema.index({ patientId: 1, createdAt: -1 });
appointmentSchema.index({ date: 1, session: 1 });
appointmentSchema.index({ status: 1 });

appointmentSchema.statics.generateAppointmentId = async function () {
  const year = new Date().getFullYear();
  const last = await this.findOne({
    appointmentId: new RegExp(`^APT-${year}-`)
  }).sort({ createdAt: -1 });

  let seq = 1;
  if (last?.appointmentId) {
    const n = parseInt(last.appointmentId.split('-').pop());
    if (!isNaN(n)) seq = n + 1;
  }
  return `APT-${year}-${String(seq).padStart(4, '0')}`;
};

export default mongoose.model('Appointment', appointmentSchema);