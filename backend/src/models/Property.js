const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: [
        'office_building',
        'coworking',
        'study_centre',
        'meeting_facility',
        'sports_facility',
        'event_venue',
        'consultation_space',
        'shared_workspace',
        'accommodation',
        'training_centre',
        'other',
      ],
      default: 'coworking',
    },
    description: { type: String },
    coverImage: { type: String },
    contact: {
      phone: { type: String },
      email: { type: String },
      website: { type: String },
    },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String, required: true, default: 'USA' },
      timezone: { type: String, default: 'UTC' },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    configuration: {
      floorsCount: { type: Number, default: 1 },
      defaultSlotDuration: { type: Number, default: 30 }, // in minutes
      cancellationPolicy: {
        type: String,
        enum: ['flexible', 'moderate', 'strict'],
        default: 'flexible',
      },
      defaultBookingRules: { type: String },
      operatingHours: [
        {
          day: { type: Number, min: 0, max: 6 },
          start: { type: String, default: '09:00' },
          end: { type: String, default: '17:00' },
        },
      ],
    },
    amenities: [{ type: String }],
    customAmenities: [{ type: String }],
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

// Search indexes
propertySchema.index({ organizationId: 1, status: 1 });
propertySchema.index({ 'location.city': 1, status: 1 });
propertySchema.index({ type: 1, status: 1 });
propertySchema.index({ status: 1 });

module.exports = mongoose.model('Property', propertySchema);
