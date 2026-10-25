import React, { useEffect, useState } from 'react';
import api from '../api/api';
import toast from 'react-hot-toast';
import { 
  ShieldCheck, 
  Users, 
  Building2, 
  CalendarCheck, 
  XCircle, 
  Clock, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle,
  Layers,
  Sparkles
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('resources'); // 'resources' | 'stats'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submittingResource, setSubmittingResource] = useState(false);

  // Form state for creating a new resource
  const [newResource, setNewResource] = useState({
    name: '',
    description: '',
    category: 'Meeting Room',
    location: '',
    capacity: 4,
    openingHours: [
      { day: 1, start: '09:00', end: '17:00' }, // Mon
      { day: 2, start: '09:00', end: '17:00' }, // Tue
      { day: 3, start: '09:00', end: '17:00' }, // Wed
      { day: 4, start: '09:00', end: '17:00' }, // Thu
      { day: 5, start: '09:00', end: '17:00' }, // Fri
    ],
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [dashRes, resRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/resources'),
      ]);
      setStats(dashRes.data);
      setResources(resRes.data || []);
    } catch (err) {
      toast.error('Failed to load administrative analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateResource = async (e) => {
    e.preventDefault();
    try {
      setSubmittingResource(true);
      await api.post('/resources', newResource);
      toast.success('Resource created successfully with operating hours!');
      setIsModalOpen(false);
      setNewResource({
        name: '',
        description: '',
        category: 'Meeting Room',
        location: '',
        capacity: 4,
        openingHours: [
          { day: 1, start: '09:00', end: '17:00' },
          { day: 2, start: '09:00', end: '17:00' },
          { day: 3, start: '09:00', end: '17:00' },
          { day: 4, start: '09:00', end: '17:00' },
          { day: 5, start: '09:00', end: '17:00' },
        ],
      });
      await fetchAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create resource');
    } finally {
      setSubmittingResource(false);
    }
  };

  const handleDeactivate = async (resourceId) => {
    if (!window.confirm('Are you sure you want to deactivate this resource?')) return;
    try {
      await api.delete(`/resources/${resourceId}`);
      toast.success('Resource deactivated');
      await fetchAdminData();
    } catch (err) {
      toast.error('Failed to deactivate resource');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-700 font-semibold text-xs tracking-wider uppercase mb-1">
            <ShieldCheck className="w-4 h-4" />
            Administrative Control Panel
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Console</h1>
          <p className="text-slate-500 text-sm mt-1">
            Monitor real-time booking throughput, manage facility configurations, and oversee platform health.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-100 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create New Resource
        </button>
      </div>

      {/* Metrics Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Total Users</span>
              <Users className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{stats.users}</div>
            <div className="text-[10px] text-slate-400">Registered Accounts</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Active Resources</span>
              <Building2 className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{stats.resources}</div>
            <div className="text-[10px] text-slate-400">Bookable Facilities</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Confirmed</span>
              <CalendarCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-600">{stats.bookings?.confirmed}</div>
            <div className="text-[10px] text-slate-400">Active Reservations</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Upcoming</span>
              <Clock className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-extrabold text-indigo-600">{stats.bookings?.upcoming}</div>
            <div className="text-[10px] text-slate-400">Future Scheduled Slots</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Cancelled</span>
              <XCircle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-600">{stats.bookings?.cancelled}</div>
            <div className="text-[10px] text-slate-400">Released to Waitlist</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('resources')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'resources' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Manage Facilities ({resources.length})
        </button>
        <button
          onClick={() => setActiveTab('concurrency')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'concurrency' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Engine Status & Concurrency Safety
        </button>
      </div>

      {/* Resource Table */}
      {activeTab === 'resources' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Configured Resources</h3>
            <span className="text-xs text-slate-500 font-medium">Auto-populates 30-min discrete slots</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Resource Name</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Location</th>
                  <th className="px-6 py-3">Capacity</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resources.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{r.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700">
                        {r.category || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4">{r.location || 'N/A'}</td>
                    <td className="px-6 py-4">{r.capacity || 1} people</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeactivate(r._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Deactivate resource"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Engine Status Tab */}
      {activeTab === 'concurrency' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Atomic Concurrency Verification</h3>
              <p className="text-xs text-slate-500">Verified database guards protecting against double reservations</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-700">Guard 1: Slot Atomic Update</span>
              <p className="text-slate-500">Slot.findOneAndUpdate(&#123; _id, available: true &#125;)</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-700">Guard 2: Unique Partial Index</span>
              <p className="text-slate-500">Booking: resourceId + startAt (status: 'confirmed')</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-700">Guard 3: Auto-Waitlist Promotion</span>
              <p className="text-slate-500">Earliest FIFO queue promotion executed upon cancellation</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Creating New Resource */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg">Add New Facility Resource</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateResource} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Resource Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design Studio 2"
                  value={newResource.name}
                  onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newResource.category}
                    onChange={(e) => setNewResource({ ...newResource, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Meeting Room">Meeting Room</option>
                    <option value="Study Room">Study Room</option>
                    <option value="Lab & Equipment">Lab & Equipment</option>
                    <option value="Consultation">Consultation</option>
                    <option value="Coworking Space">Coworking Space</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newResource.capacity}
                    onChange={(e) => setNewResource({ ...newResource, capacity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Building B, Floor 3"
                  value={newResource.location}
                  onChange={(e) => setNewResource({ ...newResource, location: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Details regarding whiteboard, projector, or quiet zone..."
                  value={newResource.description}
                  onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600">
                Operating Schedule: Monday – Friday from 09:00 to 17:00 UTC (30-min discrete bookable slots automatically generated).
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingResource}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm shadow-indigo-100 disabled:opacity-50"
                >
                  {submittingResource ? 'Registering...' : 'Create Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
