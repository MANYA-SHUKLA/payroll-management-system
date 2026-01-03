import express from 'express';
import { body, validationResult } from 'express-validator';
import SalarySlip from '../models/SalarySlip.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { sendUpdateNotification } from '../utils/emailService.js';

const router = express.Router();

// @route   POST /api/salary-slip
// @desc    Create salary slip (Admin only)
// @access  Private/Admin
router.post('/', authenticate, authorize('admin'), [
  body('employeeEmail').optional().isEmail().withMessage('Please provide a valid email'),
  body('employeeId').optional().notEmpty().withMessage('Employee ID or Email is required'),
  body('month').matches(/^\d{4}-\d{2}$/).withMessage('Month must be in YYYY-MM format'),
  body('basicSalary').isFloat({ min: 0 }).withMessage('Basic salary must be a positive number'),
  body('allowances').optional().isFloat({ min: 0 }),
  body('deductions').optional().isFloat({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let { employeeId, employeeEmail, month, basicSalary, allowances = 0, deductions = 0 } = req.body;

    // Validate that either employeeId or employeeEmail is provided
    if (!employeeId && !employeeEmail) {
      return res.status(400).json({ message: 'Either employeeId or employeeEmail is required' });
    }

    // If employeeEmail is provided, find the employee by email
    if (employeeEmail && !employeeId) {
      const employee = await User.findOne({ email: employeeEmail, role: 'employee' });
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found with this email' });
      }
      employeeId = employee._id;
    }

    // Check if salary slip already exists for this month
    const existing = await SalarySlip.findOne({ employeeId, month });
    if (existing) {
      return res.status(400).json({ message: 'Salary slip already exists for this month' });
    }

    const netSalary = basicSalary + allowances - deductions;

    const salarySlip = await SalarySlip.create({
      employeeId,
      month,
      basicSalary,
      allowances,
      deductions,
      netSalary
    });

    // Create notification for employee
    await Notification.create({
      userId: employeeId,
      type: 'salary_slip',
      title: 'New Salary Slip Available',
      message: `Your salary slip for ${month} has been generated.`,
      link: `/salary-slips/${salarySlip._id}`
    });

    const populated = await SalarySlip.findById(salarySlip._id)
      .populate('employeeId', 'name email');

    res.status(201).json({
      message: 'Salary slip created successfully',
      salarySlip: populated
    });
  } catch (error) {
    console.error('Create salary slip error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/salary-slip/:id
// @desc    Update salary slip (Admin only)
// @access  Private/Admin
router.put('/:id', authenticate, authorize('admin'), [
  body('month').optional().matches(/^\d{4}-\d{2}$/),
  body('basicSalary').optional().isFloat({ min: 0 }),
  body('allowances').optional().isFloat({ min: 0 }),
  body('deductions').optional().isFloat({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const salarySlip = await SalarySlip.findById(req.params.id);
    if (!salarySlip) {
      return res.status(404).json({ message: 'Salary slip not found' });
    }

    const updates = {};
    if (req.body.month) updates.month = req.body.month;
    if (req.body.basicSalary !== undefined) updates.basicSalary = req.body.basicSalary;
    if (req.body.allowances !== undefined) updates.allowances = req.body.allowances;
    if (req.body.deductions !== undefined) updates.deductions = req.body.deductions;

    const updated = await SalarySlip.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('employeeId', 'name email');

    // Create notification
    await Notification.create({
      userId: updated.employeeId._id,
      type: 'salary_slip',
      title: 'Salary Slip Updated',
      message: `Your salary slip for ${updated.month} has been updated.`,
      link: `/salary-slips/${updated._id}`
    });

    // Send email notification about update
    const updateDetails = `Salary slip for ${updated.employeeId.name} (${updated.employeeId.email}) for month ${updated.month} has been updated.`;
    sendUpdateNotification(
      'Salary Slip Update',
      req.user.name,
      req.user.email,
      updateDetails
    ).catch(err => {
      console.error('Failed to send update email:', err);
    });

    res.json({
      message: 'Salary slip updated successfully',
      salarySlip: updated
    });
  } catch (error) {
    console.error('Update salary slip error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/salary-slip
// @desc    Get salary slips (Employee: own, Admin: all)
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { employeeId: req.user._id };
    
    const salarySlips = await SalarySlip.find(query)
      .populate('employeeId', 'name email')
      .sort({ month: -1 });

    res.json({ salarySlips });
  } catch (error) {
    console.error('Get salary slips error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/salary-slip/:id
// @desc    Get single salary slip
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role !== 'admin') {
      query.employeeId = req.user._id;
    }

    const salarySlip = await SalarySlip.findOne(query)
      .populate('employeeId', 'name email');

    if (!salarySlip) {
      return res.status(404).json({ message: 'Salary slip not found' });
    }

    res.json({ salarySlip });
  } catch (error) {
    console.error('Get salary slip error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

