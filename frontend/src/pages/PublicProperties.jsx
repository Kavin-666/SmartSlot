import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Search, 
  MapPin, 
  Layers, 
  ArrowRight, 
  CheckCircle2,
  Sparkles,
  SlidersHorizontal,
  Compass
} from 'lucide-react';

export default function PublicProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  useEffect(() => {
    fetchPublishedProperties();
  }, []);

  const fetchPublishedProperties = async () => {
    try {
      setLoading(true);
      const res = await api.get('/properties/public');
      setProperties(res.data.properties || []);
    } catch (err) {
      console.error('Failed to load published properties', err);
    } finally {
      setLoading(false);
    }
  };

  const cities = ['All', ...new Set(properties.map((p) => p.location?.city).filter(Boolean))];
  const types = ['All', ...new Set(properties.map((p) => p.type).filter(Boolean))];

  const filtered = properties.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = selectedCity === 'All' || p.location?.city === selectedCity;
    const matchesType = selectedType === 'All' || p.type === selectedType;
    return matchesSearch && matchesCity && matchesType;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header Banner */}
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
              <span>Verified Commercial Facilities</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Explore Properties
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Discover certified multi-floor tech campuses, research centers, and co-working facilities with real-time slot scheduling.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Showing <strong className="text-slate-900 dark:text-white font-bold">{filtered.length}</strong> of {properties.length} spaces
            </span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="mt-6 pt-6 border-t border-slate-200/70 dark:border-white/[0.08] grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by facility name, address, or city..."
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

          <div className="sm:col-span-3">
            <div className="relative">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white/90 dark:bg-slate-900/80 font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition-all shadow-sm cursor-pointer"
              >
                {cities.map((c) => (
                  <option key={c} value={c}>{c === 'All' ? 'All Locations' : c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="sm:col-span-3">
            <div className="relative">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white/90 dark:bg-slate-900/80 font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition-all shadow-sm cursor-pointer"
              >
                {types.map((t) => (
                  <option key={t} value={t}>{t === 'All' ? 'All Property Types' : t.replace('_', ' ').toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Loading Skeleton Grid */}
      {loading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="glass-card rounded-3xl overflow-hidden p-0 space-y-4">
              <div className="h-48 skeleton w-full"></div>
              <div className="p-6 space-y-3">
                <div className="h-5 skeleton rounded-md w-3/4"></div>
                <div className="h-4 skeleton rounded-md w-full"></div>
                <div className="h-4 skeleton rounded-md w-1/2"></div>
                <div className="pt-4 flex justify-between items-center">
                  <div className="h-4 skeleton rounded-md w-20"></div>
                  <div className="h-8 skeleton rounded-xl w-28"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid Content */}
      {!loading && (
        <>
          {filtered.length === 0 ? (
            <div className="glass-card text-center py-20 rounded-3xl p-8 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Compass className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">No commercial properties match criteria</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Try clearing your search query or switching your city / type filters.
                </p>
              </div>
              <button
                onClick={() => { setSearchTerm(''); setSelectedCity('All'); setSelectedType('All'); }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 border border-brand-200/60 dark:border-brand-800/60 hover:bg-brand-100 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((property, idx) => (
                <motion.div
                  key={property._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.05 }}
                  className="glass-card glass-card-hover rounded-3xl overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    {/* Media Image with Badges */}
                    <div className="relative h-52 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <img
                        src={property.coverImage || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'}
                        alt={property.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
                      
                      <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 text-white backdrop-blur-md border border-white/10 shadow-sm">
                          {property.type?.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="absolute bottom-3 right-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/90 text-white backdrop-blur-md shadow-sm flex items-center gap-1.5 border border-emerald-400/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                          Verified Space
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 space-y-3.5">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors tracking-tight">
                        {property.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {property.description || 'Modern commercial facility offering high-precision smart-slot reservations.'}
                      </p>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 pt-1">
                        <MapPin className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                        <span className="truncate">{property.location?.address}, {property.location?.city}</span>
                      </div>

                      {/* Amenities Chips */}
                      {property.amenities?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {property.amenities.slice(0, 3).map((a, i) => (
                            <span 
                              key={i} 
                              className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 font-medium border border-slate-200/50 dark:border-white/[0.06]"
                            >
                              {a}
                            </span>
                          ))}
                          {property.amenities.length > 3 && (
                            <span className="text-[10px] px-2 py-1 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-bold border border-brand-200/40 dark:border-brand-800/40">
                              +{property.amenities.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-4 px-6 bg-slate-50/70 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                      <Layers className="w-4 h-4 text-brand-500 dark:text-brand-400" />
                      {property.configuration?.floorsCount || 1} Levels Available
                    </span>

                    <Link
                      to={`/properties/${property._id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-sm shadow-brand-500/20 transition-all hover:scale-[1.02] active:scale-95"
                    >
                      <span>Explore Rooms</span>
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