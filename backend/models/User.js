import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  role: {
    type: String,
    required: true,
    enum: ['doctor', 'patient', 'lab', 'pharmacy', 'cashier', 'admin'],
  },

  // ── Common fields ──────────────────────────────────────
  name:         { type: String, required: true, trim: true },
  email:        { type: String, default: null, lowercase: true, trim: true, sparse: true },
  // email is now OPTIONAL — null for username-based patients
  // sparse: true means the unique index ignores null values
  // so multiple patients can have null email without conflict

  username:     { type: String, default: null, lowercase: true, trim: true, sparse: true },
  // username used instead of email for patients without email
  // also sparse: true so multiple nulls are allowed
  // only one of email OR username will be set per patient

  passwordHash: { type: String, required: true, select: false },
  telephone:    { type: String, required: true },
  photo:        { type: String, default: null },
  isActive:     { type: Boolean, default: true },

  // ── Patient-specific ───────────────────────────────────
  patientDetails: {
    type: {
      gender:                 { type: String, enum: ['Male', 'Female', 'Other'] },
      birthday:               Date,
      bloodGroup:             { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'] },
      allergies:              [String],
      chronicConditions:      String,
      currentMedications:     String,
      emergencyContactName:   String,
      emergencyContactNumber: String,
      address:                String,
    },
    default: undefined,
  },

  // ── Doctor-specific ────────────────────────────────────
  doctorDetails: {
    type: {
      slmcRegisterNumber: String,
      workingExperience:  String,
      certifications:     [String],
    },
    default: undefined,
  },

}, { timestamps: true });

// ── Indexes ────────────────────────────────────────────────
userSchema.index({ role: 1 });
userSchema.index({ email: 1 }, { sparse: true, unique: true });
userSchema.index({ username: 1 }, { sparse: true, unique: true });
// sparse unique indexes allow multiple null values
// but reject duplicate non-null values

// ── Hash password before save ──────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// ── Compare password ───────────────────────────────────────
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

// ── Auto-generate userId ───────────────────────────────────
userSchema.statics.generateUserId = async function (role) {
  const prefix = {
    doctor: 'DOC', patient: 'PAT', lab: 'LAB',
    pharmacy: 'PHA', cashier: 'CSH', admin: 'ADM'
  };
  const year = new Date().getFullYear();
  const lastUser = await this.findOne({ role }).sort({ createdAt: -1 });
  let sequence = 1;
  if (lastUser?.userId) {
    const lastSeq = parseInt(lastUser.userId.split('-').pop());
    if (!isNaN(lastSeq)) sequence = lastSeq + 1;
  }
  const paddedSeq = String(sequence).padStart(4, '0');
  return role === 'patient'
    ? `${prefix[role]}-${year}-${paddedSeq}`
    : `${prefix[role]}-${paddedSeq}`;
};

// ── Virtual: age ───────────────────────────────────────────
userSchema.virtual('age').get(function () {
  if (!this.patientDetails?.birthday) return null;
  const today = new Date();
  const birth = new Date(this.patientDetails.birthday);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
});

// ── Virtual: loginIdentifier ───────────────────────────────
// Returns whichever identifier the patient uses to login
userSchema.virtual('loginIdentifier').get(function () {
  return this.email || this.username || '';
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

export default mongoose.model('User', userSchema);