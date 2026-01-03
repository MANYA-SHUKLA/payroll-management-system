import express from 'express';
import PDFDocument from 'pdfkit';
import SalarySlip from '../models/SalarySlip.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/salary-slip/:id/pdf
// @desc    Export salary slip as PDF
// @access  Private
router.get('/:id/pdf', authenticate, async (req, res) => {
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

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=salary-slip-${salarySlip.month}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // PDF Content
    doc.fontSize(20).text('SALARY SLIP', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(12);
    doc.text(`Employee Name: ${salarySlip.employeeId.name}`);
    doc.text(`Email: ${salarySlip.employeeId.email}`);
    doc.text(`Month: ${salarySlip.month}`);
    doc.moveDown();

    doc.fontSize(14).text('Earnings', { underline: true });
    doc.fontSize(12);
    doc.text(`Basic Salary: $${salarySlip.basicSalary.toFixed(2)}`);
    doc.text(`Allowances: $${salarySlip.allowances.toFixed(2)}`);
    doc.moveDown();

    doc.fontSize(14).text('Deductions', { underline: true });
    doc.fontSize(12);
    doc.text(`Deductions: $${salarySlip.deductions.toFixed(2)}`);
    doc.moveDown();

    doc.fontSize(16).text(`Net Salary: $${salarySlip.netSalary.toFixed(2)}`, { align: 'right' });
    doc.moveDown();

    doc.fontSize(10).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

