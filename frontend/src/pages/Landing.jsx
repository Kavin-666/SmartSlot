import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Zap, 
  Clock, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  Layers,
  Sparkles,
  RefreshCcw,
  AlertTriangle
} from 'lucide-react';

export default function Landing() {
  return (
    <div className="space-y-20 pb-12">
      {/* Hero Section */}
      <section className="text-center pt-8 sm:pt-16 pb-6 max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          Production-Grade High-Concurrency Booking Engine
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
          Book Smarter. <br />
          <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-800 bg-clip-text text-transparent">
            Never Double-Book.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          SmartSlot guarantees strict transactional isolation and atomic slot reservation at the database level.
          Eliminate race conditions, manage dynamic queues, and streamline multi-resource scheduling.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/resources"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 group"
          >
            Browse Available Slots
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-base shadow-sm transition-all"
          >
            Sign In / Demo Accounts
          </Link>
        </div>

        {/* Live System Capabilities Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 text-left">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg">
              <Lock className="w-5 h-5" />
              <span>Atomic</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">MongoDB atomic reservation filter</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-lg">
              <Zap className="w-5 h-5" />
              <span>Zero Race</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Deterministic HTTP 409 conflict</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-lg">
              <RefreshCcw className="w-5 h-5" />
              <span>Auto Waitlist</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Instant queue promotion on cancel</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-purple-600 font-bold text-lg">
              <ShieldCheck className="w-5 h-5" />
              <span>RBAC & Audit</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Secured administrative operations</p>
          </div>
        </div>
      </section>

      {/* The Core Engineering Problem Explained */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-800 text-white rounded-3xl p-8 sm:p-12 shadow-xl">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
            Concurrency Defense-in-Depth
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight">
            How SmartSlot Solves The Race Condition
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            In standard tutorial applications, checking slot availability and creating a booking is implemented as two separate read-then-write operations. When multiple requests arrive simultaneously, both read the slot as available and both issue an insert—resulting in a double booking catastrophe.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-10">
          {/* Naive Approach */}
          <div className="bg-slate-800/80 border border-rose-500/30 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm uppercase tracking-wider mb-3">
              <AlertTriangle className="w-4 h-4" />
              Naive Read-Then-Write (Broken)
            </div>
            <ol className="text-xs font-mono text-slate-300 space-y-3">
              <li className="bg-slate-900/60 p-2.5 rounded border border-slate-700/60">
                <span className="text-rose-400">Request A:</span> SELECT available FROM slots WHERE id=X <span className="text-emerald-400">→ true</span>
              </li>
              <li className="bg-slate-900/60 p-2.5 rounded border border-slate-700/60">
                <span className="text-rose-400">Request B:</span> SELECT available FROM slots WHERE id=X <span className="text-emerald-400">→ true</span>
              </li>
              <li className="bg-slate-900/60 p-2.5 rounded border border-slate-700/60">
                <span className="text-rose-400">Request A:</span> INSERT booking for user 1 <span className="text-emerald-400">→ OK</span>
              </li>
              <li className="bg-slate-900/60 p-2.5 rounded border border-slate-700/60">
                <span className="text-rose-400">Request B:</span> INSERT booking for user 2 <span className="text-rose-400 font-bold">→ DOUBLE BOOKED! ❌</span>
              </li>
            </ol>
          </div>

          {/* SmartSlot Approach */}
          <div className="bg-slate-800/80 border border-emerald-500/40 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase tracking-wider mb-3">
              <CheckCircle2 className="w-4 h-4" />
              SmartSlot Atomic Guarantee (Defensible)
            </div>
            <ol className="text-xs font-mono text-slate-300 space-y-3">
              <li className="bg-slate-900/60 p-2.5 rounded border border-slate-700/60">
                <span className="text-indigo-400">Atomic Gate:</span> findOneAndUpdate(&#123; _id: X, available: true &#125;, &#123; $set: &#123; available: false &#125; &#125;)
              </li>
              <li className="bg-slate-900/60 p-2.5 rounded border border-slate-700/60">
                <span className="text-indigo-400">Request 1:</span> Matches filter, flips slot <span className="text-emerald-400 font-bold">→ Wins (201 Created)</span>
              </li>
              <li className="bg-slate-900/60 p-2.5 rounded border border-slate-700/60">
                <span className="text-indigo-400">Request 2..N:</span> Filter evaluates false, returns null <span className="text-amber-400 font-bold">→ 409 Conflict</span>
              </li>
              <li className="bg-slate-900/60 p-2.5 rounded border border-slate-700/60">
                <span className="text-indigo-400">Safety Net:</span> Partial Unique Compound Index on active confirmed bookings
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* Feature Walkthrough */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900">Engineered Workflows</h2>
          <p className="text-slate-600 text-sm max-w-xl mx-auto">
            Explore complete lifecycle capabilities for both individual end users and administrative coordinators.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Resource Discovery</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Filter meeting rooms, labs, and consultation appointments by category, capacity, and active status.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Slot Grid & Booking</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Dynamically generated discrete 30-minute intervals. Real-time availability indicator with zero-latency lock acquisition.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Cancellation & Auto-Waitlist</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Cancellations release the slot and automatically promote the earliest waiting candidate without double assignment.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Demo Credentials Card */}
      <section className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="font-bold text-base flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-700" />
            Quick Demo Accounts Ready to Test
          </h4>
          <p className="text-xs text-amber-800">
            Use seeded accounts to test user workflows and administrator resource management.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-mono">
          <span className="px-3 py-1.5 bg-white/80 rounded-lg border border-amber-300 font-semibold">
            Admin: admin@example.com / admin123
          </span>
          <span className="px-3 py-1.5 bg-white/80 rounded-lg border border-amber-300 font-semibold">
            User: user@example.com / user123
          </span>
        </div>
      </section>
    </div>
  );
}
