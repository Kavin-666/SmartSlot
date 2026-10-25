import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import toast from 'react-hot-toast';
import AIAssistantModal from '../components/ai/AIAssistantModal';
import { 
  Building2, 
  Plus, 
  Sparkles, 
  MapPin, 
  Layers, 
  CalendarCheck, 
  ExternalLink, 
  Settings, 
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Clock
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
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs tracking-wider uppercase mb-1">
            <Building2 className="w-4 h-4" />
            Multi-Tenant Property Workspace
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Owner Portal</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your physical facilities, configure floors and bookable resources, and oversee tenant reservations.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition-all border border-purple-200"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            AI Co-Pilot
          </button>
          <Link
            to="/owner/properties/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-100 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Property
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Properties</span>
            <Building2 className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{properties.length}</div>
          <div className="text-[10px] text-slate-400">Registered Facilities</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Published Live</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">{publishedCount}</div>
          <div className="text-[10px] text-slate-400">Publicly Bookable</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>In Draft</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600">{draftCount}</div>
          <div className="text-[10px] text-slate-400">Configuration Pending</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Configured Resources</span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-blue-600">{totalResources}</div>
          <div className="text-[10px] text-slate-400">Bookable Rooms & Desks</div>
        </div>
      </div>

      {/* Property List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Your Properties</h2>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-medium text-slate-500">Loading your property portfolio...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 p-8 space-y-4">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-lg">No properties registered yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Add your first commercial space or co-working building using the 5-step property wizard or AI Co-pilot.
              </p>
            </div>
            <Link
              to="/owner/properties/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100"
            >
              <Plus className="w-4 h-4" />
              Launch Property Creation Wizard
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {properties.map((p) => {
              const isPublished = p.status === 'published';
              return (
                <div
                  key={p._id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Property Cover Image */}
                    <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                      <img
                        src={p.coverImage || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3 flex gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-sm ${
                            isPublished
                              ? 'bg-emerald-500/90 text-white'
                              : 'bg-amber-500/90 text-white'
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-900/70 text-white backdrop-blur-sm">
                          {p.type?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 space-y-3">
                      <h3 className="text-xl font-bold text-slate-900">{p.name}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {p.description || 'Verified multi-tenant commercial space with strict concurrency scheduling.'}
                      </p>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{p.location?.address}, {p.location?.city}</span>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-indigo-500" />
                          <strong>{p.configuration?.floorsCount || 1}</strong> Floors
                        </span>
                        <span>
                          <strong>{p.resourceCount || 0}</strong> Bookable Rooms
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Link
                      to={`/properties/${p._id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Preview
                    </Link>

                    <Link
                      to={`/owner/properties/${p._id}/manage`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-indigo-100 transition-all"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      Manage Property & Rooms
                    </Link>
                  </div>
                </div>
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
