import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  Building2, 
  MapPin, 
  Layers, 
  Users, 
  Phone, 
  ArrowLeft, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Compass
} from 'lucide-react';

export default function PropertyPublicDetail() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [sections, setSections] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFloorId, setActiveFloorId] = useState('all');

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/properties/${id}`);
      setProperty(res.data.property);
      setSections(res.data.sections || []);
      setResources(res.data.resources || []);
    } catch (err) {
      toast.error('Failed to load property details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-16">
        <div className="h-6 skeleton w-36 rounded-md"></div>
        <div className="glass-card rounded-3xl overflow-hidden p-0">
          <div className="h-72 skeleton w-full"></div>
          <div className="p-8 space-y-4">
            <div className="h-6 skeleton w-1/3 rounded-md"></div>
            <div className="h-4 skeleton w-full rounded-md"></div>
            <div className="h-4 skeleton w-2/3 rounded-md"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) return null;

  const filteredResources =
    activeFloorId === 'all'
      ? resources
      : resources.filter((r) => r.sectionId && r.sectionId.toString() === activeFloorId);

  return (
    <div className="space-y-8 pb-16">
      {/* Back button */}
      <div>
        <Link
          to="/properties"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Property Directory
        </Link>
      </div>

      {/* Property Hero */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card rounded-3xl overflow-hidden"
      >
        <div className="relative h-72 sm:h-96 w-full bg-slate-900 overflow-hidden">
          <img
            src={property.coverImage || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80'}
            alt={property.name}
            className="w-full h-full object-cover opacity-90 scale-100 hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent"></div>

          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md border border-white/20 shadow-sm">
                {property.type?.replace('_', ' ')}
              </span>
              <span className="text-xs text-slate-300 font-semibold px-2.5 py-0.5 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/10">
                {property.configuration?.floorsCount || 1} Levels Configured
              </span>
              <span className="text-xs text-emerald-400 font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950/60 backdrop-blur-md border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Instant Slot Reservation
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">{property.name}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-brand-400" />
                {property.location?.address}, {property.location?.city}, {property.location?.country}
              </span>
              {property.contact?.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-brand-400" />
                  {property.contact.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">About this Property</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">
              {property.description || 'Verified commercial space featuring high-concurrency bookable time slots with atomic lock guarantees.'}
            </p>
          </div>

          {/* Amenities */}
          {property.amenities?.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-slate-200/70 dark:border-white/[0.08]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Facility Amenities & Specifications
              </h3>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((a, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.08] text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Bookable Spaces Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-white/[0.08] pb-4 transition-colors">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Bookable Rooms & Workspaces</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Select a designated resource below to inspect real-time 30-min discrete time slots.</p>
          </div>

          {/* Floor Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveFloorId('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                activeFloorId === 'all'
                  ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-brand-500/20'
                  : 'glass-card text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Floors ({resources.length})
            </button>
            {sections.map((sec) => (
              <button
                key={sec._id}
                onClick={() => setActiveFloorId(sec._id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all shadow-sm ${
                  activeFloorId === sec._id
                    ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-brand-500/20'
                    : 'glass-card text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {sec.name}
              </button>
            ))}
          </div>
        </div>

        {/* Resource Cards Grid */}
        {filteredResources.length === 0 ? (
          <div className="py-16 text-center glass-card rounded-3xl p-8 space-y-3">
            <Layers className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No rooms configured on this level yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Please choose another floor tab above or return to view all spaces.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((res, idx) => {
              const floor = sections.find((s) => s._id === res.sectionId);
              return (
                <motion.div
                  key={res._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.04 }}
                  className="glass-card glass-card-hover rounded-3xl p-6 flex flex-col justify-between space-y-5 group"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200/50 dark:border-brand-800/50">
                        {res.resourceType?.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        {res.pricing?.model === 'free' ? 'Complimentary' : `$${res.pricing?.price} / ${res.pricing?.model}`}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors tracking-tight">
                        {res.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {res.description || 'Verified smart-slot bookable facility.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>Up to {res.capacity} people</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{floor ? floor.name : 'Main Facility'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3.5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                      <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
                      <span>Atomic Lock</span>
                    </div>

                    <Link
                      to={`/resources/${res._id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm shadow-brand-500/20 transition-all hover:scale-[1.02] active:scale-95"
                    >
                      <span>Check Slots & Book</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}