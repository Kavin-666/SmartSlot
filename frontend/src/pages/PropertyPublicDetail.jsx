import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/api';
import toast from 'react-hot-toast';
import { 
  Building2, 
  MapPin, 
  Layers, 
  Users, 
  Clock, 
  Phone, 
  Mail, 
  Globe, 
  ArrowLeft, 
  CheckCircle2, 
  Calendar,
  Sparkles,
  ArrowRight
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
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-medium text-slate-500">Loading property profile and available spaces...</p>
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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Property Directory
        </Link>
      </div>

      {/* Property Hero */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="relative h-64 sm:h-80 w-full bg-slate-900">
          <img
            src={property.coverImage || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80'}
            alt={property.name}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>

          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md">
                {property.type?.replace('_', ' ')}
              </span>
              <span className="text-xs text-slate-300 font-medium">
                {property.configuration?.floorsCount || 1} Levels Available
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{property.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                {property.location?.address}, {property.location?.city}, {property.location?.country}
              </span>
              {property.contact?.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-indigo-400" />
                  {property.contact.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">About this Property</h2>
            <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
              {property.description || 'Verified commercial space featuring high-concurrency bookable time slots.'}
            </p>
          </div>

          {/* Amenities */}
          {property.amenities?.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Property Amenities & Facilities</h3>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((a, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bookable Spaces Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Bookable Rooms & Workspaces</h2>
            <p className="text-xs text-slate-500">Select a space to view real-time 30-min discrete time slots.</p>
          </div>

          {/* Floor Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveFloorId('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFloorId === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              All Floors ({resources.length})
            </button>
            {sections.map((sec) => (
              <button
                key={sec._id}
                onClick={() => setActiveFloorId(sec._id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  activeFloorId === sec._id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {sec.name}
              </button>
            ))}
          </div>
        </div>

        {/* Resource Cards Grid */}
        {filteredResources.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-slate-300 p-8 space-y-2">
            <Layers className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No rooms configured on this level yet</h3>
            <p className="text-xs text-slate-500">Please choose another floor to explore available spaces.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((res) => {
              const floor = sections.find((s) => s._id === res.sectionId);
              return (
                <div
                  key={res._id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between space-y-4 hover:border-slate-300 hover:shadow-md transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700">
                        {res.resourceType?.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-bold text-emerald-700">
                        {res.pricing?.model === 'free' ? 'Complimentary' : `$${res.pricing?.price} / ${res.pricing?.model}`}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {res.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {res.description || 'Verified smart-slot bookable facility.'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>Up to {res.capacity} people</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{floor ? floor.name : 'Main Facility'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Zero Double-Book Guard</span>
                    <Link
                      to={`/resources/${res._id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-100 transition-all"
                    >
                      <span>Check Slots & Book</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
