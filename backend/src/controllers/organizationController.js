const asyncHandler = require('express-async-handler');
const Organization = require('../models/Organization.js');
const AuditLog = require('../models/AuditLog.js');
const { z } = require('zod');

const orgSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
});

// @desc Create a new Organization
// @route POST /api/v1/organizations
// @access Private
const createOrganization = asyncHandler(async (req, res) => {
  const parsed = orgSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid input', errors: parsed.error.format() });
  }

  const existing = await Organization.findOne({ slug: parsed.data.slug });
  if (existing) {
    return res.status(409).json({ message: 'Organization slug is already taken' });
  }

  const org = await Organization.create({
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description,
    ownerId: req.user._id,
    members: [{ userId: req.user._id, role: 'owner', addedAt: new Date() }],
  });

  await AuditLog.create({
    actorId: req.user._id,
    actorName: req.user.name,
    action: 'ORGANIZATION_CREATED',
    targetType: 'Organization',
    targetId: org._id.toString(),
    organizationId: org._id,
    metadata: { name: org.name, slug: org.slug },
  });

  res.status(201).json({ organization: org });
});

// @desc Get organizations where user is owner or member
// @route GET /api/v1/organizations/me
// @access Private
const getMyOrganizations = asyncHandler(async (req, res) => {
  const orgs = await Organization.find({
    $or: [{ ownerId: req.user._id }, { 'members.userId': req.user._id }],
  }).populate('ownerId', 'name email');

  // If user has none, auto-provision a default personal organization for seamless onboarding!
  if (orgs.length === 0) {
    const slug = `${req.user.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;
    const defaultOrg = await Organization.create({
      name: `${req.user.name}'s Workspace`,
      slug: slug,
      description: 'Default personal property organization',
      ownerId: req.user._id,
      members: [{ userId: req.user._id, role: 'owner' }],
    });
    return res.json({ organizations: [defaultOrg] });
  }

  res.json({ organizations: orgs });
});

// @desc Get single organization
// @route GET /api/v1/organizations/:id
// @access Private
const getOrganization = asyncHandler(async (req, res) => {
  const org = await Organization.findById(req.params.id)
    .populate('ownerId', 'name email')
    .populate('members.userId', 'name email role');
  if (!org) return res.status(404).json({ message: 'Organization not found' });
  res.json({ organization: org });
});

// @desc Add or update member in organization
// @route POST /api/v1/organizations/:id/members
// @access Private (Owner / Manager only)
const addMember = asyncHandler(async (req, res) => {
  const { email, role } = req.body;
  const User = require('../models/User.js');
  const targetUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (!targetUser) {
    return res.status(404).json({ message: 'No registered user found with that email' });
  }

  const org = await Organization.findById(req.params.id);
  if (!org) return res.status(404).json({ message: 'Organization not found' });

  const existingMemberIndex = org.members.findIndex(
    (m) => m.userId.toString() === targetUser._id.toString()
  );

  if (existingMemberIndex > -1) {
    org.members[existingMemberIndex].role = role || 'manager';
  } else {
    org.members.push({ userId: targetUser._id, role: role || 'manager', addedAt: new Date() });
  }

  await org.save();

  await AuditLog.create({
    actorId: req.user._id,
    actorName: req.user.name,
    action: 'ORGANIZATION_MEMBER_ADDED',
    targetType: 'Organization',
    targetId: org._id.toString(),
    organizationId: org._id,
    metadata: { memberEmail: email, role },
  });

  res.json({ message: 'Member updated successfully', organization: org });
});

module.exports = {
  createOrganization,
  getMyOrganizations,
  getOrganization,
  addMember,
};
