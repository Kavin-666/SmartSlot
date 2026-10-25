const asyncHandler = require('express-async-handler');
const Organization = require('../models/Organization.js');
const Property = require('../models/Property.js');

const ROLE_RANKS = {
  owner: 4,
  manager: 3,
  booking_manager: 2,
  viewer: 1,
};

// Check if user has sufficient role in an organization
const requireOrgAccess = (minRole = 'viewer') =>
  asyncHandler(async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Platform admin bypass
    if (req.user.role === 'admin') {
      return next();
    }

    const orgId =
      req.params.orgId ||
      req.params.organizationId ||
      req.body.organizationId ||
      req.query.organizationId;

    if (!orgId) {
      return res.status(400).json({ message: 'Organization ID is required' });
    }

    const org = await Organization.findById(orgId);
    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Check if owner
    const isOwner = org.ownerId.toString() === req.user._id.toString();
    if (isOwner) {
      req.organization = org;
      req.orgRole = 'owner';
      return next();
    }

    // Check membership
    const membership = org.members.find(
      (m) => m.userId.toString() === req.user._id.toString()
    );

    if (!membership) {
      return res.status(403).json({ message: 'Forbidden: You do not belong to this organization' });
    }

    const userRank = ROLE_RANKS[membership.role] || 0;
    const requiredRank = ROLE_RANKS[minRole] || 1;

    if (userRank < requiredRank) {
      return res.status(403).json({
        message: `Forbidden: Requires at least ${minRole} privilege`,
      });
    }

    req.organization = org;
    req.orgRole = membership.role;
    next();
  });

// Check if user has access to a specific property via its organization
const requirePropertyAccess = (minRole = 'viewer') =>
  asyncHandler(async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Platform admin bypass
    if (req.user.role === 'admin') {
      const propertyId = req.params.propertyId || req.params.id;
      if (propertyId) {
        req.property = await Property.findById(propertyId);
      }
      return next();
    }

    const propertyId = req.params.propertyId || req.params.id;
    if (!propertyId) {
      return res.status(400).json({ message: 'Property ID is required' });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Direct creator check
    if (property.createdBy.toString() === req.user._id.toString()) {
      req.property = property;
      req.propertyRole = 'owner';
      return next();
    }

    // Organization membership check
    const org = await Organization.findById(property.organizationId);
    if (!org) {
      return res.status(404).json({ message: 'Parent organization not found' });
    }

    const isOrgOwner = org.ownerId.toString() === req.user._id.toString();
    if (isOrgOwner) {
      req.property = property;
      req.organization = org;
      req.propertyRole = 'owner';
      return next();
    }

    const membership = org.members.find(
      (m) => m.userId.toString() === req.user._id.toString()
    );

    if (!membership) {
      return res.status(403).json({ message: 'Forbidden: You cannot access this property' });
    }

    const userRank = ROLE_RANKS[membership.role] || 0;
    const requiredRank = ROLE_RANKS[minRole] || 1;

    if (userRank < requiredRank) {
      return res.status(403).json({
        message: `Forbidden: Requires at least ${minRole} privilege on this property`,
      });
    }

    req.property = property;
    req.organization = org;
    req.propertyRole = membership.role;
    next();
  });

module.exports = { requireOrgAccess, requirePropertyAccess };
