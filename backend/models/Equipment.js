import mongoose from 'mongoose';

// ── Maintenance History sub-document ──────────────────────────
const maintenanceRecordSchema = new mongoose.Schema({
  maintenance_id: {
    type: String,
    default: () => 'MNT-' + Date.now().toString(36).toUpperCase()
  },
  maintenance_date: { type: Date, required: true, default: Date.now },
  description:      { type: String, required: true },
  next_due_date:    { type: Date },
  technician:       { type: String, required: true },
  cost:             { type: Number, min: 0, default: 0 },
  type: {
    type: String,
    enum: ['Routine', 'Repair', 'Calibration', 'Inspection', 'Emergency'],
    default: 'Routine'
  },
  notes:       { type: String },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { _id: true, timestamps: true });

// ── Main Equipment Schema ─────────────────────────────────────
const equipmentSchema = new mongoose.Schema({
  equipment_id: {
    type: String,
    unique: true,
    default: () => 'EQ-' + Date.now().toString(36).toUpperCase()
  },
  name: {
    type: String,
    required: [true, 'Equipment name is required'],
    trim: true
  },
  model:          { type: String, trim: true },
  manufacturer:   { type: String, trim: true },
  specifications: { type: String, maxlength: 2000 },
  category: {
    type: String,
    enum: ['Medical Devices', 'Diagnostic Equipment', 'Surgical Instruments', 'Lab Equipment', 'Monitoring', 'Other'],
    default: 'Lab Equipment'
  },
  serialNumber:     { type: String, unique: true, sparse: true, trim: true },
  acquisition_date: { type: Date },
  purchase_cost:    { type: Number, min: 0, default: 0 },
  location:         { type: String, trim: true },

  // ── Equipment Status (lab-controlled) ─────────────────────
  status: {
    type: String,
    enum: ['Available', 'In Use', 'Needs Attention', 'Under Maintenance', 'Retired'],
    default: 'Available'
  },

  // ── Maintenance Status (admin-controlled) ─────────────────
  maintenanceStatus: {
    type: String,
    enum: ['Good', 'Under Maintenance', 'Retired'],
    default: 'Good'
  },

  // ── Tracking flags ────────────────────────────────────────
  issueReportedByLab:    { type: Boolean, default: false },
  statusReportedAt:      { type: Date, default: null },  // timestamp when lab last changed status
  labAvailableNotification: { type: Boolean, default: false },
  pendingMaintenanceRecord: { type: Boolean, default: false },

  // Sent when admin retires equipment — shown in red on lab side
  labRetiredNotification: { type: Boolean, default: false },

  lastMaintenanceDate: { type: Date },
  nextMaintenanceDate: { type: Date },
  warrantyExpiry:      { type: Date },

  // ── Replacement alert settings ────────────────────────────
  replacementAlertThreshold: { type: Number, default: 5, min: 1 },
  replacementAlertEnabled:   { type: Boolean, default: true },
  replacementAlertDismissed: { type: Boolean, default: false },

  maintenanceHistory: [maintenanceRecordSchema],

  // notes field removed per REQ-1
  isActive:  { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// ── Indexes ───────────────────────────────────────────────────
equipmentSchema.index({ name: 1, status: 1 });
equipmentSchema.index({ nextMaintenanceDate: 1 });
equipmentSchema.index({ equipment_id: 1 });

// ── Virtual: replacement alert triggered? ─────────────────────
equipmentSchema.virtual('replacementAlertTriggered').get(function () {
  if (!this.replacementAlertEnabled || this.replacementAlertDismissed) return false;
  return this.maintenanceHistory.length >= this.replacementAlertThreshold;
});

// ── Virtual: maintenance overdue ─────────────────────────────
equipmentSchema.virtual('isMaintenanceOverdue').get(function () {
  if (!this.nextMaintenanceDate) return false;
  return new Date() > this.nextMaintenanceDate;
});

equipmentSchema.set('toJSON',   { virtuals: true });
equipmentSchema.set('toObject', { virtuals: true });

export default mongoose.model('Equipment', equipmentSchema);
