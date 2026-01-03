import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'employee'],
    default: 'employee'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent multiple admins - only 1 admin allowed (seeded only)
userSchema.pre('save', async function(next) {
  // If trying to create/update to admin role, check if admin already exists
  if (this.role === 'admin') {
    const UserModel = mongoose.model('User');
    const adminExists = await UserModel.findOne({ role: 'admin' });
    if (adminExists) {
      // If this is a new admin, prevent creation
      if (this.isNew) {
        return next(new Error('Only one admin account is allowed in the system. Admin can only be created via seed script.'));
      }
      // If updating existing user to admin and another admin exists, prevent it
      if (!this.isNew && adminExists._id.toString() !== this._id.toString()) {
        return next(new Error('Only one admin account is allowed in the system'));
      }
    }
  }
  
  // Hash password before saving
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);

