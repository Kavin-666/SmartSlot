const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    actorName: { type: String, default: 'System User' },
    action: {
      type: String,
      required: true,
      enum: [
        'ORGANIZATION_CREATED',
        'ORGANIZATION_MEMBER_ADDED',
        'ORGANIZATION_MEMBER_REMOVED',
        'PROPERTY_CREATED',
        'PROPERTY_UPDATED',
        'PROPERTY_PUBLISHED',
        'PROPERTY_UNPUBLISHED',
        'PROPERTY_ARCHIVED',
        'SECTION_CREATED',
        'SECTION_UPDATED',
        'SECTION_DELETED',
        'RESOURCE_CREATED',
        'RESOURCE_UPDATED',
        'RESOURCE_DEACTIVATED',
        'RESOURCE_ACTIVATED',
        'MAINTENANCE_CREATED',
        'MAINTENANCE_DELETED',
        'BOOKING_CREATED',
        'BOOKING_CANCELLED',
        'BOOKING_APPROVED',
      ],
    },
    targetType: {
      type: String,
      required: true,
      enum: ['Organization', 'Property', 'PropertySection', 'Resource', 'MaintenanceBlock', 'Booking'],
    },
    targetId: { type: String, required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
    metadata: { type: mongoose.Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

auditLogSchema.index({ propertyId: 1, timestamp: -1 });
auditLogSchema.index({ organizationId: 1, timestamp: -1 });
auditLogSchema.index({ actorId: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
