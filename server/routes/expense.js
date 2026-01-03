import express from 'express';
import { body, validationResult } from 'express-validator';
import Expense from '../models/Expense.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { sendUpdateNotification } from '../utils/emailService.js';

const router = express.Router();

// @route   POST /api/expense
// @desc    Submit expense (Employee only)
// @access  Private/Employee
router.post('/', authenticate, [
  body('month').matches(/^\d{4}-\d{2}$/).withMessage('Month must be in YYYY-MM format'),
  body('category').isIn(['travel', 'food', 'accommodation', 'utilities', 'other']).withMessage('Invalid category'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { month, category, description, amount, receipt } = req.body;

    const expense = await Expense.create({
      employeeId: req.user._id,
      month,
      category,
      description,
      amount,
      receipt: receipt || ''
    });

    // Create notification for admin
    const adminUsers = await User.find({ role: 'admin' });
    for (const admin of adminUsers) {
      await Notification.create({
        userId: admin._id,
        type: 'expense_submitted',
        title: 'New Expense Submitted',
        message: `${req.user.name} submitted an expense of $${amount} for ${month}`,
        link: `/expenses/${expense._id}`
      });
    }

    res.status(201).json({
      message: 'Expense submitted successfully',
      expense
    });
  } catch (error) {
    console.error('Submit expense error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/expense
// @desc    Get expenses (Employee: own, Admin: all)
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { employeeId: req.user._id };
    
    const expenses = await Expense.find(query)
      .populate('employeeId', 'name email')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ expenses });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/expense/:id/approve
// @desc    Approve expense (Admin only)
// @access  Private/Admin
router.put('/:id/approve', authenticate, authorize('admin'), async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    expense.status = 'approved';
    expense.reviewedBy = req.user._id;
    expense.reviewedAt = new Date();
    await expense.save();

    // Create notification for employee
    await Notification.create({
      userId: expense.employeeId,
      type: 'expense_approved',
      title: 'Expense Approved',
      message: `Your expense of $${expense.amount} for ${expense.month} has been approved.`,
      link: `/expenses/${expense._id}`
    });

    const populated = await Expense.findById(expense._id)
      .populate('employeeId', 'name email')
      .populate('reviewedBy', 'name');

    // Send email notification about update
    const updateDetails = `Expense of $${expense.amount} for ${expense.month} submitted by ${populated.employeeId.name} (${populated.employeeId.email}) has been approved.`;
    sendUpdateNotification(
      'Expense Approval',
      req.user.name,
      req.user.email,
      updateDetails
    ).catch(err => {
      console.error('Failed to send update email:', err);
    });

    res.json({
      message: 'Expense approved successfully',
      expense: populated
    });
  } catch (error) {
    console.error('Approve expense error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/expense/:id/reject
// @desc    Reject expense (Admin only)
// @access  Private/Admin
router.put('/:id/reject', authenticate, authorize('admin'), [
  body('rejectionReason').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    expense.status = 'rejected';
    expense.reviewedBy = req.user._id;
    expense.reviewedAt = new Date();
    expense.rejectionReason = req.body.rejectionReason || 'No reason provided';
    await expense.save();

    // Create notification for employee
    await Notification.create({
      userId: expense.employeeId,
      type: 'expense_rejected',
      title: 'Expense Rejected',
      message: `Your expense of $${expense.amount} for ${expense.month} has been rejected. Reason: ${expense.rejectionReason}`,
      link: `/expenses/${expense._id}`
    });

    const populated = await Expense.findById(expense._id)
      .populate('employeeId', 'name email')
      .populate('reviewedBy', 'name');

    // Send email notification about update
    const updateDetails = `Expense of $${expense.amount} for ${expense.month} submitted by ${populated.employeeId.name} (${populated.employeeId.email}) has been rejected. Reason: ${expense.rejectionReason}`;
    sendUpdateNotification(
      'Expense Rejection',
      req.user.name,
      req.user.email,
      updateDetails
    ).catch(err => {
      console.error('Failed to send update email:', err);
    });

    res.json({
      message: 'Expense rejected successfully',
      expense: populated
    });
  } catch (error) {
    console.error('Reject expense error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

