const mongoose = require('mongoose');

const maintenanceBlockSchema = new mongoose.Schema(
  {
    resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    reason: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

maintenanceBlockSchema.index({ resourceId: 1, startAt: 1, endAt: 1 });
maintenanceBlockSchema.index({ propertyId: 1 });

module.exports = mongoose.model('MaintenanceBlock', maintenanceBlockSchema);
