import mongoose from 'mongoose';

const salarySlipSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  month: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}$/ // Format: YYYY-MM
  },
  basicSalary: {
    type: Number,
    required: true,
    min: 0
  },
  allowances: {
    type: Number,
    default: 0,
    min: 0
  },
  deductions: {
    type: Number,
    default: 0,
    min: 0
  },
  netSalary: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'published'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate net salary before saving
salarySlipSchema.pre('save', function(next) {
  this.netSalary = this.basicSalary + this.allowances - this.deductions;
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
salarySlipSchema.index({ employeeId: 1, month: 1 }, { unique: true });

export default mongoose.model('SalarySlip', salarySlipSchema);

