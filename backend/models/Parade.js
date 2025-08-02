import mongoose from 'mongoose';

const paradeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'Morning Parade',
      'Evening Parade',
      'Special Drill',
      'Physical Training',
      'Weapon Training',
      'Ceremonial Parade',
      'Camp Activity',
      'Other'
    ]
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
    default: function() {
      return this.date > new Date() ? 'Upcoming' : 'Completed';
    }
  },
  location: {
    type: String,
    trim: true
  },
  instructor: {
    type: String,
    trim: true
  },
  maxParticipants: {
    type: Number,
    min: 1
  },
  requirements: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
paradeSchema.index({ date: 1, status: 1 });
paradeSchema.index({ type: 1 });

export default mongoose.model('Parade', paradeSchema);
