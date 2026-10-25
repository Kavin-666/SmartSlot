const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema(
  {
    resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    available: { type: Boolean, default: true },
    // Optionally store which booking occupies the slot
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

// Ensure a resource cannot have two slots with identical start time
slotSchema.index({ resourceId: 1, startAt: 1 }, { unique: true });

module.exports = mongoose.model('Slot', slotSchema);
