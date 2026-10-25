const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    location: { type: String },
    capacity: { type: Number, default: 1 },
    imageUrl: { type: String },
    active: { type: Boolean, default: true },
    bookable: { type: Boolean, default: true },

    // Multi-tenant property linkage
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'PropertySection' },
    resourceType: {
      type: String,
      enum: [
        'meeting_room',
        'desk',
        'study_room',
        'sports_court',
        'event_hall',
        'lab',
        'parking',
        'consultation_room',
        'other',
      ],
      default: 'meeting_room',
    },

    // Resource-specific amenities
    amenities: [{ type: String }],

    // Pricing models
    pricing: {
      model: {
        type: String,
        enum: ['free', 'fixed_slot', 'hourly'],
        default: 'free',
      },
      price: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' },
    },

    // Advanced booking policies
    bufferMinutes: { type: Number, default: 0 },
    advanceBookingDays: { type: Number, default: 30 },
    requiresApproval: { type: Boolean, default: false },

    // Opening hours: array of objects { day: 0-6, start: "09:00", end: "17:00" }
    openingHours: [{ day: Number, start: String, end: String }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

resourceSchema.index({ propertyId: 1, active: 1, bookable: 1 });
resourceSchema.index({ sectionId: 1 });
resourceSchema.index({ resourceType: 1 });
resourceSchema.index({ category: 1, active: 1 });

module.exports = mongoose.model('Resource', resourceSchema);
