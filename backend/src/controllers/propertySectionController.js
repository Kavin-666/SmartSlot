const asyncHandler = require('express-async-handler');
const PropertySection = require('../models/PropertySection.js');
const Resource = require('../models/Resource.js');
const AuditLog = require('../models/AuditLog.js');
const { z } = require('zod');

const sectionSchema = z.object({
  name: z.string().min(1),
  level: z.number().int().default(1),
  description: z.string().optional(),
});

// @desc Add floor/section to a property
// @route POST /api/v1/properties/:id/sections
// @access Private (Owner / Manager)
const createSection = asyncHandler(async (req, res) => {
  const propertyId = req.params.id;
  const parsed = sectionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid section data', errors: parsed.error.format() });
  }

  const section = await PropertySection.create({
    propertyId,
    name: parsed.data.name,
    level: parsed.data.level,
    description: parsed.data.description,
  });

  await AuditLog.create({
    actorId: req.user._id,
    actorName: req.user.name,
    action: 'SECTION_CREATED',
    targetType: 'PropertySection',
    targetId: section._id.toString(),
    propertyId,
    metadata: { name: section.name, level: section.level },
  });

  res.status(201).json({ section });
});

// @desc Get sections for a property
// @route GET /api/v1/properties/:id/sections
// @access Public / Private
const getPropertySections = asyncHandler(async (req, res) => {
  const propertyId = req.params.id;
  const sections = await PropertySection.find({ propertyId, active: true }).sort({ level: 1 });
  
  // Also get resources per section
  const resources = await Resource.find({ propertyId, active: true });
  const sectionMap = sections.map((s) => ({
    ...s.toObject(),
    resources: resources.filter((r) => r.sectionId && r.sectionId.toString() === s._id.toString()),
  }));

  res.json({ sections: sectionMap });
});

// @desc Update a section
// @route PATCH /api/v1/sections/:sectionId
// @access Private (Owner / Manager)
const updateSection = asyncHandler(async (req, res) => {
  const section = await PropertySection.findById(req.params.sectionId);
  if (!section) return res.status(404).json({ message: 'Section not found' });

  const updated = await PropertySection.findByIdAndUpdate(req.params.sectionId, req.body, {
    new: true,
  });

  res.json({ section: updated });
});

// @desc Deactivate/Delete a section
// @route DELETE /api/v1/sections/:sectionId
// @access Private (Owner / Manager)
const deleteSection = asyncHandler(async (req, res) => {
  const section = await PropertySection.findById(req.params.sectionId);
  if (!section) return res.status(404).json({ message: 'Section not found' });

  // Move resources assigned to this section to unassigned (sectionId: null)
  await Resource.updateMany({ sectionId: section._id }, { $set: { sectionId: null } });

  section.active = false;
  await section.save();

  res.json({ message: 'Section archived successfully' });
});

module.exports = {
  createSection,
  getPropertySections,
  updateSection,
  deleteSection,
};
