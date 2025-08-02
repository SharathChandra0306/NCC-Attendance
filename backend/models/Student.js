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
  category: {
    type: String,
    required: true,
    enum: ['C', 'B2', 'B1']
  },
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
studentSchema.index({ company: 1, year: 1 });
studentSchema.index({ name: 'text', rollNumber: 'text' });

export default mongoose.model('Student', studentSchema);
