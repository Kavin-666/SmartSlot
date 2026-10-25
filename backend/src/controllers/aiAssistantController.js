const asyncHandler = require('express-async-handler');
const Resource = require('../models/Resource.js');
const Property = require('../models/Property.js');
const Slot = require('../models/Slot.js');

// Intelligent NLP parser fallback for property extraction
const parsePropertyNaturalLanguage = (text) => {
  const lower = text.toLowerCase();

  // Detect Property Type
  let type = 'coworking';
  if (lower.includes('office') || lower.includes('corporate')) type = 'office_building';
  else if (lower.includes('study') || lower.includes('library')) type = 'study_centre';
  else if (lower.includes('sport') || lower.includes('court') || lower.includes('gym')) type = 'sports_facility';
  else if (lower.includes('event') || lower.includes('hall') || lower.includes('auditorium')) type = 'event_venue';
  else if (lower.includes('hostel') || lower.includes('hotel') || lower.includes('accommodation')) type = 'accommodation';
  else if (lower.includes('consult') || lower.includes('clinic')) type = 'consultation_space';

  // Detect floors
  let floorsCount = 1;
  const floorMatch = lower.match(/(\d+)\s*[- ]?(floor|story|storey|level)/i);
  if (floorMatch) {
    floorsCount = Math.max(1, Math.min(20, parseInt(floorMatch[1])));
  } else if (lower.includes('two floor') || lower.includes('two-floor')) floorsCount = 2;
  else if (lower.includes('three floor') || lower.includes('three-floor')) floorsCount = 3;
  else if (lower.includes('four floor') || lower.includes('four-floor')) floorsCount = 4;

  // Detect City / Location
  let city = 'Austin';
  const inCityMatch = lower.match(/in\s+([A-Z][a-zA-Z\s]+?)(?:,|\.|\s+with|\s+featuring|\s+and|$)/);
  if (inCityMatch && inCityMatch[1].trim().length > 2) {
    city = inCityMatch[1].trim();
  } else if (lower.includes('new york')) city = 'New York';
  else if (lower.includes('san francisco')) city = 'San Francisco';
  else if (lower.includes('seattle')) city = 'Seattle';
  else if (lower.includes('chicago')) city = 'Chicago';
  else if (lower.includes('london')) city = 'London';
  else if (lower.includes('boston')) city = 'Boston';

  // Extract Amenities
  const amenities = [];
  if (lower.includes('wifi') || lower.includes('internet')) amenities.push('High-Speed Wi-Fi');
  if (lower.includes('air condition') || lower.includes('a/c') || lower.includes('ac')) amenities.push('Air Conditioning');
  if (lower.includes('parking')) amenities.push('Dedicated Parking');
  if (lower.includes('projector') || lower.includes('screen') || lower.includes('display')) amenities.push('4K Display / Projector');
  if (lower.includes('whiteboard')) amenities.push('Whiteboard & Markers');
  if (lower.includes('coffee') || lower.includes('cafeteria') || lower.includes('kitchen')) amenities.push('Cafeteria / Coffee Bar');
  if (lower.includes('accessible') || lower.includes('wheelchair') || lower.includes('elevator')) amenities.push('Wheelchair Accessible');
  if (amenities.length === 0) amenities.push('High-Speed Wi-Fi', 'Air Conditioning');

  // Suggest Resource Templates
  const suggestedResources = [];
  if (type === 'coworking' || type === 'office_building') {
    suggestedResources.push(
      { name: 'Executive Meeting Room A', type: 'meeting_room', capacity: 10, amenities: ['4K Display / Projector', 'Whiteboard & Markers'] },
      { name: 'Collaboration Pod 1', type: 'meeting_room', capacity: 4, amenities: ['High-Speed Wi-Fi', 'Whiteboard & Markers'] },
      { name: 'Dedicated Desk Cluster', type: 'desk', capacity: 1, amenities: ['High-Speed Wi-Fi'] }
    );
  } else if (type === 'study_centre') {
    suggestedResources.push(
      { name: 'Quiet Study Pod 101', type: 'study_room', capacity: 1, amenities: ['High-Speed Wi-Fi', 'Air Conditioning'] },
      { name: 'Group Study Hall', type: 'study_room', capacity: 6, amenities: ['Whiteboard & Markers', 'High-Speed Wi-Fi'] }
    );
  } else if (type === 'sports_facility') {
    suggestedResources.push(
      { name: 'Indoor Badminton Court 1', type: 'sports_court', capacity: 4, amenities: ['Dedicated Parking'] },
      { name: 'Table Tennis Arena', type: 'sports_court', capacity: 2, amenities: ['Air Conditioning'] }
    );
  } else {
    suggestedResources.push(
      { name: 'Multi-Purpose Space', type: 'meeting_room', capacity: 8, amenities: ['High-Speed Wi-Fi', 'Whiteboard & Markers'] }
    );
  }

  // Derive title
  let name = 'Smart Modern Facility';
  const nameMatch = text.match(/(?:called|named)\s+["']?([^"',.]+?)["']?(?:,|\.|\s+in|\s+with|$)/i);
  if (nameMatch) {
    name = nameMatch[1].trim();
  } else {
    const capitalizedType = type.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    name = `${city} ${capitalizedType} Hub`;
  }

  return {
    name,
    type,
    description: `Professional ${type.replace('_', ' ')} located in ${city}, featuring ${floorsCount} level(s) with modern facilities.`,
    location: {
      address: `100 Central Boulevard`,
      city: city,
      state: 'State',
      postalCode: '10001',
      country: 'USA',
      timezone: 'UTC',
    },
    configuration: {
      floorsCount,
      defaultSlotDuration: 30,
      cancellationPolicy: 'flexible',
      operatingHours: [
        { day: 1, start: '08:00', end: '18:00' },
        { day: 2, start: '08:00', end: '18:00' },
        { day: 3, start: '08:00', end: '18:00' },
        { day: 4, start: '08:00', end: '18:00' },
        { day: 5, start: '08:00', end: '18:00' },
      ],
    },
    amenities,
    suggestedResources,
    confidence: 'Deterministic Extraction (Ready for Review)',
  };
};

// @desc AI Property Draft Generator from natural language prompt
// @route POST /api/v1/ai/property-draft
// @access Private (Owner / Manager)
const generatePropertyDraft = asyncHandler(async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 5) {
    return res.status(400).json({ message: 'A descriptive property prompt is required' });
  }

  const draft = parsePropertyNaturalLanguage(prompt);
  res.json({
    draft,
    note: 'AI generated draft is non-authoritative. Please review, edit, and confirm before saving.',
  });
});

// @desc AI Resource Recommendation Engine
// @route POST /api/v1/ai/recommendations
// @access Public / Private
const getResourceRecommendations = asyncHandler(async (req, res) => {
  const { query, capacity, type, date } = req.body;

  const filter = { active: true, bookable: true };
  if (capacity) {
    filter.capacity = { $gte: parseInt(capacity) };
  }
  if (type) {
    filter.resourceType = type;
  }

  const resources = await Resource.find(filter)
    .populate('propertyId', 'name location status')
    .limit(20);

  // Filter only those whose property is published (or legacy public resources)
  const validResources = resources.filter((r) => {
    if (!r.propertyId) return true; // legacy resource
    return r.propertyId.status === 'published';
  });

  // Calculate ranking score & explanation based on match
  const ranked = validResources.map((r) => {
    let score = 50;
    const reasons = [];

    if (capacity && r.capacity >= parseInt(capacity)) {
      score += 20;
      reasons.push(`Accommodates your group of ${capacity} (capacity: ${r.capacity})`);
    }

    if (query) {
      const q = query.toLowerCase();
      if (r.name.toLowerCase().includes(q) || r.category?.toLowerCase().includes(q)) {
        score += 20;
        reasons.push(`Directly matches your keywords "${query}"`);
      }
      if (r.propertyId?.location?.city?.toLowerCase().includes(q)) {
        score += 15;
        reasons.push(`Located in your requested location (${r.propertyId.location.city})`);
      }
    }

    if (r.pricing?.model === 'free') {
      score += 5;
      reasons.push('Complimentary / free booking policy');
    }

    return {
      resource: r,
      score,
      explanation: reasons.length > 0 ? reasons.join('. ') : 'Meets general availability and capacity criteria.',
    };
  });

  ranked.sort((a, b) => b.score - a.score);

  res.json({
    recommendations: ranked.slice(0, 5),
  });
});

module.exports = {
  generatePropertyDraft,
  getResourceRecommendations,
};
