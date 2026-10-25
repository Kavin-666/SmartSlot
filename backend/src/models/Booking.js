const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
    slotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot', required: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    status: { type: String, enum: ['confirmed', 'cancelled', 'completed'], default: 'confirmed' },
    reference: { type: String, unique: true, default: () => `BK-${Date.now()}-${Math.floor(Math.random()*1000)}` },
    pricing: {
      model: { type: String, default: 'free' },
      price: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' },
    },
    approved: { type: Boolean, default: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Partial unique index to guarantee at most one confirmed booking per resource+slot
bookingSchema.index(
  { resourceId: 1, startAt: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'confirmed' } }
);

bookingSchema.index({ propertyId: 1, startAt: -1 });
bookingSchema.index({ userId: 1, startAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
