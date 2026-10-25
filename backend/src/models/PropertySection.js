const mongoose = require('mongoose');

const propertySectionSchema = new mongoose.Schema(
  {
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    name: { type: String, required: true, trim: true }, // e.g. "Floor 1", "North Wing", "Executive Suite"
    level: { type: Number, default: 1 }, // floor level
    description: { type: String },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

propertySectionSchema.index({ propertyId: 1, level: 1 });

module.exports = mongoose.model('PropertySection', propertySectionSchema);
