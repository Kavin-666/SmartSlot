// backend/src/controllers/resourceController.js
const asyncHandler = require('express-async-handler');
const Resource = require('../models/Resource.js');
const { z } = require('zod');

// Validation schema for creation / update
const resourceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  imageUrl: z.string().url().optional(),
  openingHours: z.array(z.object({ day: z.number().int().min(0).max(6), start: z.string(), end: z.string() })).optional(),
  active: z.boolean().optional(),
});

// @desc Get all resources (public)
// @route GET /api/v1/resources
// @access Public
const getResources = asyncHandler(async (req, res) => {
  const resources = await Resource.find({ active: true });
  res.json(resources);
});

// @desc Get single resource by id
// @route GET /api/v1/resources/:id
// @access Public
const getResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) {
    return res.status(404).json({ message: 'Resource not found' });
  }
  res.json(resource);
});

// @desc Create resource (admin only)
// @route POST /api/v1/resources
// @access Admin
const createResource = asyncHandler(async (req, res) => {
  const parsed = resourceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid input', errors: parsed.error.format() });
  }
  const resource = await Resource.create({ ...parsed.data, createdBy: req.user._id });
  res.status(201).json(resource);
});

// @desc Update resource (admin only)
// @route PATCH /api/v1/resources/:id
// @access Admin
const updateResource = asyncHandler(async (req, res) => {
  const parsed = resourceSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid input', errors: parsed.error.format() });
  }
  const resource = await Resource.findByIdAndUpdate(req.params.id, parsed.data, { new: true, runValidators: true });
  if (!resource) {
    return res.status(404).json({ message: 'Resource not found' });
  }
  res.json(resource);
});

// @desc Delete (deactivate) resource (admin only)
// @route DELETE /api/v1/resources/:id
// @access Admin
const deleteResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
  if (!resource) {
    return res.status(404).json({ message: 'Resource not found' });
  }
  res.json({ message: 'Resource deactivated' });
});

module.exports = { getResources, getResource, createResource, updateResource, deleteResource };
