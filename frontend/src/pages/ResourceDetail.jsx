import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft,
  Hourglass,
  Sparkles,
  Zap
} from 'lucide-react';

export default function ResourceDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [resource, setResource] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [loadingResource, setLoadingResource] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingSlotId, setBookingSlotId] = useState(null);
  const [waitlistSlotId, setWaitlistSlotId] = useState(null);
  const [conflictWarning, setConflictWarning] = useState(null);

  const todayStr = new Date().toISOString().slice(0, 10);

  useEffect(() => { fetchResource(); }, [id]);
  useEffect(() => { if (id && selectedDate) fetchSlots(selectedDate); }, [id, selectedDate]);

  const fetchResource = async () => {
    try {
      setLoadingResource(true);
      const res = await api.get(`/resources/${id}`);
      setResource(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load resource details');
    } finally {
      setLoadingResource(false);
    }
  };

  const fetchSlots = async (date) => {
    try {
      setLoadingSlots(true);
      setConflictWarning(null);
      const res = await api.get(`/resources/${id}/availability?date=${date}`);
      setSlots(res.data.slots || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load availability for this date');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBook = async (slot) => {
    if (!user) { toast('Please sign in to reserve this slot', { icon: '🔐' }); navigate('/login'); return; }
    try {
      setBookingSlotId(slot.id);
      setConflictWarning(null);
      const idempotencyKey = `bk-${user._id}-${slot.id}-${Date.now()}`;
      const res = await api.post('/bookings', { slotId: slot.id }, { headers: { 'Idempotency-Key': idempotencyKey } });
      const ref = res.data.booking?.reference || 'Confirmed';
      toast.success(`Slot reserved! Booking Ref: ${ref}`, { duration: 5000 });
      await fetchSlots(selectedDate);
    } catch (err) {
      if (err.response?.status === 409) {
        setConflictWarning('Concurrency Collision Prevented: Another user claimed this exact slot milliseconds before your request. The atomic engine safely rejected this duplicate reservation.');
        toast.error('Double-booking prevented! Slot is now occupied.', { duration: 6000 });
        fetchSlots(selectedDate);
      } else {
        toast.error(err.response?.data?.message || 'Failed to create reservation');
      }
    } finally {
      setBookingSlotId(null);
    }
  };

  const handleJoinWaitlist = async (slot) => {
    if (!user) { toast('Please sign in to join the waitlist', { icon: '🔐' }); navigate('/login'); return; }
    try {
      setWaitlistSlotId(slot.id);
      await api.post('/waitlist', { slotId: slot.id });
      toast.success('Joined waitlist! You will be promoted automatically if this slot is cancelled.', { duration: 5000 });
    } catch (err) {
      if (err.response?.status === 409) {
        toast('You are already registered on the waitlist for this slot.', { icon: 'ℹ️' });
      } else {
        toast.error(err.response?.data?.message || 'Failed to join waitlist');
      }
    } finally {
      setWaitlistSlotId(null);
    }
  };

  const formatSlotTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
  };

  if (loadingResource) {
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

  if (!resource) {
    return (
      <div className="text-center py-20 glass-card rounded-3xl p-8 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Resource Not Found</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">The requested facility could not be found or has been deactivated.</p>
        <Link 
          to="/resources" 
          className="inline-block px-5 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20"
        >
          Return to Resources
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Breadcrumb */}
      <div>
        <Link 
          to="/resources" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Resource Directory
        </Link>
      </div>

      {/* Resource Overview Card */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 dark:bg-brand-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200/50 dark:border-brand-800/50">
                {resource.category || 'General'}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active Scheduling Policy
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {resource.name}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {resource.description || 'Dedicated space with high-speed network and multimedia display support.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5 glass-card px-3.5 py-1.5 rounded-xl">
                <MapPin className="w-4 h-4 text-brand-500" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">{resource.location || 'Main Building'}</span>
              </div>
              <div className="flex items-center gap-1.5 glass-card px-3.5 py-1.5 rounded-xl">
                <Users className="w-4 h-4 text-brand-500" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">Capacity: {resource.capacity || 1} people</span>
              </div>
              <div className="flex items-center gap-1.5 glass-card px-3.5 py-1.5 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">Strict Atomic Concurrency</span>
              </div>
            </div>
          </div>

          {/* Date Selector Card */}
          <div className="glass-card p-5 rounded-2xl w-full md:w-72 space-y-3 shrink-0 shadow-sm border border-slate-200/80 dark:border-white/[0.1]">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              Reservation Date
            </label>
            <input
              type="date"
              min={todayStr}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition-all shadow-sm"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              Slots are generated deterministically based on facility operational hours.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Conflict Alert Banner */}
      {conflictWarning && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 rounded-2xl flex items-start gap-3 shadow-sm backdrop-blur-md"
        >
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm">Concurrent Race Condition Caught Safely</h4>
            <p className="text-xs">{conflictWarning}</p>
          </div>
        </motion.div>
      )}

      {/* Slots Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-white/[0.08] pb-4 transition-colors">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              Schedule Matrix for {selectedDate}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Discrete 30-minute intervals. UTC normalized.</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-700 dark:text-slate-300">Available ({slots.filter(s => s.available).length})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-slate-600"></span>
              <span className="text-slate-700 dark:text-slate-300">Occupied ({slots.filter(s => !s.available).length})</span>
            </div>
          </div>
        </div>

        {loadingSlots ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="glass-card rounded-2xl p-4 space-y-3">
                <div className="h-5 skeleton w-2/3 rounded-md"></div>
                <div className="h-8 skeleton w-full rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : slots.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-3xl p-8 space-y-3">
            <CalendarIcon className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">No operational hours for this date</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              This facility is closed on the selected day. Please pick another date above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {slots.map((slot) => {
              const isAvailable = slot.available;
              const isBooking = bookingSlotId === slot.id;
              const isWaitlisting = waitlistSlotId === slot.id;

              return (
                <div
                  key={slot.id}
                  className={`p-4 rounded-2xl transition-all flex flex-col justify-between space-y-3 ${
                    isAvailable
                      ? 'glass-card border-brand-500/20 hover:border-brand-500/50 hover:shadow-md'
                      : 'glass-card opacity-80 border-slate-200/50 dark:border-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {formatSlotTime(slot.startAt)} – {formatSlotTime(slot.endAt)}
                    </span>
                    {isAvailable ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        Open
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200/50 dark:border-white/[0.06]">
                        Booked
                      </span>
                    )}
                  </div>

                  <div>
                    {isAvailable ? (
                      <button
                        onClick={() => handleBook(slot)}
                        disabled={isBooking}
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-sm shadow-brand-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 hover:scale-[1.01] active:scale-95"
                      >
                        {isBooking ? (
                          <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div><span>Locking Slot...</span></>
                        ) : (
                          <><CheckCircle2 className="w-3.5 h-3.5" /><span>Reserve Slot</span></>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoinWaitlist(slot)}
                        disabled={isWaitlisting}
                        className="w-full py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 font-bold text-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 hover:scale-[1.01] active:scale-95"
                      >
                        {isWaitlisting ? (
                          <><div className="w-3.5 h-3.5 border-2 border-amber-600 dark:border-amber-400 border-t-transparent rounded-full animate-spin"></div><span>Queueing...</span></>
                        ) : (
                          <><Hourglass className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /><span>Join Waitlist</span></>
                        )}
                      </button>
                    )}
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