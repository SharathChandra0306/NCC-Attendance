import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  parade: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Parade',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late', 'Excused'],
    required: true
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  markedAt: {
    type: Date,
    default: Date.now
  },
  remarks: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Compound index to ensure one attendance record per student per parade
attendanceSchema.index({ parade: 1, student: 1 }, { unique: true });

// Index for efficient querying
attendanceSchema.index({ parade: 1, status: 1 });
attendanceSchema.index({ student: 1 });

export default mongoose.model('Attendance', attendanceSchema);
