import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import toast from 'react-hot-toast';
import { 
  Sparkles, 
  X, 
  Building2, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  MapPin, 
  Users,
  Compass,
  Lightbulb
} from 'lucide-react';

export default function AIAssistantModal({ isOpen, onClose, onApplyDraft }) {
  const [activeTab, setActiveTab] = useState('property'); // 'property' | 'recommend'
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
      // Store in sessionStorage and navigate to wizard
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
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-100">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">SmartSlot AI Co-Pilot</h2>
              <p className="text-xs text-slate-500">Autonomous property setup & intelligent resource matching</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 space-x-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('property')}
            className={`pb-3 flex items-center gap-1.5 transition-colors ${
              activeTab === 'property'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Property Setup Assistant
          </button>
          <button
            onClick={() => setActiveTab('recommend')}
            className={`pb-3 flex items-center gap-1.5 transition-colors ${
              activeTab === 'recommend'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Compass className="w-4 h-4" />
            Smart Resource Finder
          </button>
        </div>

        {/* TAB 1: PROPERTY DRAFT GENERATOR */}
        {activeTab === 'property' && (
          <div className="space-y-5">
            <p className="text-xs text-slate-600 leading-relaxed">
              Describe your physical building, facility type, floors, and rooms in natural language.
              The AI Co-pilot extracts structured metadata and prepares a draft for the Property Wizard.
            </p>

            <form onSubmit={handleGenerateDraft} className="space-y-3">
              <textarea
                rows={3}
                required
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. I have a 3-floor co-working facility called Silicon Prairie Hub in Austin with high-speed fiber internet, parking, podcast booth, and meeting rooms for 10 people."
                className="w-full p-3.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  Deterministic extraction fallback active (No API key needed)
                </span>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-indigo-100 flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Analyzing Structure...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Property Draft</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Extracted Draft Preview */}
            {draftResult && (
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4 animate-in fade-in">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                      Structured Extraction Complete
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">{draftResult.name}</h3>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Schema
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200/80">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Location</span>
                    <span className="font-bold text-slate-800">{draftResult.location?.city}, {draftResult.location?.country}</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200/80">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Floors Provisioned</span>
                    <span className="font-bold text-slate-800">{draftResult.configuration?.floorsCount} Level(s)</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase mb-1">Detected Amenities</span>
                  <div className="flex flex-wrap gap-1.5">
                    {draftResult.amenities?.map((a, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded-md font-medium">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Ready to review and publish?</span>
                  <button
                    onClick={handleUseDraftInWizard}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm shadow-indigo-100 flex items-center gap-1.5"
                  >
                    <span>Load into Property Wizard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SMART RESOURCE FINDER */}
        {activeTab === 'recommend' && (
          <div className="space-y-5">
            <p className="text-xs text-slate-600 leading-relaxed">
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
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={recCapacity}
                  onChange={(e) => setRecCapacity(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                >
                  <option value="1">1 Person</option>
                  <option value="4">4+ People</option>
                  <option value="8">8+ People</option>
                  <option value="12">12+ People</option>
                </select>
                <button
                  type="submit"
                  disabled={recLoading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shrink-0 flex items-center gap-1 disabled:opacity-50"
                >
                  <Search className="w-3.5 h-3.5" />
                  Search
                </button>
              </div>
            </form>

            {recLoading && (
              <div className="py-10 text-center space-y-2">
                <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs text-slate-500">Evaluating verified resource inventory...</p>
              </div>
            )}

            {!recLoading && recResults.length > 0 && (
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Top Recommended Matches ({recResults.length})
                </span>
                {recResults.map((rec, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-indigo-300 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{rec.resource.name}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 bg-indigo-50 text-indigo-700 rounded">
                          Score: {rec.score}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{rec.explanation}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span>Capacity: {rec.resource.capacity}</span>
                        {rec.resource.propertyId && (
                          <span>Facility: {rec.resource.propertyId.name} ({rec.resource.propertyId.location?.city})</span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onClose();
                        navigate(`/resources/${rec.resource._id}`);
                      }}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm shrink-0 self-start sm:self-auto"
                    >
                      Book This Slot
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
