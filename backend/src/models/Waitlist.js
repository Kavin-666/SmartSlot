// backend/src/models/Waitlist.js
const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true },
    slotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot', required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Prevent duplicate entries for same user+slot
waitlistSchema.index({ userId: 1, slotId: 1 }, { unique: true });

module.exports = mongoose.model('Waitlist', waitlistSchema);
