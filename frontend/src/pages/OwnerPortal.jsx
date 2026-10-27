import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import AIAssistantModal from '../components/ai/AIAssistantModal';
import { 
  Building2, 
  Plus, 
  Sparkles, 
  MapPin, 
  Layers, 
  ExternalLink, 
  Settings, 
  TrendingUp,
  Clock,
  CheckCircle2,
  Sliders
} from 'lucide-react';

export default function OwnerPortal() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await api.get('/properties/mine/all');
      setProperties(res.data.properties || []);
    } catch (err) {
      toast.error('Failed to load owned properties');
    } finally {
      setLoading(false);
    }
  };

  const publishedCount = properties.filter((p) => p.status === 'published').length;
  const draftCount = properties.filter((p) => p.status === 'draft').length;
  const totalResources = properties.reduce((acc, p) => acc + (p.resourceCount || 0), 0);

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner */}
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
              <span>Multi-Tenant Property Workspace</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Owner Portal
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
              Manage your physical facilities, configure floors and bookable resources, and oversee tenant reservations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto shrink-0">
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-bold transition-all border border-purple-500/30 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>AI Co-Pilot</span>
            </button>
            <Link
              to="/owner/properties/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Property</span>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="glass-card p-5 rounded-2xl space-y-1 relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Total Properties</span>
            <Building2 className="w-4 h-4 text-brand-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{properties.length}</div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500">Registered Facilities</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="glass-card p-5 rounded-2xl space-y-1 relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Published Live</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{publishedCount}</div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500">Publicly Bookable</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="glass-card p-5 rounded-2xl space-y-1 relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>In Draft</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">{draftCount}</div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500">Pending Configuration</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="glass-card p-5 rounded-2xl space-y-1 relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Bookable Rooms</span>
            <Layers className="w-4 h-4 text-brand-500" />
          </div>
          <div className="text-3xl font-extrabold text-brand-600 dark:text-brand-400">{totalResources}</div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500">Configured Resources</div>
        </motion.div>
      </div>

      {/* Property List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Your Properties</h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">{properties.length} properties total</span>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="glass-card rounded-3xl overflow-hidden p-0 space-y-4">
                <div className="h-44 skeleton w-full"></div>
                <div className="p-6 space-y-3">
                  <div className="h-5 skeleton w-2/3 rounded-md"></div>
                  <div className="h-4 skeleton w-full rounded-md"></div>
                </div>
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-3xl p-8 space-y-4">
            <Building2 className="w-14 h-14 text-slate-400 mx-auto" />
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">No properties registered yet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Add your first commercial space or co-working building using the 5-step property wizard or AI Co-pilot.
              </p>
            </div>
            <Link
              to="/owner/properties/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Launch Property Creation Wizard</span>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {properties.map((p, idx) => {
              const isPublished = p.status === 'published';
              return (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.05 }}
                  className="glass-card glass-card-hover rounded-3xl overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    {/* Property Cover Image */}
                    <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <img
                        src={p.coverImage || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>

                      <div className="absolute top-3.5 right-3.5 flex gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-sm border ${
                            isPublished
                              ? 'bg-emerald-500/90 text-white border-emerald-400/30'
                              : 'bg-amber-500/90 text-white border-amber-400/30'
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 text-white backdrop-blur-md border border-white/10">
                          {p.type?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 space-y-3.5">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors tracking-tight">
                        {p.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {p.description || 'Verified multi-tenant commercial space with strict concurrency scheduling.'}
                      </p>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                        <span className="truncate">{p.location?.address}, {p.location?.city}</span>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Layers className="w-4 h-4 text-brand-500" />
                          <span><strong>{p.configuration?.floorsCount || 1}</strong> Floors</span>
                        </span>
                        <span className="font-medium">
                          <strong>{p.resourceCount || 0}</strong> Bookable Rooms
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-4 px-6 bg-slate-50/70 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between gap-3">
                    <Link
                      to={`/properties/${p._id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Public Preview</span>
                    </Link>

                    <Link
                      to={`/owner/properties/${p._id}/manage`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-sm shadow-brand-500/20 transition-all hover:scale-[1.02] active:scale-95"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Manage Facility</span>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* AI Assistant Modal */}
      <AIAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />
    </div>
  );
}