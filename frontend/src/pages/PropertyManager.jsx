import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Layers, 
  Plus, 
  MapPin, 
  Settings, 
  CalendarCheck, 
  AlertTriangle, 
  ExternalLink, 
  ShieldAlert, 
  Users, 
  ArrowLeft,
  X,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';

export default function PropertyManager() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [sections, setSections] = useState([]);
  const [resources, setResources] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('structure');

  // Modals
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isFloorModalOpen, setIsFloorModalOpen] = useState(false);
  const [isMaintModalOpen, setIsMaintModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Floor State
  const [newFloor, setNewFloor] = useState({ name: '', level: 1, description: '' });

  // New Room / Resource State
  const [newRoom, setNewRoom] = useState({
    name: '',
    sectionId: '',
    category: 'Meeting Room',
    resourceType: 'meeting_room',
    capacity: 6,
    pricing: { model: 'free', price: 0, currency: 'USD' },
    description: '',
    amenities: ['Gigabit Fiber Wi-Fi'],
  });

  // Maintenance State
  const [newMaint, setNewMaint] = useState({
    resourceId: '',
    startAt: '',
    endAt: '',
    reason: 'Preventative Facility Inspection & Maintenance',
  });

  useEffect(() => {
    fetchPropertyData();
  }, [id]);

  const fetchPropertyData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/properties/${id}`);
      setProperty(res.data.property);
      setSections(res.data.sections || []);
      setResources(res.data.resources || []);

      fetchSecondaryData();
    } catch (err) {
      toast.error('Failed to load property details');
    } finally {
      setLoading(false);
    }
  };

  const fetchSecondaryData = async () => {
    try {
      const [analyticsRes, bookingsRes] = await Promise.all([
        api.get(`/properties/${id}/analytics`),
        api.get(`/properties/${id}/bookings`),
      ]);
      setAnalytics(analyticsRes.data.metrics);
      setBookings(bookingsRes.data.bookings || []);
    } catch (e) {}
  };

  const handleTogglePublish = async () => {
    try {
      if (property.status === 'published') {
        await api.post(`/properties/${id}/unpublish`);
        toast.success('Property unpublished to draft');
      } else {
        await api.post(`/properties/${id}/publish`);
        toast.success('Property is now published and publicly bookable!');
      }
      await fetchPropertyData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Publish status toggle failed');
    }
  };

  const handleCreateFloor = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post(`/properties/${id}/sections`, newFloor);
      toast.success(`Floor "${newFloor.name}" created!`);
      setIsFloorModalOpen(false);
      setNewFloor({ name: '', level: sections.length + 1, description: '' });
      await fetchPropertyData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add floor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post(`/properties/${id}/resources`, newRoom);
      toast.success(`Resource "${newRoom.name}" added to property!`);
      setIsRoomModalOpen(false);
      setNewRoom({
        name: '',
        sectionId: '',
        category: 'Meeting Room',
        resourceType: 'meeting_room',
        capacity: 6,
        pricing: { model: 'free', price: 0, currency: 'USD' },
        description: '',
        amenities: ['Gigabit Fiber Wi-Fi'],
      });
      await fetchPropertyData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add resource');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateMaintenance = async (e) => {
    e.preventDefault();
    if (!newMaint.resourceId) {
      toast.error('Please select a resource');
      return;
    }
    try {
      setSubmitting(true);
      const res = await api.post(
        `/properties/${id}/resources/${newMaint.resourceId}/maintenance`,
        {
          startAt: new Date(newMaint.startAt).toISOString(),
          endAt: new Date(newMaint.endAt).toISOString(),
          reason: newMaint.reason,
        }
      );
      if (res.data.warning) {
        toast(res.data.warning, { icon: '⚠️', duration: 6000 });
      } else {
        toast.success('Maintenance block scheduled successfully');
      }
      setIsMaintModalOpen(false);
      await fetchPropertyData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule maintenance');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-16">
        <div className="h-6 skeleton w-36 rounded-md"></div>
        <div className="glass-card rounded-3xl p-8 space-y-4">
          <div className="h-6 skeleton w-1/4 rounded-md"></div>
          <div className="h-8 skeleton w-1/2 rounded-md"></div>
          <div className="h-4 skeleton w-full rounded-md"></div>
        </div>
      </div>
    );
  }

  if (!property) return null;

  const isPublished = property.status === 'published';

  return (
    <div className="space-y-8 pb-16">
      {/* Breadcrumb */}
      <div>
        <Link
          to="/owner"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Owner Portal
        </Link>
      </div>

      {/* Property Hero Card */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start justify-between gap-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 dark:bg-brand-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="space-y-2.5 max-w-2xl relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-sm border ${
                isPublished 
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' 
                  : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
              }`}
            >
              Status: {property.status}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {property.type?.replace('_', ' ')}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              • {sections.length} Floor(s) • {resources.length} Resource(s)
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {property.name}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {property.description}
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
            <MapPin className="w-4 h-4 text-brand-500 shrink-0" />
            <span>{property.location?.address}, {property.location?.city}, {property.location?.country}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0 relative z-10">
          <Link
            to={`/properties/${property._id}`}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl glass-card text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 hover:border-brand-500/40"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Public Preview
          </Link>

          <button
            onClick={handleTogglePublish}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 ${
              isPublished
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/20'
            }`}
          >
            {isPublished ? 'Unpublish to Draft' : 'Publish Property Live'}
          </button>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200/80 dark:border-white/[0.08] space-x-6 text-sm font-semibold overflow-x-auto pb-1 transition-colors">
        <button
          onClick={() => setActiveTab('structure')}
          className={`pb-3 flex items-center gap-2 shrink-0 transition-colors ${
            activeTab === 'structure' 
              ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-600 dark:border-brand-400' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Floors & Resources ({resources.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('maintenance')}
          className={`pb-3 flex items-center gap-2 shrink-0 transition-colors ${
            activeTab === 'maintenance' 
              ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-600 dark:border-brand-400' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Maintenance Windows</span>
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 flex items-center gap-2 shrink-0 transition-colors ${
            activeTab === 'bookings' 
              ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-600 dark:border-brand-400' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Facility Bookings ({bookings.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 flex items-center gap-2 shrink-0 transition-colors ${
            activeTab === 'analytics' 
              ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-600 dark:border-brand-400' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Facility Analytics</span>
        </button>
      </div>

      {/* TAB 1: FLOORS & RESOURCES */}
      {activeTab === 'structure' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Physical Building Hierarchy</h2>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsFloorModalOpen(true)}
                className="px-3.5 py-2 rounded-xl glass-card text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 hover:border-brand-500/40 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-brand-500" />
                Add Floor
              </button>
              <button
                onClick={() => setIsRoomModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-brand-500/20 flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Resource / Room
              </button>
            </div>
          </div>

          {sections.map((floor) => {
            const floorResources = resources.filter(
              (r) => r.sectionId && r.sectionId.toString() === floor._id.toString()
            );

            return (
              <div key={floor._id} className="glass-card rounded-3xl p-6 sm:p-7 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-white/[0.08] pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200/50 dark:border-brand-800/50 flex items-center justify-center font-extrabold text-xs">
                      L{floor.level}
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">{floor.name}</h3>
                    <span className="text-xs text-slate-400 dark:text-slate-500">({floorResources.length} resources)</span>
                  </div>
                  <button
                    onClick={() => {
                      setNewRoom({ ...newRoom, sectionId: floor._id });
                      setIsRoomModalOpen(true);
                    }}
                    className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Room Here
                  </button>
                </div>

                {floorResources.length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic py-2">No rooms configured on this level yet.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {floorResources.map((r) => (
                      <div
                        key={r._id}
                        className="glass-card glass-card-hover p-4 rounded-2xl space-y-2.5 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{r.name}</span>
                          <span className="text-[10px] uppercase font-bold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded-md border border-brand-200/50">
                            {r.resourceType?.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{r.description || 'Standard facility resource'}</p>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/[0.06] text-xs">
                          <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1 font-medium">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            Capacity: {r.capacity}
                          </span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {r.pricing?.model === 'free' ? 'Complimentary' : `$${r.pricing?.price} / ${r.pricing?.model}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: MAINTENANCE BLOCKS */}
      {activeTab === 'maintenance' && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/70 dark:border-white/[0.08] pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Scheduled Maintenance Windows</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Temporarily mark slots unavailable for servicing, duct cleaning, or repairs.</p>
            </div>
            <button
              onClick={() => setIsMaintModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 flex items-center gap-1.5 self-start sm:self-auto active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Maintenance</span>
            </button>
          </div>

          <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 rounded-2xl text-xs flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <span className="leading-relaxed">
              During scheduled maintenance windows, the booking engine automatically disables affected discrete 30-min slots and returns 409 Conflict to concurrent requests.
            </span>
          </div>
        </div>
      )}

      {/* TAB 3: BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-slate-200/70 dark:border-white/[0.08]">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Tenant Bookings for this Facility</h2>
          </div>
          {bookings.length === 0 ? (
            <div className="py-20 text-center text-xs text-slate-400 dark:text-slate-500">No active bookings recorded for this property yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50/70 dark:bg-white/[0.02] text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200/70 dark:border-white/[0.08]">
                  <tr>
                    <th className="px-6 py-3.5">Reference</th>
                    <th className="px-6 py-3.5">Resource</th>
                    <th className="px-6 py-3.5">Tenant User</th>
                    <th className="px-6 py-3.5">UTC Schedule</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                  {bookings.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-brand-700 dark:text-brand-300">{b.reference}</td>
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{b.resourceId?.name}</td>
                      <td className="px-6 py-4">{b.userId?.name} ({b.userId?.email})</td>
                      <td className="px-6 py-4 text-xs font-mono">
                        {new Date(b.startAt).toLocaleString([], { timeZone: 'UTC' })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          b.status === 'confirmed' 
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ANALYTICS */}
      {activeTab === 'analytics' && analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-5 rounded-2xl space-y-1">
            <div className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase">Total Bookings</div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{analytics.totalBookings}</div>
          </div>
          <div className="glass-card p-5 rounded-2xl space-y-1">
            <div className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase">Confirmed Active</div>
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{analytics.confirmedBookings}</div>
          </div>
          <div className="glass-card p-5 rounded-2xl space-y-1">
            <div className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase">Upcoming Slots</div>
            <div className="text-3xl font-extrabold text-brand-600 dark:text-brand-400 mt-1">{analytics.upcomingBookings}</div>
          </div>
          <div className="glass-card p-5 rounded-2xl space-y-1">
            <div className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase">Cancellation Rate</div>
            <div className="text-3xl font-extrabold text-slate-700 dark:text-slate-300 mt-1">{analytics.cancellationRate}</div>
          </div>
        </div>
      )}

      {/* MODAL: ADD FLOOR */}
      {isFloorModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 space-y-5 border border-slate-200 dark:border-white/[0.1]"
          >
            <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-white/[0.08] pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Add Floor / Section</h3>
              <button onClick={() => setIsFloorModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateFloor} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Floor / Wing Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Floor 4 — Executive Level"
                  value={newFloor.name}
                  onChange={(e) => setNewFloor({ ...newFloor, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white shadow-sm"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Level Number</label>
                <input
                  type="number"
                  value={newFloor.level}
                  onChange={(e) => setNewFloor({ ...newFloor, level: parseInt(e.target.value) || 1 })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white shadow-sm"
                />
              </div>
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFloorModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-xl font-bold shadow-md shadow-brand-500/20 active:scale-95"
                >
                  Create Floor
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL: ADD ROOM / RESOURCE */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 border border-slate-200 dark:border-white/[0.1]"
          >
            <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-white/[0.08] pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Add Bookable Resource / Room</h3>
              <button onClick={() => setIsRoomModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateRoom} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Resource Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Video Studio 101"
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Floor / Section</label>
                  <select
                    value={newRoom.sectionId}
                    onChange={(e) => setNewRoom({ ...newRoom, sectionId: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white shadow-sm cursor-pointer"
                  >
                    <option value="">Unassigned</option>
                    {sections.map((s) => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Resource Type</label>
                  <select
                    value={newRoom.resourceType}
                    onChange={(e) => setNewRoom({ ...newRoom, resourceType: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white shadow-sm cursor-pointer"
                  >
                    <option value="meeting_room">Meeting Room</option>
                    <option value="desk">Dedicated Desk</option>
                    <option value="study_room">Study Pod</option>
                    <option value="sports_court">Sports Court</option>
                    <option value="event_hall">Event Hall</option>
                    <option value="lab">Research Lab</option>
                    <option value="parking">Parking Space</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Capacity</label>
                  <input
                    type="number"
                    min={1}
                    value={newRoom.capacity}
                    onChange={(e) => setNewRoom({ ...newRoom, capacity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white shadow-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Pricing Model</label>
                  <select
                    value={newRoom.pricing.model}
                    onChange={(e) =>
                      setNewRoom({
                        ...newRoom,
                        pricing: { ...newRoom.pricing, model: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white shadow-sm cursor-pointer"
                  >
                    <option value="free">Free / Complimentary</option>
                    <option value="fixed_slot">Fixed Price per Slot</option>
                    <option value="hourly">Hourly Rate</option>
                  </select>
                </div>
              </div>

              {newRoom.pricing.model !== 'free' && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Price ({newRoom.pricing.currency})</label>
                  <input
                    type="number"
                    min={0}
                    value={newRoom.pricing.price}
                    onChange={(e) =>
                      setNewRoom({
                        ...newRoom,
                        pricing: { ...newRoom.pricing, price: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white shadow-sm"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRoomModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-xl font-bold shadow-md shadow-brand-500/20 active:scale-95"
                >
                  Add Resource
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL: SCHEDULE MAINTENANCE */}
      {isMaintModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 space-y-5 border border-slate-200 dark:border-white/[0.1]"
          >
            <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-white/[0.08] pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Schedule Facility Maintenance</h3>
              <button onClick={() => setIsMaintModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateMaintenance} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Resource *</label>
                <select
                  required
                  value={newMaint.resourceId}
                  onChange={(e) => setNewMaint({ ...newMaint, resourceId: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white shadow-sm cursor-pointer"
                >
                  <option value="">-- Choose Room / Space --</option>
                  {resources.map((r) => (
                    <option key={r._id} value={r._id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Time (UTC)</label>
                <input
                  type="datetime-local"
                  required
                  value={newMaint.startAt}
                  onChange={(e) => setNewMaint({ ...newMaint, startAt: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white shadow-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">End Time (UTC)</label>
                <input
                  type="datetime-local"
                  required
                  value={newMaint.endAt}
                  onChange={(e) => setNewMaint({ ...newMaint, endAt: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white shadow-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Reason for Maintenance</label>
                <input
                  type="text"
                  required
                  value={newMaint.reason}
                  onChange={(e) => setNewMaint({ ...newMaint, reason: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white shadow-sm"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMaintModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-xl font-bold shadow-md shadow-brand-500/20 active:scale-95"
                >
                  Confirm Block
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}