import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // Display ID (auto-generated)
  userId: {
    type: String,
    required: true,
    unique: true,
  },

  // Role - determines portal access
  role: {
    type: String,
    required: true,
    enum: ['doctor', 'patient', 'lab', 'pharmacy', 'cashier', 'admin'],
  },

  // ══════════════════════════════════════════════════════════════
  // COMMON ATTRIBUTES (All users)
  // ══════════════════════════════════════════════════════════════

  name: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  passwordHash: {
    type: String,
    required: true,
    select: false,
  },

  telephone: {
    type: String,
    required: true,
  },

  photo: {
    type: String,
    default: null,
  },

  isActive: {
    type: Boolean,
    default: true,
  },

  // ══════════════════════════════════════════════════════════════
  // PATIENT-SPECIFIC ATTRIBUTES
  // ══════════════════════════════════════════════════════════════

  patientDetails: {
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
    },
    birthday: Date,
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
    },
    allergies: [String],
    chronicConditions: {
      type: String,
      default: null,
    },
    currentMedications: {
      type: String,
      default: null,
    },
    emergencyContactName: {
      type: String,
      default: null,
    },
    emergencyContactNumber: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      default: null,
    },
  },

  // ══════════════════════════════════════════════════════════════
  // DOCTOR-SPECIFIC ATTRIBUTES
  // ══════════════════════════════════════════════════════════════

  doctorDetails: {
    slmcRegisterNumber: String,
    medicalCenterRegisterNumber: String,
    workingExperience: String,
    certifications: [String],
  },

  // ══════════════════════════════════════════════════════════════
  // SOFT DELETE
  // ══════════════════════════════════════════════════════════════

  deletedAt: {
    type: Date,
    default: null,
  },

}, {
  timestamps: true,
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ userId: 1 });
userSchema.index({ role: 1 });

// PRE-SAVE: Hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// INSTANCE METHOD: Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

// STATIC METHOD: Generate unique userId
userSchema.statics.generateUserId = async function(role) {
  const prefix = {
    doctor: 'DOC',
    patient: 'PAT',
    lab: 'LAB',
    pharmacy: 'PHA',
    cashier: 'CSH',
    admin: 'ADM',
  };

  const year = new Date().getFullYear();
  const lastUser = await this.findOne({ role }).sort({ createdAt: -1 });

  let sequence = 1;
  if (lastUser && lastUser.userId) {
    const parts = lastUser.userId.split('-');
    const lastSeq = parseInt(parts[parts.length - 1]);
    if (!isNaN(lastSeq)) {
      sequence = lastSeq + 1;
    }
  }

  const paddedSeq = String(sequence).padStart(4, '0');

  if (role === 'patient') {
    return `${prefix[role]}-${year}-${paddedSeq}`;
  } else {
    return `${prefix[role]}-${paddedSeq}`;
  }
};

// VIRTUAL: Calculate age from birthday
userSchema.virtual('age').get(function() {
  if (!this.patientDetails?.birthday) return null;
  const today = new Date();
  const birthDate = new Date(this.patientDetails.birthday);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

const User = mongoose.model('User', userSchema);
export default User;