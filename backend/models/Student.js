import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  regimentalNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  rollNumber: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  category: {
    type: String,
    required: true,
    enum: ['C', 'B2', 'B1']
  },
  branch: {
    type: String,
    required: true,
    enum: [
      'Computer Science & Engineering (CSE)',
      'CSE – Artificial Intelligence & Machine Learning (AIML)',
      'CSE – Data Science (CS DS)',
      'Electronics & Communication Engineering (ECE)',
      'Information Technology (IT)',
      'Electrical & Electronics Engineering (EEE)',
      'Mechanical Engineering (ME)',
      'Civil Engineering (CE)'
    ]
  }
  ,
  rank: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  attendanceRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Index for efficient searching
studentSchema.index({ rollNumber: 1 });
studentSchema.index({ regimentalNumber: 1 });
studentSchema.index({ name: 'text', rollNumber: 'text', regimentalNumber: 'text' });

export default mongoose.model('Student', studentSchema);
