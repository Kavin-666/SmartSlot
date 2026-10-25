import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  ArrowLeft,
  Lock,
  Hourglass
} from 'lucide-react';

export default function ResourceDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [resource, setResource] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().slice(0, 10);
  });
  const [loadingResource, setLoadingResource] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingSlotId, setBookingSlotId] = useState(null);
  const [waitlistSlotId, setWaitlistSlotId] = useState(null);
  const [conflictWarning, setConflictWarning] = useState(null);

  // Today's date string YYYY-MM-DD for min date
  const todayStr = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    fetchResource();
  }, [id]);

  useEffect(() => {
    if (id && selectedDate) {
      fetchSlots(selectedDate);
    }
  }, [id, selectedDate]);

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
    if (!user) {
      toast('Please sign in to reserve this slot', { icon: '🔐' });
      navigate('/login');
      return;
    }

    try {
      setBookingSlotId(slot.id);
      setConflictWarning(null);

      // Generate a client idempotency key to prevent accidental duplicate submission
      const idempotencyKey = `bk-${user._id}-${slot.id}-${Date.now()}`;
      
      const res = await api.post(
        '/bookings',
        { slotId: slot.id },
        { headers: { 'Idempotency-Key': idempotencyKey } }
      );

      const ref = res.data.booking?.reference || 'Confirmed';
      toast.success(
        `Slot reserved successfully! Booking Ref: ${ref}`,
        { duration: 5000 }
      );

      // Immediately refresh slots to reflect atomic state change
      await fetchSlots(selectedDate);
    } catch (err) {
      if (err.response?.status === 409) {
        setConflictWarning(
          'Concurrency Collision Detected: Another user claimed this exact slot milliseconds before your request. The slot is now occupied.'
        );
        toast.error('Double-booking prevented! Slot is no longer available.', { duration: 6000 });
        // Refresh slot list to update UI
        fetchSlots(selectedDate);
      } else {
        toast.error(err.response?.data?.message || 'Failed to create reservation');
      }
    } finally {
      setBookingSlotId(null);
    }
  };

  const handleJoinWaitlist = async (slot) => {
    if (!user) {
      toast('Please sign in to join the waitlist', { icon: '🔐' });
      navigate('/login');
      return;
    }

    try {
      setWaitlistSlotId(slot.id);
      await api.post('/waitlist', { slotId: slot.id });
      toast.success('Joined waitlist! If this reservation is cancelled, you will be promoted automatically.', {
        duration: 5000,
      });
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
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
  };

  if (loadingResource) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-medium text-slate-500">Loading resource schedule profile...</p>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Resource Not Found</h2>
        <p className="text-xs text-slate-500">The requested facility could not be found or has been deactivated.</p>
        <Link to="/resources" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold">
          Return to Resources
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Breadcrumb */}
      <div>
        <Link to="/resources" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Resource Directory
        </Link>
      </div>

      {/* Resource Overview Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                {resource.category || 'General'}
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Active Scheduling Policy
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {resource.name}
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed">
              {resource.description || 'Dedicated space with high-speed network and multimedia display support.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="font-medium">{resource.location || 'Main Building'}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <Users className="w-4 h-4 text-slate-400" />
                <span className="font-medium">Capacity: {resource.capacity || 1} people</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
                <span className="font-medium">Strict Concurrency Guaranteed</span>
              </div>
            </div>
          </div>

          {/* Date Selector Card */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 w-full md:w-72 space-y-3 shrink-0">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-indigo-600" />
              Select Date
            </label>
            <input
              type="date"
              min={todayStr}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
            <p className="text-[11px] text-slate-500 leading-tight">
              Slots are generated deterministically based on operational hours.
            </p>
          </div>
        </div>
      </div>

      {/* Conflict Alert Banner if Triggered */}
      {conflictWarning && (
        <div className="p-4 bg-amber-50 border border-amber-300 text-amber-900 rounded-2xl flex items-start gap-3 shadow-sm animate-pulse">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm">Concurrent Booking Race Handled Gracefully</h4>
            <p className="text-xs">{conflictWarning}</p>
          </div>
        </div>
      )}

      {/* Slots Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Time Slots for {selectedDate}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Discrete 30-minute intervals. UTC normalized.</p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-300"></span>
              <span>Occupied</span>
            </div>
          </div>
        </div>

        {/* Slot Grid State */}
        {loadingSlots ? (
          <div className="py-16 text-center space-y-2">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-medium text-slate-500">Checking atomic slot availability...</p>
          </div>
        ) : slots.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-8 space-y-2">
            <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">No operational hours for this date</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              This facility is closed on the selected day of the week. Please choose another date.
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
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                    isAvailable
                      ? 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md'
                      : 'bg-slate-50 border-slate-200/70 opacity-90'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-slate-900">
                      {formatSlotTime(slot.startAt)} – {formatSlotTime(slot.endAt)}
                    </span>
                    {isAvailable ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Open
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full">
                        Booked
                      </span>
                    )}
                  </div>

                  <div>
                    {isAvailable ? (
                      <button
                        onClick={() => handleBook(slot)}
                        disabled={isBooking}
                        className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm shadow-indigo-100 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {isBooking ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Locking Slot...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Reserve Slot</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoinWaitlist(slot)}
                        disabled={isWaitlisting}
                        className="w-full py-2 px-3 rounded-xl bg-white hover:bg-amber-50 text-amber-800 border border-amber-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {isWaitlisting ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-amber-800 border-t-transparent rounded-full animate-spin"></div>
                            <span>Queueing...</span>
                          </>
                        ) : (
                          <>
                            <Hourglass className="w-3.5 h-3.5 text-amber-700" />
                            <span>Join Waitlist</span>
                          </>
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
