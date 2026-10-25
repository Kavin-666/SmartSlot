import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/api';
import toast from 'react-hot-toast';
import { 
  Building2, 
  Layers, 
  Plus, 
  MapPin, 
  Settings, 
  CalendarCheck, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  ShieldAlert, 
  Users, 
  Trash2,
  DollarSign,
  ArrowLeft,
  Calendar,
  Sparkles
} from 'lucide-react';

export default function PropertyManager() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [sections, setSections] = useState([]);
  const [resources, setResources] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('structure'); // 'structure' | 'maintenance' | 'bookings' | 'analytics' | 'audit'

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

      // If activeTab is bookings or analytics, fetch them
      fetchSecondaryData();
    } catch (err) {
      toast.error('Failed to load property details');
    } finally {
      setLoading(false);
    }
  };

  const fetchSecondaryData = async () => {
    try {
      const [analyticsRes, bookingsRes, auditRes] = await Promise.all([
        api.get(`/properties/${id}/analytics`),
        api.get(`/properties/${id}/bookings`),
        api.get(`/properties/${id}/audit-logs`),
      ]);
      setAnalytics(analyticsRes.data.metrics);
      setBookings(bookingsRes.data.bookings || []);
      setAuditLogs(auditRes.data.logs || []);
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
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-medium text-slate-500">Loading facility management workspace...</p>
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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Owner Portal
        </Link>
      </div>

      {/* Property Hero Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row items-start justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}
            >
              Status: {property.status}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {property.type?.replace('_', ' ')}
            </span>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{property.name}</h1>
          <p className="text-sm text-slate-600">{property.description}</p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span>{property.location?.address}, {property.location?.city}, {property.location?.country}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
          <Link
            to={`/properties/${property._id}`}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Public Preview
          </Link>

          <button
            onClick={handleTogglePublish}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 ${
              isPublished
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100'
            }`}
          >
            {isPublished ? 'Unpublish to Draft' : 'Publish Property Live'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-sm font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('structure')}
          className={`pb-3 flex items-center gap-1.5 shrink-0 transition-colors ${
            activeTab === 'structure' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Floors & Resources ({resources.length})
        </button>
        <button
          onClick={() => setActiveTab('maintenance')}
          className={`pb-3 flex items-center gap-1.5 shrink-0 transition-colors ${
            activeTab === 'maintenance' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Maintenance Blocks
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 flex items-center gap-1.5 shrink-0 transition-colors ${
            activeTab === 'bookings' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          Property Bookings ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 flex items-center gap-1.5 shrink-0 transition-colors ${
            activeTab === 'analytics' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          Facility Analytics
        </button>
      </div>

      {/* TAB 1: FLOORS & RESOURCES */}
      {activeTab === 'structure' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Physical Building Hierarchy</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFloorModalOpen(true)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Floor
              </button>
              <button
                onClick={() => setIsRoomModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-100 flex items-center gap-1.5"
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
              <div key={floor._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-extrabold text-xs">
                      L{floor.level}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base">{floor.name}</h3>
                    <span className="text-xs text-slate-400">({floorResources.length} resources)</span>
                  </div>
                  <button
                    onClick={() => {
                      setNewRoom({ ...newRoom, sectionId: floor._id });
                      setIsRoomModalOpen(true);
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add Room Here
                  </button>
                </div>

                {floorResources.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">No resources assigned to this floor yet.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {floorResources.map((r) => (
                      <div
                        key={r._id}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 hover:border-indigo-300 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{r.name}</span>
                          <span className="text-[10px] uppercase font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.2 rounded">
                            {r.resourceType?.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{r.description || 'Standard facility resource'}</p>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                          <span className="text-slate-600 flex items-center gap-1">
                            <Users className="w-3 h-3 text-slate-400" />
                            Capacity: {r.capacity}
                          </span>
                          <span className="font-bold text-emerald-700">
                            {r.pricing?.model === 'free' ? 'Free' : `$${r.pricing?.price} / ${r.pricing?.model}`}
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
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Scheduled Maintenance Windows</h2>
              <p className="text-xs text-slate-500">Temporarily mark slots unavailable for cleaning, duct work, or repairs.</p>
            </div>
            <button
              onClick={() => setIsMaintModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Schedule Maintenance
            </button>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              During scheduled maintenance windows, the booking engine automatically disables affected slots and returns 409 Conflict to concurrent requests.
            </span>
          </div>
        </div>
      )}

      {/* TAB 3: BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Tenant Bookings for this Facility</h2>
          </div>
          {bookings.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">No active bookings recorded for this property yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3">Reference</th>
                    <th className="px-6 py-3">Resource</th>
                    <th className="px-6 py-3">User</th>
                    <th className="px-6 py-3">Date & Time (UTC)</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((b) => (
                    <tr key={b._id}>
                      <td className="px-6 py-4 font-mono text-xs font-bold text-indigo-700">{b.reference}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{b.resourceId?.name}</td>
                      <td className="px-6 py-4">{b.userId?.name} ({b.userId?.email})</td>
                      <td className="px-6 py-4 text-xs font-mono">
                        {new Date(b.startAt).toLocaleString([], { timeZone: 'UTC' })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
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
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <div className="text-xs text-slate-400 font-bold uppercase">Total Bookings</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{analytics.totalBookings}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <div className="text-xs text-slate-400 font-bold uppercase">Confirmed Active</div>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">{analytics.confirmedBookings}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <div className="text-xs text-slate-400 font-bold uppercase">Upcoming Slots</div>
            <div className="text-2xl font-extrabold text-indigo-600 mt-1">{analytics.upcomingBookings}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <div className="text-xs text-slate-400 font-bold uppercase">Cancellation Rate</div>
            <div className="text-2xl font-extrabold text-slate-700 mt-1">{analytics.cancellationRate}</div>
          </div>
        </div>
      )}

      {/* MODAL: ADD FLOOR */}
      {isFloorModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Add Floor / Section</h3>
              <button onClick={() => setIsFloorModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateFloor} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Floor / Wing Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Floor 4 — Executive Level"
                  value={newFloor.name}
                  onChange={(e) => setNewFloor({ ...newFloor, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Level Number</label>
                <input
                  type="number"
                  value={newFloor.level}
                  onChange={(e) => setNewFloor({ ...newFloor, level: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFloorModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold"
                >
                  Create Floor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD ROOM / RESOURCE */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Add Bookable Resource / Room</h3>
              <button onClick={() => setIsRoomModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateRoom} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Resource Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Video Studio 101"
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Floor / Section</label>
                  <select
                    value={newRoom.sectionId}
                    onChange={(e) => setNewRoom({ ...newRoom, sectionId: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="">Unassigned</option>
                    {sections.map((s) => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Resource Type</label>
                  <select
                    value={newRoom.resourceType}
                    onChange={(e) => setNewRoom({ ...newRoom, resourceType: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
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
                  <label className="block font-semibold text-slate-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    min={1}
                    value={newRoom.capacity}
                    onChange={(e) => setNewRoom({ ...newRoom, capacity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pricing Model</label>
                  <select
                    value={newRoom.pricing.model}
                    onChange={(e) =>
                      setNewRoom({
                        ...newRoom,
                        pricing: { ...newRoom.pricing, model: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="free">Free / Complimentary</option>
                    <option value="fixed_slot">Fixed Price per Slot</option>
                    <option value="hourly">Hourly Rate</option>
                  </select>
                </div>
              </div>

              {newRoom.pricing.model !== 'free' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price ({newRoom.pricing.currency})</label>
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
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRoomModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold"
                >
                  Add Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SCHEDULE MAINTENANCE */}
      {isMaintModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Schedule Facility Maintenance</h3>
              <button onClick={() => setIsMaintModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateMaintenance} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Resource *</label>
                <select
                  required
                  value={newMaint.resourceId}
                  onChange={(e) => setNewMaint({ ...newMaint, resourceId: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                >
                  <option value="">-- Choose Room / Space --</option>
                  {resources.map((r) => (
                    <option key={r._id} value={r._id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Start Time (UTC)</label>
                <input
                  type="datetime-local"
                  required
                  value={newMaint.startAt}
                  onChange={(e) => setNewMaint({ ...newMaint, startAt: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">End Time (UTC)</label>
                <input
                  type="datetime-local"
                  required
                  value={newMaint.endAt}
                  onChange={(e) => setNewMaint({ ...newMaint, endAt: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Maintenance</label>
                <input
                  type="text"
                  required
                  value={newMaint.reason}
                  onChange={(e) => setNewMaint({ ...newMaint, reason: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMaintModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold"
                >
                  Confirm Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
