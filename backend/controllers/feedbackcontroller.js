import Feedback from '../models/Feedback.js';

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Submit feedback  (Patient only)
// @route   POST /api/feedback
// @access  Private – patient role
// ─────────────────────────────────────────────────────────────────────────────

export const submitFeedback = async (req, res) => {
  try {
    const { rating, description } = req.body;
    const patientId   = req.user.id;
    const patientName = req.user.name;

    if (!rating) {
      return res.status(400).json({ message: 'A star rating is required.' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const feedback = new Feedback({
      patientId,
      patientName,
      rating,
      ...(description && { description }),
    });
    const saved    = await feedback.save();

    res.status(201).json({ message: 'Feedback submitted successfully', feedback: saved });
  } catch (error) {
    console.error('submitFeedback error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get current patient's own feedbacks
// @route   GET /api/feedback/my
// @access  Private – patient role
// ─────────────────────────────────────────────────────────────────────────────

//Patient views their own feedback history
export const getMyFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ patientId: req.user.id })
      .sort({ createdAt: -1 })
      .select('-__v');

    res.status(200).json({ feedbacks });
  } catch (error) {
    console.error('getMyFeedback error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all feedback  (Cashier)
// @route   GET /api/feedback
// @access  Private – cashier role
// ─────────────────────────────────────────────────────────────────────────────
export const getAllFeedback = async (req, res) => {
  try {
    const { rating, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (rating) filter.rating = Number(rating);

    const skip = (Number(page) - 1) * Number(limit);

    const [feedbacks, total] = await Promise.all([
      Feedback.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select('-__v'),
      Feedback.countDocuments(filter),
    ]);

    res.status(200).json({
      total,
      page:    Number(page),
      pages:   Math.ceil(total / Number(limit)),
      feedbacks,
    });
  } catch (error) {
    console.error('getAllFeedback error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get rating distribution for dashboard chart
// @route   GET /api/feedback/distribution
// @access  Private – cashier role
// ─────────────────────────────────────────────────────────────────────────────

//⭐⭐⭐⭐⭐  → 42 reviews
export const getRatingDistribution = async (req, res) => {
  try {
    const distribution = await Feedback.aggregate([
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]);

    const result = [5, 4, 3, 2, 1].map((star) => {
      const found = distribution.find((d) => d._id === star);
      return { rating: star, count: found ? found.count : 0 };
    });

    const totalReviews  = result.reduce((sum, r) => sum + r.count, 0);
    const averageRating = totalReviews === 0
      ? 0
      : result.reduce((sum, r) => sum + r.rating * r.count, 0) / totalReviews;

    res.status(200).json({
      distribution: result,
      totalReviews,
      averageRating: parseFloat(averageRating.toFixed(1)),
    });
  } catch (error) {
    console.error('getRatingDistribution error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get a single feedback by ID
// @route   GET /api/feedback/:id
// @access  Private – cashier role
// ─────────────────────────────────────────────────────────────────────────────

//Cashier reads one specific feedback
export const getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id).select('-__v');
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
    res.status(200).json({ feedback });
  } catch (error) {
    console.error('getFeedbackById error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete feedback  (Cashier only)
// @route   DELETE /api/feedback/:id
// @access  Private – cashier role
// ─────────────────────────────────────────────────────────────────────────────
export const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });

    // Patients can only delete their own feedback
    if (req.user.role === 'patient' && feedback.patientId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own feedback' });
    }

    await feedback.deleteOne();
    res.status(200).json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('deleteFeedback error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};