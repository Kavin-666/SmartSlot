import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  BookmarkCheck, 
  Clock, 
  Calendar, 
  XCircle, 
  Hourglass, 
  CheckCircle2, 
  AlertCircle,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Building2
} from 'lucide-react';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [waitlists, setWaitlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmCancelBooking, setConfirmCancelBooking] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, waitlistRes] = await Promise.all([
        api.get('/bookings/me'),
        api.get('/waitlist/me'),
      ]);
      setBookings(bookingsRes.data.bookings || []);
      setWaitlists(waitlistRes.data.entries || []);
    } catch (err) {
      toast.error('Failed to load your reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (booking) => {
    try {
      setCancellingId(booking._id);
      const res = await api.post(`/bookings/${booking._id}/cancel`);
      
      if (res.data?.promoted) {
        toast.success(
          'Booking cancelled. Earliest waitlisted user was automatically promoted into this slot!',
          { duration: 6000 }
        );
      } else {
        toast.success('Booking cancelled successfully and slot released.');
      }

      setConfirmCancelBooking(null);
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  const handleLeaveWaitlist = async (entry) => {
    try {
      await api.delete(`/waitlist/${entry._id}`);
      toast.success('Removed from waitlist');
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to leave waitlist');
    }
  };

  const formatDateTime = (iso) => {
    const d = new Date(iso);
    const dateStr = d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    });
    const timeStr = d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
    });
    return { dateStr, timeStr };
  };

  const activeBookings = bookings.filter((b) => b.status === 'confirmed');
  const pastBookings = bookings.filter((b) => b.status !== 'confirmed');

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

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800/60">
              <BookmarkCheck className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>Reservation Management</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              My Bookings & Waitlists
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
              Track confirmed time slots, review status history, and monitor automated waitlist queues in real time.
            </p>
          </div>

          <Link
            to="/resources"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition-all hover:scale-[1.02] active:scale-95 self-start sm:self-auto shrink-0"
          >
            <span>Book Another Slot</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Tab Controls */}
        <div className="mt-8 pt-6 border-t border-slate-200/70 dark:border-white/[0.08] flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 ${
              activeTab === 'active'
                ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-brand-500/20'
                : 'glass-card text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Confirmed Active</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${activeTab === 'active' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
              {activeBookings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('waitlist')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 ${
              activeTab === 'waitlist'
                ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-brand-500/20'
                : 'glass-card text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Hourglass className="w-3.5 h-3.5" />
            <span>Waitlisted Slots</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${activeTab === 'waitlist' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
              {waitlists.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-brand-500/20'
                : 'glass-card text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>History & Cancelled</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${activeTab === 'history' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
              {pastBookings.length}
            </span>
          </button>
        </div>
      </motion.div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-4 skeleton w-24 rounded-md"></div>
                <div className="h-5 skeleton w-20 rounded-full"></div>
              </div>
              <div className="h-6 skeleton w-2/3 rounded-md"></div>
              <div className="h-10 skeleton rounded-xl w-full"></div>
            </div>
          ))}
        </div>
      )}

      {/* Content based on Active Tab */}
      {!loading && (
        <>
          {activeTab === 'active' && (
            <div>
              {activeBookings.length === 0 ? (
                <div className="text-center py-20 glass-card rounded-3xl p-8 space-y-4">
                  <BookmarkCheck className="w-14 h-14 text-slate-400 mx-auto" />
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">No active reservations</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                      You currently have no confirmed bookings. Browse available resources to reserve a time slot.
                    </p>
                  </div>
                  <Link
                    to="/resources"
                    className="inline-block px-5 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20"
                  >
                    Browse Directory
                  </Link>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {activeBookings.map((b) => {
                    const { dateStr, timeStr: startStr } = formatDateTime(b.startAt);
                    const { timeStr: endStr } = formatDateTime(b.endAt);

                    return (
                      <motion.div
                        key={b._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card glass-card-hover rounded-3xl p-6 flex flex-col justify-between space-y-4 group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-mono text-[10px] font-bold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/60 px-2.5 py-1 rounded-lg border border-brand-200/50 dark:border-brand-800/50">
                              REF: {b.reference}
                            </span>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                              {b.resourceId?.name || 'Resource'}
                            </h3>
                          </div>
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Confirmed
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-400 glass-card p-3.5 rounded-xl border border-slate-200/50 dark:border-white/[0.06]">
                          <div className="flex items-center gap-1.5 font-medium">
                            <Calendar className="w-4 h-4 text-brand-500" />
                            <span className="text-slate-800 dark:text-slate-200">{dateStr}</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-medium">
                            <Clock className="w-4 h-4 text-brand-500" />
                            <span className="text-slate-800 dark:text-slate-200">{startStr} – {endStr}</span>
                          </div>
                        </div>

                        <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-white/[0.06]">
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Atomic Lock Active</span>
                          </div>
                          <button
                            onClick={() => setConfirmCancelBooking(b)}
                            className="px-3.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Cancel Booking</span>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'waitlist' && (
            <div>
              {waitlists.length === 0 ? (
                <div className="text-center py-20 glass-card rounded-3xl p-8 space-y-3">
                  <Hourglass className="w-14 h-14 text-slate-400 mx-auto" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">No waitlist entries</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    You are not currently queued for any occupied slots. If you join a waitlist, you will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {waitlists.map((entry) => {
                    const { dateStr, timeStr: startStr } = formatDateTime(entry.slotId?.startAt);
                    const { timeStr: endStr } = formatDateTime(entry.slotId?.endAt);

                    return (
                      <motion.div
                        key={entry._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card glass-card-hover rounded-3xl p-6 flex flex-col justify-between space-y-4"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
                              Queued for Promotion
                            </span>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">
                              {entry.resourceId?.name || 'Resource'}
                            </h3>
                          </div>
                          <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1.5">
                            <Hourglass className="w-3.5 h-3.5" />
                            Auto-Promote Active
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-400 glass-card p-3.5 rounded-xl border border-slate-200/50 dark:border-white/[0.06]">
                          <div className="flex items-center gap-1.5 font-medium">
                            <Calendar className="w-4 h-4 text-amber-500" />
                            <span className="text-slate-800 dark:text-slate-200">{dateStr}</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-medium">
                            <Clock className="w-4 h-4 text-amber-500" />
                            <span className="text-slate-800 dark:text-slate-200">{startStr} – {endStr}</span>
                          </div>
                        </div>

                        <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-white/[0.06]">
                          <span className="text-[11px] text-slate-400 dark:text-slate-500">
                            Enqueued: {new Date(entry.createdAt).toLocaleDateString()}
                          </span>
                          <button
                            onClick={() => handleLeaveWaitlist(entry)}
                            className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/[0.1] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-all flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Leave Waitlist</span>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              {pastBookings.length === 0 ? (
                <div className="text-center py-20 glass-card rounded-3xl p-8 space-y-2">
                  <Clock className="w-14 h-14 text-slate-400 mx-auto" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">No previous bookings</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Your cancelled or completed reservations will appear here.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {pastBookings.map((b) => {
                    const { dateStr, timeStr: startStr } = formatDateTime(b.startAt);
                    const { timeStr: endStr } = formatDateTime(b.endAt);

                    return (
                      <div
                        key={b._id}
                        className="glass-card rounded-3xl p-5 opacity-80 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">REF: {b.reference}</span>
                          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                            {b.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200">{b.resourceId?.name || 'Resource'}</h4>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex gap-4">
                          <span>{dateStr}</span>
                          <span>{startStr} – {endStr}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Confirmation Modal for Booking Cancellation */}
      {confirmCancelBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-5 border border-slate-200 dark:border-white/[0.1]"
          >
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Cancel Reservation?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">This action will release your reserved slot immediately.</p>
              </div>
            </div>

            <div className="p-4 glass-card rounded-2xl text-xs text-slate-700 dark:text-slate-300 space-y-1.5 border border-slate-200/60 dark:border-white/[0.06]">
              <div><strong>Resource:</strong> {confirmCancelBooking.resourceId?.name}</div>
              <div><strong>Booking Ref:</strong> <span className="font-mono">{confirmCancelBooking.reference}</span></div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              If other users are currently waiting on the waitlist for this slot, the earliest queued user will be promoted automatically with zero manual intervention.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmCancelBooking(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={cancellingId === confirmCancelBooking._id}
                onClick={() => handleCancelBooking(confirmCancelBooking)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 flex items-center gap-1.5 disabled:opacity-50 transition-all active:scale-95"
              >
                {cancellingId === confirmCancelBooking._id ? 'Releasing...' : 'Confirm Cancellation'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}