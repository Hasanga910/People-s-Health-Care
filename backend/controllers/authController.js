import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

// ── Register (patient self-registration) ──────────────────────
export const register = async (req, res) => {
  try {
    const { name, email, password, telephone, gender, dateOfBirth, bloodGroup,
      allergies, chronicConditions, currentMedications,
      emergencyContactName, emergencyContactNumber, address } = req.body;

    if (!name || !email || !password || !telephone)
      return res.status(400).json({ success: false, message: 'Please provide name, email, password and telephone' });

    if (await User.findOne({ email }))
      return res.status(400).json({ success: false, message: 'User with this email already exists' });

    const patientDetails = {};
    if (gender) patientDetails.gender = gender;
    if (dateOfBirth) patientDetails.birthday = dateOfBirth;
    if (bloodGroup) patientDetails.bloodGroup = bloodGroup;
    if (allergies) patientDetails.allergies = Array.isArray(allergies) ? allergies : allergies.split(',').map(a => a.trim()).filter(Boolean);
    if (chronicConditions) patientDetails.chronicConditions = chronicConditions;
    if (currentMedications) patientDetails.currentMedications = currentMedications;
    if (emergencyContactName) patientDetails.emergencyContactName = emergencyContactName;
    if (emergencyContactNumber) patientDetails.emergencyContactNumber = emergencyContactNumber;
    if (address) patientDetails.address = address;

    const user = await User.create({
      userId: await User.generateUserId('patient'),
      role: 'patient', name, email, passwordHash: password, telephone,
      patientDetails,
      // doctorDetails intentionally omitted — patients don't have doctor fields
    });

    const token = generateToken(user._id);
    res.status(201).json({
      success: true, message: 'Registration successful.', token,
      user: { _id: user._id, userId: user.userId, name: user.name, email: user.email,
        telephone: user.telephone, role: user.role, patientDetails: user.patientDetails },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration', error: error.message });
  }
};

// ── Login (all roles) ─────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Please provide email and password' });

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    if (!await user.comparePassword(password))
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const token = generateToken(user._id);
    res.status(200).json({
      success: true, message: 'Login successful', token,
      user: { _id: user._id, userId: user.userId, name: user.name, email: user.email,
        telephone: user.telephone, role: user.role, photo: user.photo,
        patientDetails: user.patientDetails, doctorDetails: user.doctorDetails, age: user.age },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login', error: error.message });
  }
};

// ── Get current user ──────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user: { ...user.toObject(), age: user.age } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ── Update own profile ────────────────────────────────────────
export const updateMe = async (req, res) => {
  try {
    const { name, telephone, photo, doctorDetails, patientDetails, currentPassword, newPassword } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (telephone) updates.telephone = telephone;
    if (photo !== undefined) updates.photo = photo;
    if (doctorDetails) {
      const existing = req.user.doctorDetails?.toObject?.() || req.user.doctorDetails || {};
      updates.doctorDetails = { ...existing, ...doctorDetails };
    }
    if (patientDetails) {
      const existing = req.user.patientDetails?.toObject?.() || req.user.patientDetails || {};
      updates.patientDetails = { ...existing, ...patientDetails };
    }

    // Password change — must use save() so pre-save hook hashes it
    if (currentPassword && newPassword) {
      const userWithPw = await User.findById(req.user._id).select('+passwordHash');
      if (!await userWithPw.comparePassword(currentPassword))
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      if (newPassword.length < 6)
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
      Object.assign(userWithPw, updates);
      userWithPw.passwordHash = newPassword;
      const saved = await userWithPw.save();
      const userResponse = buildUserResponse(saved);
      return res.status(200).json({ success: true, message: 'Profile updated successfully', user: userResponse });
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).select('-passwordHash');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, message: 'Profile updated successfully', user: buildUserResponse(user) });
  } catch (error) {
    console.error('Update me error:', error);
    res.status(500).json({ success: false, message: 'Server error during profile update', error: error.message });
  }
};

// ── Admin: create staff user ──────────────────────────────────
export const adminCreateUser = async (req, res) => {
  try {
    const { name, email, password, telephone, role, photo, doctorDetails } = req.body;
    if (!name || !email || !password || !telephone || !role)
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    if (role === 'patient')
      return res.status(400).json({ success: false, message: 'Patients must register themselves' });
    if (await User.findOne({ email }))
      return res.status(400).json({ success: false, message: 'User with this email already exists' });

    const userData = {
      userId: await User.generateUserId(role),
      name, email, passwordHash: password, telephone, role,
      photo: photo || null,
      // patientDetails intentionally omitted — staff never have patient fields
    };
    if (role === 'doctor' && doctorDetails) userData.doctorDetails = doctorDetails;
    // doctorDetails omitted for non-doctor staff

    const user = await User.create(userData);
    res.status(201).json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} created successfully`,
      user: buildUserResponse(user),
    });
  } catch (error) {
    console.error('Admin create user error:', error);
    res.status(500).json({ success: false, message: 'Server error during user creation', error: error.message });
  }
};

// ── Helper ────────────────────────────────────────────────────
function buildUserResponse(user) {
  return {
    _id: user._id, userId: user.userId, name: user.name,
    email: user.email, telephone: user.telephone, role: user.role,
    photo: user.photo, doctorDetails: user.doctorDetails, patientDetails: user.patientDetails,
  };
}