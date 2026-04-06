import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, telephone, gender, dateOfBirth, bloodGroup, allergies, chronicConditions, currentMedications, emergencyContactName, emergencyContactNumber, address } = req.body;
    if (!name || !email || !password || !telephone) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields: name, email, password, telephone' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: 'User with this email already exists' });
    const userId = await User.generateUserId('patient');
    const patientDetails = {};
    if (gender) patientDetails.gender = gender;
    if (dateOfBirth) patientDetails.birthday = dateOfBirth;
    if (bloodGroup) patientDetails.bloodGroup = bloodGroup;
    if (allergies) patientDetails.allergies = Array.isArray(allergies) ? allergies : allergies.split(',').map((a) => a.trim()).filter(Boolean);
    if (chronicConditions) patientDetails.chronicConditions = chronicConditions;
    if (currentMedications) patientDetails.currentMedications = currentMedications;
    if (emergencyContactName) patientDetails.emergencyContactName = emergencyContactName;
    if (emergencyContactNumber) patientDetails.emergencyContactNumber = emergencyContactNumber;
    if (address) patientDetails.address = address;
    const user = await User.create({ userId, role: 'patient', name, email, passwordHash: password, telephone, isActive: true, patientDetails });
    const token = generateToken(user._id);
    res.status(201).json({ success: true, message: 'Registration successful.', token, user: { _id: user._id, userId: user.userId, name: user.name, email: user.email, telephone: user.telephone, role: user.role, patientDetails: user.patientDetails } });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide email and password' });
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    if (!user.isActive) return res.status(401).json({ success: false, message: 'Account is deactivated. Contact administrator.' });
    if (user.deletedAt) return res.status(401).json({ success: false, message: 'Account has been deleted' });
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    const token = generateToken(user._id);
    res.status(200).json({ success: true, message: 'Login successful', token, user: { _id: user._id, userId: user.userId, name: user.name, email: user.email, telephone: user.telephone, role: user.role, photo: user.photo, isActive: user.isActive, patientDetails: user.patientDetails, doctorDetails: user.doctorDetails, age: user.age } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login', error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user: { ...user.toObject(), age: user.age } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ══════════════════════════════════════════════════════════════
// UPDATE OWN PROFILE — any logged-in user can update themselves
// @route   PUT /api/auth/me
// @access  Private
// ══════════════════════════════════════════════════════════════
export const updateMe = async (req, res) => {
  try {
    const { name, telephone, photo, doctorDetails, currentPassword, newPassword } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (telephone) updates.telephone = telephone;
    if (photo !== undefined) updates.photo = photo;

    if (doctorDetails) {
      const existing = req.user.doctorDetails ? req.user.doctorDetails.toObject?.() || req.user.doctorDetails : {};
      updates.doctorDetails = { ...existing, ...doctorDetails };
    }

    // Password change
    if (currentPassword && newPassword) {
      const userWithPw = await User.findById(req.user._id).select('+passwordHash');
      const isMatch = await userWithPw.comparePassword(currentPassword);
      if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      if (newPassword.length < 6) return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
      updates.passwordHash = newPassword;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).select('-passwordHash');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Sync localStorage on client side by returning fresh user
    const userResponse = { _id: user._id, userId: user.userId, name: user.name, email: user.email, telephone: user.telephone, role: user.role, photo: user.photo, isActive: user.isActive, doctorDetails: user.doctorDetails, patientDetails: user.patientDetails };

    res.status(200).json({ success: true, message: 'Profile updated successfully', user: userResponse });
  } catch (error) {
    console.error('Update me error:', error);
    res.status(500).json({ success: false, message: 'Server error during profile update', error: error.message });
  }
};

export const adminCreateUser = async (req, res) => {
  try {
    const { name, email, password, telephone, role, photo, doctorDetails } = req.body;
    if (!name || !email || !password || !telephone || !role) return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    if (role === 'patient') return res.status(400).json({ success: false, message: 'Patients must register themselves' });
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: 'User with this email already exists' });
    const userId = await User.generateUserId(role);
    const userData = { userId, name, email, passwordHash: password, telephone, role, photo: photo || null, isActive: true };
    if (role === 'doctor' && doctorDetails) userData.doctorDetails = doctorDetails;
    const user = await User.create(userData);
    res.status(201).json({ success: true, message: `${role.charAt(0).toUpperCase() + role.slice(1)} user created successfully`, user: { _id: user._id, userId: user.userId, name: user.name, email: user.email, telephone: user.telephone, role: user.role, photo: user.photo, isActive: user.isActive, doctorDetails: user.doctorDetails } });
  } catch (error) {
    console.error('Admin create user error:', error);
    res.status(500).json({ success: false, message: 'Server error during user creation', error: error.message });
  }
};