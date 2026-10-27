import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { motion } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Users, 
  Clock, 
  ArrowRight,
  Building2,
  Sparkles,
  Layers,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await api.get('/resources');
      setResources(res.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...new Set(resources.map((r) => r.category).filter(Boolean))];

  const filtered = resources.filter((r) => {
    const matchesSearch =
      r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || r.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 dark:bg-brand-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800/60">
              <Building2 className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>Verified Facility Directory</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Available Resources
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Discover bookable conference rooms, private focus pods, laboratory equipment, and workspaces with discrete 30-minute reservation intervals.
            </p>
          </div>

          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 self-start md:self-auto">
            Showing <strong className="text-slate-900 dark:text-white font-bold">{filtered.length}</strong> of {resources.length} active spaces
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="mt-6 pt-6 border-t border-slate-200/70 dark:border-white/[0.08] flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by facility name, campus, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition-all shadow-sm"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>

          <div className="w-full sm:w-60">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white/90 dark:bg-slate-900/80 font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition-all shadow-sm cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Loading & Error States */}
      {loading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="glass-card rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-4 skeleton w-20 rounded-md"></div>
                <div className="h-4 skeleton w-16 rounded-full"></div>
              </div>
              <div className="h-6 skeleton w-3/4 rounded-md"></div>
              <div className="h-4 skeleton w-full rounded-md"></div>
              <div className="h-4 skeleton w-2/3 rounded-md"></div>
              <div className="pt-4 border-t border-slate-100 dark:border-white/[0.06] flex justify-between items-center">
                <div className="h-4 skeleton w-24 rounded-md"></div>
                <div className="h-8 skeleton w-24 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="p-4 glass-card border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm rounded-2xl flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchResources}
            className="px-3.5 py-1.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold rounded-xl hover:bg-rose-100 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Resource Grid */}
      {!loading && !error && (
        <>
          {filtered.length === 0 ? (
            <div className="glass-card text-center py-20 rounded-3xl p-8 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Building2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">No resources found</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  No facilities matched your current filter criteria. Try adjusting your search query or category filter.
                </p>
              </div>
              <button
                onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 border border-brand-200/60 dark:border-brand-800/60 hover:bg-brand-100 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((resource, idx) => (
                <motion.div
                  key={resource._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.04 }}
                  className="glass-card glass-card-hover rounded-3xl p-6 flex flex-col justify-between space-y-5 group"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200/50 dark:border-brand-800/50">
                        {resource.category || 'General'}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Active
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors tracking-tight">
                        {resource.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                        {resource.description || 'Verified bookable resource with schedule slot enforcement.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] grid grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5 font-medium">
                        <MapPin className="w-4 h-4 text-brand-500 shrink-0" />
                        <span className="truncate">{resource.location || 'Campus / Site'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <Users className="w-4 h-4 text-brand-500 shrink-0" />
                        <span>Capacity: {resource.capacity || 1}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-brand-500" />
                      <span>Discrete 30m slots</span>
                    </div>

                    <Link
                      to={`/resources/${resource._id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold shadow-sm shadow-brand-500/20 transition-all hover:scale-[1.02] active:scale-95"
                    >
                      <span>Book Slot</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}