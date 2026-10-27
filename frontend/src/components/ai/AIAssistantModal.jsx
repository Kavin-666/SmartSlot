import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  X, 
  Building2, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  Compass, 
  Lightbulb,
  Zap,
  Layers
} from 'lucide-react';

export default function AIAssistantModal({ isOpen, onClose, onApplyDraft }) {
  const [activeTab, setActiveTab] = useState('property');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [draftResult, setDraftResult] = useState(null);

  // Recommendations state
  const [recQuery, setRecQuery] = useState('');
  const [recCapacity, setRecCapacity] = useState('4');
  const [recResults, setRecResults] = useState([]);
  const [recLoading, setRecLoading] = useState(false);

  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleGenerateDraft = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    try {
      setLoading(true);
      const res = await api.post('/ai/property-draft', { prompt });
      setDraftResult(res.data.draft);
      toast.success('AI property draft extracted! Ready for review.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate property draft');
    } finally {
      setLoading(false);
    }
  };

  const handleUseDraftInWizard = () => {
    if (onApplyDraft) {
      onApplyDraft(draftResult);
    } else {
      sessionStorage.setItem('smartslot_ai_draft', JSON.stringify(draftResult));
      navigate('/owner/properties/new');
    }
    onClose();
  };

  const handleFindRecommendations = async (e) => {
    e.preventDefault();
    try {
      setRecLoading(true);
      const res = await api.post('/ai/recommendations', {
        query: recQuery,
        capacity: recCapacity,
      });
      setRecResults(res.data.recommendations || []);
    } catch (err) {
      toast.error('Failed to retrieve resource recommendations');
    } finally {
      setRecLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="glass-card rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-white/[0.1] relative"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-brand-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">SmartSlot AI Co-Pilot</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Autonomous property setup & intelligent resource matching</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200/80 dark:border-white/[0.08] space-x-6 text-sm font-semibold transition-colors">
          <button
            onClick={() => setActiveTab('property')}
            className={`pb-3 flex items-center gap-2 transition-colors ${
              activeTab === 'property'
                ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-600 dark:border-brand-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Property Setup Assistant</span>
          </button>
          <button
            onClick={() => setActiveTab('recommend')}
            className={`pb-3 flex items-center gap-2 transition-colors ${
              activeTab === 'recommend'
                ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-600 dark:border-brand-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Smart Resource Finder</span>
          </button>
        </div>

        {/* TAB 1: PROPERTY DRAFT GENERATOR */}
        {activeTab === 'property' && (
          <div className="space-y-5">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Describe your physical building, facility type, floors, and rooms in natural language.
              The AI Co-pilot extracts structured metadata and prepares a validated draft for the Property Wizard.
            </p>

            <form onSubmit={handleGenerateDraft} className="space-y-3.5">
              <textarea
                rows={3}
                required
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. I have a 3-floor co-working facility called Silicon Prairie Hub in Austin with high-speed fiber internet, parking, podcast booth, and meeting rooms for 10 people."
                className="w-full p-4 text-xs sm:text-sm rounded-2xl border border-slate-200 dark:border-white/[0.1] bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition-all shadow-sm"
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5 font-medium">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  Deterministic extraction fallback active (100% offline & fast)
                </span>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-95 self-start sm:self-auto"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Analyzing Structure...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate Property Draft</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Extracted Draft Preview */}
            {draftResult && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-5 sm:p-6 space-y-4 border border-brand-500/30 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/60 px-2.5 py-1 rounded-lg border border-brand-200/50">
                      Structured Extraction Complete
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1.5 tracking-tight">{draftResult.name}</h3>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Schema
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-400">
                  <div className="p-3 glass-card rounded-xl border border-slate-200/60 dark:border-white/[0.06]">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-semibold uppercase">Location</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5 block">{draftResult.location?.city}, {draftResult.location?.country}</span>
                  </div>
                  <div className="p-3 glass-card rounded-xl border border-slate-200/60 dark:border-white/[0.06]">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-semibold uppercase">Floors Provisioned</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5 block">{draftResult.configuration?.floorsCount} Level(s)</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-semibold uppercase mb-1.5">Detected Amenities</span>
                  <div className="flex flex-wrap gap-1.5">
                    {draftResult.amenities?.map((a, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-white/[0.05] border border-slate-200/60 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 rounded-lg font-medium">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/70 dark:border-white/[0.08] flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Ready to review and publish?</span>
                  <button
                    onClick={handleUseDraftInWizard}
                    className="px-4 py-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20 flex items-center gap-1.5 active:scale-95 transition-all"
                  >
                    <span>Load into Property Wizard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* TAB 2: SMART RESOURCE FINDER */}
        {activeTab === 'recommend' && (
          <div className="space-y-5">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Tell the assistant what you need (e.g. group size, facility type, location).
              The engine matches against real database slots with transparent algorithmic ranking.
            </p>

            <form onSubmit={handleFindRecommendations} className="grid sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="e.g. Quiet meeting room with projector in Austin..."
                  value={recQuery}
                  onChange={(e) => setRecQuery(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 shadow-sm"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={recCapacity}
                  onChange={(e) => setRecCapacity(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white shadow-sm cursor-pointer"
                >
                  <option value="1">1 Person</option>
                  <option value="4">4+ People</option>
                  <option value="8">8+ People</option>
                  <option value="12">12+ People</option>
                </select>
                <button
                  type="submit"
                  disabled={recLoading}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-md shadow-brand-500/20 disabled:opacity-50 active:scale-95 transition-all"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Search</span>
                </button>
              </div>
            </form>

            {recLoading && (
              <div className="py-12 text-center space-y-2">
                <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Evaluating verified resource inventory...</p>
              </div>
            )}

            {!recLoading && recResults.length > 0 && (
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Top Recommended Matches ({recResults.length})
                </span>
                {recResults.map((rec, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 rounded-2xl glass-card glass-card-hover border border-slate-200/80 dark:border-white/[0.08] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{rec.resource.name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 rounded-md border border-brand-200/50">
                          Match: {rec.score}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{rec.explanation}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500 pt-0.5">
                        <span>Capacity: {rec.resource.capacity} people</span>
                        {rec.resource.propertyId && (
                          <span>• {rec.resource.propertyId.name} ({rec.resource.propertyId.location?.city})</span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onClose();
                        navigate(`/resources/${rec.resource._id}`);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/20 shrink-0 self-start sm:self-auto active:scale-95 transition-all"
                    >
                      Book Slot
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}