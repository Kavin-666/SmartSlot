import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import AIAssistantModal from '../components/ai/AIAssistantModal';
import { 
  Building2, 
  MapPin, 
  Sliders, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Layers, 
  Phone, 
  Mail, 
  Globe, 
  AlertCircle,
  Plus
} from 'lucide-react';

const PREDEFINED_AMENITIES = [
  'Gigabit Fiber Wi-Fi',
  'Air Conditioning & Climate Control',
  '4K Smart Projectors',
  'Interactive Digital Whiteboards',
  'Dedicated Basement Parking',
  'Wheelchair Accessible',
  'Specialty Espresso Bar',
  'Podcast Recording Studio',
  'Quiet Focus Booths',
  'High-Definition Video Conferencing',
  'Security Badged Access',
  'Catering Prep Kitchen',
];

const PRESET_IMAGES = [
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
];

export default function PropertyWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Basic
    name: '',
    type: 'coworking',
    description: '',
    coverImage: PRESET_IMAGES[0],
    contact: { phone: '', email: '', website: '' },

    // Step 2: Location
    location: {
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'USA',
      timezone: 'UTC',
    },

    // Step 3: Config
    configuration: {
      floorsCount: 3,
      defaultSlotDuration: 30,
      cancellationPolicy: 'flexible',
      defaultBookingRules: 'Cancellations permitted up to 1 hour prior. Double bookings strictly prevented.',
      operatingDays: [1, 2, 3, 4, 5], // Mon-Fri
      startTime: '08:00',
      endTime: '18:00',
    },

    // Step 4: Amenities
    amenities: ['Gigabit Fiber Wi-Fi', 'Air Conditioning & Climate Control'],
    customAmenities: [],
  });

  const [customAmenityInput, setCustomAmenityInput] = useState('');

  // Check if AI draft was stored in sessionStorage
  useEffect(() => {
    const storedDraft = sessionStorage.getItem('smartslot_ai_draft');
    if (storedDraft) {
      try {
        const draft = JSON.parse(storedDraft);
        applyDraftToForm(draft);
        sessionStorage.removeItem('smartslot_ai_draft');
        toast.success('AI draft loaded into wizard steps!');
      } catch (e) {}
    }
  }, []);

  const applyDraftToForm = (draft) => {
    setFormData((prev) => ({
      ...prev,
      name: draft.name || prev.name,
      type: draft.type || prev.type,
      description: draft.description || prev.description,
      location: {
        ...prev.location,
        ...(draft.location || {}),
      },
      configuration: {
        ...prev.configuration,
        floorsCount: draft.configuration?.floorsCount || prev.configuration.floorsCount,
        defaultSlotDuration: draft.configuration?.defaultSlotDuration || prev.configuration.defaultSlotDuration,
      },
      amenities: draft.amenities || prev.amenities,
    }));
  };

  const handleNext = () => {
    // Step 1 Validation
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        toast.error('Property Name is required');
        return;
      }
    }
    // Step 2 Validation
    if (currentStep === 2) {
      if (!formData.location.address.trim() || !formData.location.city.trim()) {
        toast.error('Address and City are required');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(5, prev + 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const toggleAmenity = (amenity) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity],
      };
    });
  };

  const addCustomAmenity = () => {
    if (!customAmenityInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      customAmenities: [...prev.customAmenities, customAmenityInput.trim()],
    }));
    setCustomAmenityInput('');
  };

  const removeCustomAmenity = (index) => {
    setFormData((prev) => ({
      ...prev,
      customAmenities: prev.customAmenities.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const operatingHours = formData.configuration.operatingDays.map((day) => ({
        day,
        start: formData.configuration.startTime,
        end: formData.configuration.endTime,
      }));

      const payload = {
        name: formData.name,
        type: formData.type,
        description: formData.description,
        coverImage: formData.coverImage,
        contact: formData.contact,
        location: formData.location,
        configuration: {
          floorsCount: parseInt(formData.configuration.floorsCount) || 1,
          defaultSlotDuration: parseInt(formData.configuration.defaultSlotDuration) || 30,
          cancellationPolicy: formData.configuration.cancellationPolicy,
          defaultBookingRules: formData.configuration.defaultBookingRules,
          operatingHours,
        },
        amenities: [...formData.amenities, ...formData.customAmenities],
        status: 'draft',
      };

      const res = await api.post('/properties', payload);
      const newProperty = res.data.property;

      toast.success(
        `Property "${newProperty.name}" created with ${newProperty.configuration?.floorsCount || 1} floor(s)!`
      );

      navigate(`/owner/properties/${newProperty._id}/manage`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create property');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { num: 1, title: 'Basic Info', icon: Building2 },
    { num: 2, title: 'Location', icon: MapPin },
    { num: 3, title: 'Configuration', icon: Sliders },
    { num: 4, title: 'Amenities', icon: Layers },
    { num: 5, title: 'Review & Publish', icon: CheckCircle2 },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Top Banner with AI Assistant button */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 dark:bg-brand-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800/60">
              <Building2 className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>Multi-Tenant Onboarding Wizard</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Add Commercial Property
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
              Configure your building structure, floor hierarchy, operating schedules, and amenities in 5 simple steps.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAiModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold text-xs border border-purple-500/30 transition-all self-start sm:self-auto shrink-0 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>AI Auto-Draft Setup</span>
          </button>
        </div>
      </motion.div>

      {/* Step Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {steps.map((s) => {
          const Icon = s.icon;
          const isDone = currentStep > s.num;
          const isCurrent = currentStep === s.num;

          return (
            <div
              key={s.num}
              onClick={() => {
                if (isDone) setCurrentStep(s.num);
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                isCurrent
                  ? 'glass-card border-brand-500/50 ring-2 ring-brand-500/20 shadow-md'
                  : isDone
                  ? 'glass-card border-emerald-500/30 text-emerald-600 dark:text-emerald-400 cursor-pointer'
                  : 'glass-card opacity-50 border-slate-200/40 dark:border-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    isCurrent
                      ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-sm'
                      : isDone
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {isDone ? '✓' : s.num}
                </span>
                <Icon className={`w-4 h-4 ${isCurrent ? 'text-brand-500' : isDone ? 'text-emerald-500' : 'text-slate-400'}`} />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{s.title}</span>
            </div>
          );
        })}
      </div>

      {/* Wizard Form Body */}
      <motion.div 
        key={currentStep}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="glass-card rounded-3xl p-6 sm:p-10 transition-colors space-y-6"
      >
        {/* STEP 1: BASIC INFORMATION */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="border-b border-slate-200/70 dark:border-white/[0.08] pb-4">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Step 1 — Basic Property Information</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Provide the commercial identity and description of your property.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Property Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nexus Innovation Tower"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition-all shadow-sm"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Property Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white shadow-sm cursor-pointer"
                  >
                    <option value="coworking">Co-working Space</option>
                    <option value="office_building">Office Building</option>
                    <option value="study_centre">Study Centre / Library</option>
                    <option value="meeting_facility">Meeting & Conference Facility</option>
                    <option value="sports_facility">Sports & Recreation Facility</option>
                    <option value="event_venue">Event & Exhibition Venue</option>
                    <option value="consultation_space">Consultation / Clinic Suite</option>
                    <option value="training_centre">Training Centre</option>
                    <option value="accommodation">Hostel & Guest Accommodation</option>
                    <option value="other">Other Commercial Property</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Cover Image Preset Selector */}
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-2 font-semibold">Or select a curated preset photo:</span>
                <div className="grid grid-cols-4 gap-2.5">
                  {PRESET_IMAGES.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt="Preset"
                      onClick={() => setFormData({ ...formData, coverImage: img })}
                      className={`h-18 w-full object-cover rounded-xl cursor-pointer border-2 transition-all ${
                        formData.coverImage === img ? 'border-brand-500 scale-[1.02] shadow-md' : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your building layout, architecture, amenities, and community vibe..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition-all shadow-sm"
                />
              </div>

              {/* Contact Info */}
              <div className="pt-3 border-t border-slate-200/70 dark:border-white/[0.08] grid sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-brand-500" /> Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+1 (555) 0199"
                    value={formData.contact.phone}
                    onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, phone: e.target.value } })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white text-xs shadow-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-brand-500" /> Email
                  </label>
                  <input
                    type="email"
                    placeholder="contact@property.com"
                    value={formData.contact.email}
                    onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, email: e.target.value } })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white text-xs shadow-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-brand-500" /> Website
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.contact.website}
                    onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, website: e.target.value } })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white text-xs shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: LOCATION */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="border-b border-slate-200/70 dark:border-white/[0.08] pb-4">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Step 2 — Location & Timezone</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure physical address and canonical timezone for schedule generation.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 400 Congress Avenue, Suite 1200"
                  value={formData.location.address}
                  onChange={(e) => setFormData({ ...formData, location: { ...formData.location, address: e.target.value } })}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition-all shadow-sm"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Austin"
                    value={formData.location.city}
                    onChange={(e) => setFormData({ ...formData, location: { ...formData.location, city: e.target.value } })}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    State / Region
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Texas"
                    value={formData.location.state}
                    onChange={(e) => setFormData({ ...formData, location: { ...formData.location, state: e.target.value } })}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white shadow-sm"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    placeholder="78701"
                    value={formData.location.postalCode}
                    onChange={(e) => setFormData({ ...formData, location: { ...formData.location, postalCode: e.target.value } })}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.location.country}
                    onChange={(e) => setFormData({ ...formData, location: { ...formData.location, country: e.target.value } })}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Timezone
                  </label>
                  <select
                    value={formData.location.timezone}
                    onChange={(e) => setFormData({ ...formData, location: { ...formData.location, timezone: e.target.value } })}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white shadow-sm cursor-pointer"
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">London (GMT/BST)</option>
                    <option value="UTC">UTC (Universal)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: PROPERTY CONFIGURATION */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="border-b border-slate-200/70 dark:border-white/[0.08] pb-4">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Step 3 — Property Configuration & Hours</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Define building floors count, operating days, and cancellation rules.</p>
            </div>

            <div className="space-y-5">
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Number of Floors / Levels
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={formData.configuration.floorsCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        configuration: { ...formData.configuration, floorsCount: parseInt(e.target.value) || 1 },
                      })
                    }
                    className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white shadow-sm"
                  />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">Floors 1..N automatically scaffolded</span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Default Slot Duration
                  </label>
                  <select
                    value={formData.configuration.defaultSlotDuration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        configuration: { ...formData.configuration, defaultSlotDuration: parseInt(e.target.value) },
                      })
                    }
                    className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white shadow-sm cursor-pointer"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes (Standard)</option>
                    <option value="60">60 minutes (1 hour)</option>
                    <option value="120">120 minutes (2 hours)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Cancellation Policy
                  </label>
                  <select
                    value={formData.configuration.cancellationPolicy}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        configuration: { ...formData.configuration, cancellationPolicy: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white shadow-sm cursor-pointer"
                  >
                    <option value="flexible">Flexible (Up to 1 hr prior)</option>
                    <option value="moderate">Moderate (Up to 24 hrs prior)</option>
                    <option value="strict">Strict (Non-refundable)</option>
                  </select>
                </div>
              </div>

              {/* Operating Hours */}
              <div className="p-5 glass-card rounded-2xl border border-slate-200/70 dark:border-white/[0.08] space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Standard Operating Hours (Inherited by Rooms)
                </label>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Opening Time</label>
                    <input
                      type="time"
                      value={formData.configuration.startTime}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          configuration: { ...formData.configuration, startTime: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Closing Time</label>
                    <input
                      type="time"
                      value={formData.configuration.endTime}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          configuration: { ...formData.configuration, endTime: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: AMENITIES */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="border-b border-slate-200/70 dark:border-white/[0.08] pb-4">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Step 4 — Facilities & Amenities</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Select available features and add custom property amenities.</p>
            </div>

            <div className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-3">
                {PREDEFINED_AMENITIES.map((amenity) => {
                  const isChecked = formData.amenities.includes(amenity);
                  return (
                    <div
                      key={amenity}
                      onClick={() => toggleAmenity(amenity)}
                      className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                        isChecked
                          ? 'glass-card border-brand-500 text-brand-700 dark:text-brand-300 font-bold shadow-sm'
                          : 'glass-card opacity-80 border-slate-200/60 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xs">{amenity}</span>
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] ${
                          isChecked ? 'bg-brand-600 text-white' : 'border border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {isChecked && '✓'}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom Amenities */}
              <div className="pt-3 border-t border-slate-200/70 dark:border-white/[0.08] space-y-2.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Custom Amenities
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Rooftop Meditation Deck"
                    value={customAmenityInput}
                    onChange={(e) => setCustomAmenityInput(e.target.value)}
                    className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={addCustomAmenity}
                    className="px-5 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 flex items-center gap-1.5 active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                {formData.customAmenities.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {formData.customAmenities.map((ca, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 text-xs font-semibold border border-brand-200/50 dark:border-brand-800/50"
                      >
                        {ca}
                        <button
                          type="button"
                          onClick={() => removeCustomAmenity(idx)}
                          className="hover:text-rose-600 dark:hover:text-rose-400 font-bold"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: REVIEW & PUBLISH */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="border-b border-slate-200/70 dark:border-white/[0.08] pb-4">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Step 5 — Review & Confirm Property Creation</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Review your property details before saving to your multi-tenant organization.</p>
            </div>

            <div className="glass-card rounded-2xl p-6 sm:p-7 space-y-6 border border-slate-200/80 dark:border-white/[0.08]">
              <div className="flex flex-col sm:flex-row gap-5">
                <img
                  src={formData.coverImage}
                  alt={formData.name}
                  className="w-full sm:w-48 h-36 object-cover rounded-2xl shadow-sm"
                />
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200/40">
                      {formData.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {formData.configuration.floorsCount} Level(s)
                    </span>
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{formData.name}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">{formData.description || 'No description provided.'}</p>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-500" />
                    <span>{formData.location.address}, {formData.location.city}, {formData.location.country}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200/70 dark:border-white/[0.08] grid sm:grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-400">
                <div className="glass-card p-3.5 rounded-xl border border-slate-200/60 dark:border-white/[0.06]">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block">Operating Hours</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5 block">{formData.configuration.startTime} – {formData.configuration.endTime} UTC</span>
                </div>
                <div className="glass-card p-3.5 rounded-xl border border-slate-200/60 dark:border-white/[0.06]">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block">Slot Duration</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5 block">{formData.configuration.defaultSlotDuration} min intervals</span>
                </div>
                <div className="glass-card p-3.5 rounded-xl border border-slate-200/60 dark:border-white/[0.06]">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block">Cancellation Policy</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5 block capitalize">{formData.configuration.cancellationPolicy}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block mb-2">
                  Selected Amenities ({formData.amenities.length + formData.customAmenities.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[...formData.amenities, ...formData.customAmenities].map((a, i) => (
                    <span key={i} className="text-xs px-3 py-1 bg-slate-100 dark:bg-white/[0.05] border border-slate-200/70 dark:border-white/[0.08] text-slate-700 dark:text-slate-200 rounded-xl font-medium">
                      {a}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-brand-500/10 border border-brand-500/20 text-brand-950 dark:text-brand-200 text-xs rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Next Step:</strong> Upon creation, you will enter the Property Management Workspace where you can add rooms to each floor, configure capacity & pricing, and publish for public bookings.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Navigation Footer */}
        <div className="pt-6 border-t border-slate-200/70 dark:border-white/[0.08] flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous Step</span>
            </button>
          ) : (
            <div></div>
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-brand-500/20 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 disabled:opacity-50 transition-all active:scale-95"
            >
              {submitting ? 'Creating Property...' : 'Save & Configure Rooms'}
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>

      {/* AI Assistant Modal */}
      <AIAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onApplyDraft={applyDraftToForm}
      />
    </div>
  );
}