import React, { useEffect, useState } from 'react';
import api from '../api/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Users, 
  Building2, 
  CalendarCheck, 
  XCircle, 
  Clock, 
  Plus, 
  Trash2, 
  CheckCircle2,
  X,
  Zap,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('resources');
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
      { day: 1, start: '09:00', end: '17:00' },
      { day: 2, start: '09:00', end: '17:00' },
      { day: 3, start: '09:00', end: '17:00' },
      { day: 4, start: '09:00', end: '17:00' },
      { day: 5, start: '09:00', end: '17:00' },
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
    <div className="space-y-8 pb-16">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Administrative Control Center</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Admin Console
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
              Monitor real-time booking throughput, oversee platform health metrics, and configure global facility schedules.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition-all self-start sm:self-auto shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Resource</span>
          </button>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="glass-card p-5 rounded-2xl space-y-1 relative overflow-hidden"
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
              <span>Total Users</span>
              <Users className="w-4 h-4 text-brand-500" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.users}</div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500">Registered Accounts</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="glass-card p-5 rounded-2xl space-y-1 relative overflow-hidden"
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
              <span>Active Facilities</span>
              <Building2 className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.resources}</div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500">Bookable Resources</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="glass-card p-5 rounded-2xl space-y-1 relative overflow-hidden"
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
              <span>Confirmed</span>
              <CalendarCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{stats.bookings?.confirmed}</div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500">Active Reservations</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="glass-card p-5 rounded-2xl space-y-1 relative overflow-hidden"
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
              <span>Upcoming</span>
              <Clock className="w-4 h-4 text-brand-500" />
            </div>
            <div className="text-3xl font-extrabold text-brand-600 dark:text-brand-400">{stats.bookings?.upcoming}</div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500">Future Slots</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
            className="glass-card p-5 rounded-2xl space-y-1 relative overflow-hidden"
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
              <span>Cancelled</span>
              <XCircle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-3xl font-extrabold text-slate-600 dark:text-slate-400">{stats.bookings?.cancelled}</div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500">Released to Waitlist</div>
          </motion.div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200/80 dark:border-white/[0.08] space-x-6 text-sm font-semibold transition-colors">
        <button
          onClick={() => setActiveTab('resources')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'resources' 
              ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-600 dark:border-brand-400' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Manage Facilities ({resources.length})
        </button>
        <button
          onClick={() => setActiveTab('concurrency')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'concurrency' 
              ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-600 dark:border-brand-400' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Engine Status & Concurrency Safety
        </button>
      </div>

      {/* Resource Table */}
      {activeTab === 'resources' && (
        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200/70 dark:border-white/[0.08] flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Configured Resources</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Auto-populates 30-min discrete slots</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50/70 dark:bg-white/[0.02] text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200/70 dark:border-white/[0.08]">
                <tr>
                  <th className="px-6 py-3.5">Resource Name</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Location</th>
                  <th className="px-6 py-3.5">Capacity</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                {resources.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{r.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200/50">
                        {r.category || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">{r.location || 'N/A'}</td>
                    <td className="px-6 py-4 text-xs font-medium">{r.capacity || 1} people</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeactivate(r._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
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
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3.5 border-b border-slate-200/70 dark:border-white/[0.08] pb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Atomic Concurrency Verification</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Production guards protecting against simultaneous booking collisions</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-4 rounded-2xl glass-card border border-slate-200/60 dark:border-white/[0.06] space-y-1.5">
              <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-brand-500" />
                <span>Guard 1: Slot Atomic Update</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                Slot.findOneAndUpdate(&#123; _id, available: true &#125;) executed at database document level.
              </p>
            </div>
            <div className="p-4 rounded-2xl glass-card border border-slate-200/60 dark:border-white/[0.06] space-y-1.5">
              <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
                <span>Guard 2: Unique Partial Index</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                Compound index on (resourceId, startAt) with partial filter expression status: 'confirmed'.
              </p>
            </div>
            <div className="p-4 rounded-2xl glass-card border border-slate-200/60 dark:border-white/[0.06] space-y-1.5">
              <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-brand-500" />
                <span>Guard 3: Auto-Waitlist Promotion</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                FIFO promotion atomically advances queue occupant when confirmed slot is released.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Creating New Resource */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 border border-slate-200 dark:border-white/[0.1]"
          >
            <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-white/[0.08] pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">Add New Facility Resource</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateResource} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Resource Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design Studio 2"
                  value={newResource.name}
                  onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={newResource.category}
                    onChange={(e) => setNewResource({ ...newResource, category: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white shadow-sm cursor-pointer"
                  >
                    <option value="Meeting Room">Meeting Room</option>
                    <option value="Study Room">Study Room</option>
                    <option value="Lab & Equipment">Lab & Equipment</option>
                    <option value="Consultation">Consultation</option>
                    <option value="Coworking Space">Coworking Space</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Capacity</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newResource.capacity}
                    onChange={(e) => setNewResource({ ...newResource, capacity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Building B, Floor 3"
                  value={newResource.location}
                  onChange={(e) => setNewResource({ ...newResource, location: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white shadow-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Details regarding whiteboard, projector, or quiet zone..."
                  value={newResource.description}
                  onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white shadow-sm"
                />
              </div>

              <div className="p-3.5 glass-card rounded-xl text-[11px] text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-white/[0.06]">
                Operating Schedule: Monday – Friday from 09:00 to 17:00 UTC (30-min discrete bookable slots automatically generated).
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingResource}
                  className="px-5 py-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-md shadow-brand-500/20 disabled:opacity-50 active:scale-95 transition-all"
                >
                  {submittingResource ? 'Registering...' : 'Create Resource'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}