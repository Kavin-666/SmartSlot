import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { 
  Building2, 
  Search, 
  MapPin, 
  Layers, 
  ArrowRight, 
  Filter, 
  CheckCircle2,
  Sparkles
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
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs tracking-wider uppercase mb-1">
            <Building2 className="w-4 h-4" />
            Verified Commercial Facilities
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Explore Properties</h1>
          <p className="text-slate-500 text-sm mt-1">
            Discover verified multi-floor tech buildings, research centers, and co-working spaces.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by building or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
            >
              {cities.map((c) => (
                <option key={c} value={c}>{c === 'All' ? 'All Cities' : c}</option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
            >
              {types.map((t) => (
                <option key={t} value={t}>{t === 'All' ? 'All Types' : t.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium text-slate-500">Retrieving published facility directory...</p>
        </div>
      )}

      {/* Grid */}
      {!loading && (
        <>
          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 p-8 space-y-3">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-base">No properties found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No published properties matched your search parameters.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((property) => (
                <div
                  key={property._id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                      <img
                        src={property.coverImage || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'}
                        alt={property.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-sm">
                          {property.type?.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="absolute bottom-3 right-3">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-sm flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Verified Space
                        </span>
                      </div>
                    </div>

                    <div className="p-6 space-y-3">
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {property.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {property.description || 'Modern facility offering smart time-slot reservations.'}
                      </p>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{property.location?.address}, {property.location?.city}</span>
                      </div>

                      {/* Amenities Chips */}
                      {property.amenities?.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-2">
                          {property.amenities.slice(0, 3).map((a, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                              {a}
                            </span>
                          ))}
                          {property.amenities.length > 3 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-bold">
                              +{property.amenities.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-indigo-500" />
                      {property.configuration?.floorsCount || 1} Floors
                    </span>

                    <Link
                      to={`/properties/${property._id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-indigo-100 transition-all"
                    >
                      <span>Explore Rooms</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
