import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

// ── Validation helpers ─────────────────────────────────────
const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
const isValidPhone = (val) => /^\d{10}$/.test(val);
const isValidPassword = (val) => /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/.test(val);
const isValidUsername = (val) => /^[a-zA-Z0-9_]{3,30}$/.test(val);
// username: 3-30 chars, letters/numbers/underscore only

// ── Register ───────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const {
      name, email, username, password, telephone,
      gender, dateOfBirth, bloodGroup,
      allergies, chronicConditions, currentMedications,
      emergencyContactName, emergencyContactNumber, address,
    } = req.body;

    // ── Required fields ──────────────────────────────────
    if (!name || !password || !telephone)
      return res.status(400).json({
        success: false,
        message: 'Name, password and telephone are required',
      });

    // ── Must have either email OR username ────────────────
    if (!email && !username)
      return res.status(400).json({
        success: false,
        message: 'Either email address or username is required',
      });

    // ── Email validation ──────────────────────────────────
    if (email) {
      if (!isValidEmail(email))
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid email address (must contain @ and .)',
        });
      if (await User.findOne({ email: email.toLowerCase() }))
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists',
        });
    }

    // ── Username validation ───────────────────────────────
    if (username) {
      if (!isValidUsername(username))
        return res.status(400).json({
          success: false,
          message: 'Username must be 3-30 characters, letters/numbers/underscore only',
        });
      if (await User.findOne({ username: username.toLowerCase() }))
        return res.status(400).json({
          success: false,
          message: 'This username is already taken',
        });
    }

    // ── Password validation ───────────────────────────────
    if (!isValidPassword(password))
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters with a mix of letters and numbers',
      });

    // ── Phone validation ──────────────────────────────────
    if (!isValidPhone(telephone))
      return res.status(400).json({
        success: false,
        message: 'Telephone must be exactly 10 digits',
      });

    // ── Emergency contact phone validation ────────────────
    if (emergencyContactNumber && !isValidPhone(emergencyContactNumber))
      return res.status(400).json({
        success: false,
        message: 'Emergency contact number must be exactly 10 digits',
      });

    // ── Birthday validation ───────────────────────────────
    if (dateOfBirth) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const bday = new Date(dateOfBirth);
      if (bday >= today)
        return res.status(400).json({
          success: false,
          message: 'Date of birth must be before today',
        });
    }

    // ── Build patientDetails ──────────────────────────────
    const patientDetails = {};
    if (gender)               patientDetails.gender             = gender;
    if (dateOfBirth)          patientDetails.birthday           = dateOfBirth;
    if (bloodGroup)           patientDetails.bloodGroup         = bloodGroup;
    if (chronicConditions)    patientDetails.chronicConditions  = chronicConditions;
    if (currentMedications)   patientDetails.currentMedications = currentMedications;
    if (emergencyContactName) patientDetails.emergencyContactName = emergencyContactName;
    if (emergencyContactNumber) patientDetails.emergencyContactNumber = emergencyContactNumber;
    if (address)              patientDetails.address            = address;
    if (allergies) {
      patientDetails.allergies = Array.isArray(allergies)
        ? allergies
        : allergies.split(',').map(a => a.trim()).filter(Boolean);
    }

    // ── Create user ───────────────────────────────────────
    const user = await User.create({
      userId:       await User.generateUserId('patient'),
      role:         'patient',
      name,
      email:        email ? email.toLowerCase().trim() : null,
      username:     username ? username.toLowerCase().trim() : null,
      passwordHash: password,
      telephone,
      patientDetails,
    });

    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user: buildUserResponse(user),
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message,
    });
  }
};

// ── Login ──────────────────────────────────────────────────
// Accepts email OR username in the "identifier" field
export const login = async (req, res) => {
  try {
    const { identifier, email, password } = req.body;
    // "identifier" is new field that accepts email or username
    // "email" kept for backward compatibility with existing frontend code

    const loginValue = (identifier || email || '').toLowerCase().trim();

    if (!loginValue || !password)
      return res.status(400).json({
        success: false,
        message: 'Please provide your email/username and password',
      });

    // Search by email OR username
    const user = await User.findOne({
      $or: [
        { email: loginValue },
        { username: loginValue },
      ],
    }).select('+passwordHash');

    if (!user)
      return res.status(401).json({
        success: false,
        message: 'Invalid email/username or password',
      });

    if (!await user.comparePassword(password))
      return res.status(401).json({
        success: false,
        message: 'Invalid email/username or password',
      });

    const token = generateToken(user._id);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: buildUserResponse(user),
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message,
    });
  }
};

// ── Get current user ───────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      user: { ...user.toObject(), age: user.age },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// ── Update own profile ─────────────────────────────────────
export const updateMe = async (req, res) => {
  try {
    const {
      telephone, address,
      emergencyContactName, emergencyContactNumber,
      allergies, chronicConditions, currentMedications,
      patientDetails,
      email, username,
      currentPassword, newPassword,
    } = req.body;

    const updates = {};

    // ── Fields patients CAN update ────────────────────────
    if (telephone) {
      if (!isValidPhone(telephone))
        return res.status(400).json({
          success: false,
          message: 'Telephone must be exactly 10 digits',
        });
      updates.telephone = telephone;
    }

    // ── Username → Email upgrade ──────────────────────────
    // Patient registered with username but now has email
    if (email && !req.user.email) {
      if (!isValidEmail(email))
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid email address',
        });
      const taken = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: req.user._id },
      });
      if (taken)
        return res.status(400).json({
          success: false,
          message: 'This email is already in use by another account',
        });
      updates.email = email.toLowerCase().trim();
      // Keep username as well — patient can login with either after upgrade
    }

    // ── Username change (only if no email) ────────────────
    if (username && !req.user.email) {
      if (!isValidUsername(username))
        return res.status(400).json({
          success: false,
          message: 'Username must be 3-30 characters, letters/numbers/underscore only',
        });
      const taken = await User.findOne({
        username: username.toLowerCase(),
        _id: { $ne: req.user._id },
      });
      if (taken)
        return res.status(400).json({
          success: false,
          message: 'This username is already taken',
        });
      updates.username = username.toLowerCase().trim();
    }

    // ── Build patientDetails update ───────────────────────
    // Merge incoming fields with existing — never wipe untouched fields
    const existingDetails = req.user.patientDetails?.toObject?.()
      || req.user.patientDetails || {};

    const incomingDetails = patientDetails || {};

    // Handle allergies conversion if passed as string
    if (incomingDetails.allergies && typeof incomingDetails.allergies === 'string') {
      incomingDetails.allergies = incomingDetails.allergies
        .split(',').map(a => a.trim()).filter(Boolean);
    }

    if (emergencyContactNumber && !isValidPhone(emergencyContactNumber))
      return res.status(400).json({
        success: false,
        message: 'Emergency contact number must be exactly 10 digits',
      });

    updates.patientDetails = { ...existingDetails, ...incomingDetails };

    // ── Password change ───────────────────────────────────
    if (currentPassword && newPassword) {
      if (!isValidPassword(newPassword))
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters with letters and numbers',
        });
      const userWithPw = await User.findById(req.user._id).select('+passwordHash');
      if (!await userWithPw.comparePassword(currentPassword))
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect',
        });
      Object.assign(userWithPw, updates);
      userWithPw.passwordHash = newPassword;
      const saved = await userWithPw.save();
      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: buildUserResponse(saved),
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id, updates,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: buildUserResponse(user),
    });

  } catch (error) {
    console.error('Update me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile update',
      error: error.message,
    });
  }
};

// ── Admin: create staff user ───────────────────────────────
export const adminCreateUser = async (req, res) => {
  try {
    const { name, email, password, telephone, role, photo, doctorDetails } = req.body;
    if (!name || !email || !password || !telephone || !role)
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    if (role === 'patient')
      return res.status(400).json({
        success: false,
        message: 'Patients must register themselves',
      });
    if (await User.findOne({ email }))
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });

    const userData = {
      userId: await User.generateUserId(role),
      name, email, passwordHash: password, telephone, role,
      photo: photo || null,
    };
    if (role === 'doctor' && doctorDetails) userData.doctorDetails = doctorDetails;

    const user = await User.create(userData);
    res.status(201).json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} created successfully`,
      user: buildUserResponse(user),
    });

  } catch (error) {
    console.error('Admin create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during user creation',
      error: error.message,
    });
  }
};

// ── Helper 
function buildUserResponse(user) {
  return {
    _id:            user._id,
    userId:         user.userId,
    name:           user.name,
    email:          user.email,
    username:       user.username,
    telephone:      user.telephone,
    role:           user.role,
    photo:          user.photo,
    doctorDetails:  user.doctorDetails,
    patientDetails: user.patientDetails,
    age:            user.age,
    createdAt:      user.createdAt,
  };
}