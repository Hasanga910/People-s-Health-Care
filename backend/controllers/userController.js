import User from '../models/User.js';

// ══════════════════════════════════════════════════════════════
// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
// ══════════════════════════════════════════════════════════════
export const getAllUsers = async (req, res) => {
  try {
    const { role, isActive, search } = req.query;

    // Build filter
    const filter = { deletedAt: null }; // Exclude soft-deleted users

    if (role) {
      filter.role = role;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { userId: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter).select('-passwordHash');

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// ══════════════════════════════════════════════════════════════
// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
// ══════════════════════════════════════════════════════════════
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// ══════════════════════════════════════════════════════════════
// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
// ══════════════════════════════════════════════════════════════
export const updateUser = async (req, res) => {
  try {
    const allowedUpdates = [
      'fullName',
      'phone',
      'isActive',
      'doctorProfile',
      'patientProfile',
      'staffProfile',
    ];

    const updates = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// ══════════════════════════════════════════════════════════════
// @desc    Soft delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
// ══════════════════════════════════════════════════════════════
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        deletedAt: new Date(),
        isActive: false,
      },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// ══════════════════════════════════════════════════════════════
// @desc    Restore soft-deleted user
// @route   PUT /api/users/:id/restore
// @access  Private/Admin
// ══════════════════════════════════════════════════════════════
export const restoreUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        deletedAt: null,
        isActive: true,
      },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User restored successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};
