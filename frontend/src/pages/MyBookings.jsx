import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import toast from 'react-hot-toast';
import { 
  BookmarkCheck, 
  Clock, 
  Calendar, 
  XCircle, 
  Hourglass, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Trash2,
  ArrowRight
} from 'lucide-react';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [waitlists, setWaitlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'waitlist' | 'history'
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
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs tracking-wider uppercase mb-1">
            <BookmarkCheck className="w-4 h-4" />
            Reservation Management
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Bookings & Waitlists</h1>
          <p className="text-slate-500 text-sm mt-1">
            Track confirmed time slots, review status history, and monitor waitlist queues.
          </p>
        </div>

        <Link
          to="/resources"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-100 transition-all self-start sm:self-auto"
        >
          Book Another Slot
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'active' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Confirmed Active ({activeBookings.length})
        </button>

        <button
          onClick={() => setActiveTab('waitlist')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'waitlist' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Waitlisted Slots ({waitlists.length})
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'history' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          History & Cancelled ({pastBookings.length})
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium text-slate-500">Synchronizing reservation states...</p>
        </div>
      )}

      {/* Content based on Active Tab */}
      {!loading && (
        <>
          {activeTab === 'active' && (
            <div>
              {activeBookings.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8 space-y-3">
                  <BookmarkCheck className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="font-bold text-slate-800 text-base">No active reservations</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    You currently have no confirmed bookings. Browse available resources to reserve a time slot.
                  </p>
                  <Link
                    to="/resources"
                    className="inline-block mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold"
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
                      <div
                        key={b._id}
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                              REF: {b.reference}
                            </span>
                            <h3 className="text-lg font-bold text-slate-900 mt-2">
                              {b.resourceId?.name || 'Resource'}
                            </h3>
                          </div>
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Confirmed
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span className="font-medium">{dateStr}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span className="font-medium">{startStr} – {endStr}</span>
                          </div>
                        </div>

                        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                          <span className="text-[11px] text-slate-500">Atomic Lock Active</span>
                          <button
                            onClick={() => setConfirmCancelBooking(b)}
                            className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Cancel Booking
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'waitlist' && (
            <div>
              {waitlists.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8 space-y-3">
                  <Hourglass className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="font-bold text-slate-800 text-base">No waitlist entries</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    You are not currently queued for any occupied slots.
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {waitlists.map((entry) => {
                    const { dateStr, timeStr: startStr } = formatDateTime(entry.slotId?.startAt);
                    const { timeStr: endStr } = formatDateTime(entry.slotId?.endAt);

                    return (
                      <div
                        key={entry._id}
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between space-y-4"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                              Queued for Promotion
                            </span>
                            <h3 className="text-lg font-bold text-slate-900 mt-2">
                              {entry.resourceId?.name || 'Resource'}
                            </h3>
                          </div>
                          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1">
                            <Hourglass className="w-3.5 h-3.5" />
                            Auto-Promote Active
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span className="font-medium">{dateStr}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span className="font-medium">{startStr} – {endStr}</span>
                          </div>
                        </div>

                        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                          <span className="text-[11px] text-slate-500">
                            Enqueued: {new Date(entry.createdAt).toLocaleDateString()}
                          </span>
                          <button
                            onClick={() => handleLeaveWaitlist(entry)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Leave Waitlist
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              {pastBookings.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8 space-y-2">
                  <Clock className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="font-bold text-slate-800 text-base">No previous bookings</h3>
                  <p className="text-xs text-slate-500">Your cancelled or completed reservations will appear here.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {pastBookings.map((b) => {
                    const { dateStr, timeStr: startStr } = formatDateTime(b.startAt);
                    const { timeStr: endStr } = formatDateTime(b.endAt);

                    return (
                      <div
                        key={b._id}
                        className="bg-white rounded-2xl border border-slate-200 p-5 opacity-75 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] text-slate-500">REF: {b.reference}</span>
                          <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            {b.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800">{b.resourceId?.name || 'Resource'}</h4>
                        <div className="text-xs text-slate-500 flex gap-4">
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Cancel Reservation?</h3>
                <p className="text-xs text-slate-500">This action will release your reserved slot immediately.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1">
              <div><strong>Resource:</strong> {confirmCancelBooking.resourceId?.name}</div>
              <div><strong>Booking Ref:</strong> {confirmCancelBooking.reference}</div>
            </div>

            <p className="text-xs text-slate-600">
              If other users are currently on the waitlist for this slot, the earliest waiting user will be promoted automatically.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmCancelBooking(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={cancellingId === confirmCancelBooking._id}
                onClick={() => handleCancelBooking(confirmCancelBooking)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-200 flex items-center gap-1.5 disabled:opacity-50"
              >
                {cancellingId === confirmCancelBooking._id ? 'Releasing...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
