import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Lock, 
  Sparkles, 
  RefreshCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  Layers, 
  Users, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Cpu, 
  Compass, 
  Briefcase, 
  Play, 
  RotateCcw, 
  Activity, 
  Check, 
  Flame, 
  Star, 
  Terminal, 
  Sliders, 
  Eye, 
  ExternalLink 
} from 'lucide-react';

export default function Landing() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Interactive Concurrency Simulator State
  const [simThreads, setSimThreads] = useState(6);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState(null);
  const [waitlistPromoted, setWaitlistPromoted] = useState(false);

  // Active Role Tab State
  const [activeRoleTab, setActiveRoleTab] = useState('owner');

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(0);

  // Live Dashboard Preview Tab State
  const [activePreviewTab, setActivePreviewTab] = useState('matrix');

  // Fast Login Handler for Instant Testing
  const handleFastLogin = async (email, password, redirectPath) => {
    const res = await login(email, password);
    if (res.success) {
      toast.success(`Authenticated as ${email}`);
      navigate(redirectPath);
    } else {
      toast.error(res.message || 'Login failed');
    }
  };

  // Run the Concurrency Simulation
  const runSimulation = () => {
    setIsSimulating(true);
    setSimulationResults(null);
    setWaitlistPromoted(false);

    setTimeout(() => {
      const results = [];
      results.push({
        id: 1,
        user: 'User_Alpha (Thread #1)',
        status: 201,
        statusText: 'Created',
        latency: 4,
        won: true,
        message: 'Atomic lock acquired via findOneAndUpdate({ available: true }). Booking REF-8821 confirmed.',
      });

      for (let i = 2; i <= simThreads; i++) {
        results.push({
          id: i,
          user: `User_${String.fromCharCode(64 + i)} (Thread #${i})`,
          status: 409,
          statusText: 'Conflict',
          latency: Math.floor(Math.random() * 8) + 6,
          won: false,
          message: 'Atomic filter evaluated false (available: false). HTTP 409 Conflict returned.',
        });
      }

      setSimulationResults(results);
      setIsSimulating(false);
    }, 600);
  };

  const simulateWaitlistPromotion = () => {
    if (!simulationResults) return;
    setWaitlistPromoted(true);
    toast.success('Reservation cancelled! Thread #2 (User_B) automatically promoted via FIFO queue!');
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'How does SmartSlot guarantee zero double-bookings without Redis or external distributed locks?',
      a: 'SmartSlot leverages MongoDB’s document-level ACID atomicity with `findOneAndUpdate({ _id, available: true }, { $set: { available: false } })`. This ensures that exactly one thread can transition the slot from available to occupied. As a second defense layer, a database-level Partial Compound Unique Index `{ resourceId: 1, startAt: 1, status: "confirmed" }` prevents duplicate confirmed bookings at the storage engine level.'
    },
    {
      q: 'How does the Multi-Tenant Property and Building hierarchy operate?',
      a: 'In SmartSlot V3, Organizations own multiple commercial Properties. Each Property contains structured Floors or Sections (e.g., Level 1, Executive Wing), which in turn house bookable Resources (Meeting Rooms, Labs, Desks). Property Owners retain complete management autonomy over their facilities, floor layouts, and operating schedules without developer intervention.'
    },
    {
      q: 'What occurs during Scheduled Maintenance Windows?',
      a: 'When an owner or facility manager schedules maintenance for a room, the booking engine dynamically marks overlapping discrete slots as unavailable. If concurrent booking attempts hit that window, the engine immediately responds with HTTP 409 Conflict, preserving facility safety.'
    },
    {
      q: 'How does the Automatic FIFO Waitlist Promotion engine work?',
      a: 'When a confirmed booking is cancelled, the system automatically checks the waitlist queue for that exact slot. The earliest registered user (FIFO) is instantly promoted to confirmed status, generating a fresh booking reference and notifying the user without manual intervention or collision risk.'
    },
    {
      q: 'How does the AI Co-Pilot assist property owners and bookers?',
      a: 'The SmartSlot AI Assistant provides two key capabilities: (1) Property Setup Assistant parses natural language facility descriptions into 5-step structured property wizard drafts. (2) Smart Resource Finder algorithmically scores and matches user requirements (capacity, equipment, location) against verified database inventory with transparent explainability.'
    }
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative text-center pt-8 sm:pt-16 pb-4 max-w-5xl mx-auto space-y-6">
        {/* Heartbeat Status Pill */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] shadow-sm backdrop-blur-md"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">SmartSlot V3 Production Platform</span>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Multi-Tenant & AI Co-Pilot
          </span>
        </motion.div>

        {/* Hero Title with Gradient Text */}
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]"
        >
          Enterprise Resource Scheduling. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 dark:from-indigo-400 dark:via-purple-400 dark:to-cyan-300 bg-clip-text text-transparent">
            Guaranteed Zero Double-Bookings.
          </span>
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed"
        >
          The concurrency-hardened SaaS platform designed for multi-floor commercial buildings, research centers, and co-working hubs. Built with <strong>database-level atomic isolation</strong>, physical floor hierarchy, automated waitlists, and an AI co-pilot.
        </motion.p>

        {/* Action CTAs */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2"
        >
          <Link
            to="/properties"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 group"
          >
            <span>Explore Properties & Rooms</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <a
            href="#simulator"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white/90 dark:bg-white/[0.05] hover:bg-slate-100 dark:hover:bg-white/[0.09] border border-slate-200/90 dark:border-white/[0.1] text-slate-800 dark:text-slate-200 font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Test Concurrency Simulator</span>
          </a>
        </motion.div>

        {/* System Capabilities Metric Strip */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 text-left"
        >
          <div className="glass-card p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
              <Lock className="w-4 h-4" />
              <span>Atomic Locking</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Single-operation MongoDB filter</p>
          </div>

          <div className="glass-card p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              <Zap className="w-4 h-4" />
              <span>0% Double-Booking</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Deterministic HTTP 409 Conflict</p>
          </div>

          <div className="glass-card p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
              <RefreshCcw className="w-4 h-4" />
              <span>Auto-Waitlist</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Instant FIFO queue promotion</p>
          </div>

          <div className="glass-card p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-sm">
              <Building2 className="w-4 h-4" />
              <span>Multi-Tenant V3</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Floors, Wings & Maintenance blocks</p>
          </div>
        </motion.div>

        {/* Visual Dashboard Window Preview (Linear / Stripe style) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="pt-6"
        >
          <div className="rounded-2xl border border-slate-200/90 dark:border-white/[0.1] bg-white/90 dark:bg-[#0c1019]/90 shadow-2xl backdrop-blur-xl overflow-hidden text-left">
            {/* Window Bar */}
            <div className="px-4 py-3 bg-slate-100/80 dark:bg-white/[0.03] border-b border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
                <span className="text-xs font-mono text-slate-400 dark:text-slate-500 ml-2">smartslot.cloud/app/matrix-live</span>
              </div>
              <div className="flex items-center space-x-1.5 text-xs font-medium">
                <button 
                  onClick={() => setActivePreviewTab('matrix')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${activePreviewTab === 'matrix' ? 'bg-white dark:bg-white/[0.08] text-slate-900 dark:text-white font-bold shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
                >
                  Slot Grid Matrix
                </button>
                <button 
                  onClick={() => setActivePreviewTab('hierarchy')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${activePreviewTab === 'hierarchy' ? 'bg-white dark:bg-white/[0.08] text-slate-900 dark:text-white font-bold shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
                >
                  Building Hierarchy
                </button>
              </div>
            </div>

            {/* Window Content */}
            <div className="p-5 sm:p-6 space-y-4">
              {activePreviewTab === 'matrix' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">Nexus Innovation Tower • Level 3 Executive Boardroom</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Live 30-Minute Interval Booking Matrix (UTC Normalized)</p>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/60">
                      Atomic Gate Active
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
                    <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                      <span className="font-mono font-bold">09:00 - 09:30</span>
                      <span className="text-[10px] uppercase font-extrabold bg-emerald-500 text-white px-1.5 py-0.2 rounded">Available</span>
                    </div>
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-100/60 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span className="font-mono font-bold">09:30 - 10:00</span>
                      <span className="text-[10px] uppercase font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.2 rounded">Booked</span>
                    </div>
                    <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                      <span className="font-mono font-bold">10:00 - 10:30</span>
                      <span className="text-[10px] uppercase font-extrabold bg-emerald-500 text-white px-1.5 py-0.2 rounded">Available</span>
                    </div>
                    <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 flex items-center justify-between">
                      <span className="font-mono font-bold">10:30 - 11:00</span>
                      <span className="text-[10px] uppercase font-extrabold bg-amber-500 text-white px-1.5 py-0.2 rounded">Waitlist (2)</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-4 rounded-xl border border-indigo-200/80 dark:border-indigo-800/60 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400">Level 1 — Main Commons</span>
                    <p className="font-bold text-slate-900 dark:text-white">Hot Desks & Podcast Studio</p>
                    <p className="text-[11px] text-slate-500">2 Bookable spaces • Free Tier</p>
                  </div>
                  <div className="p-4 rounded-xl border border-purple-200/80 dark:border-purple-800/60 bg-purple-50/40 dark:bg-purple-950/20 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-purple-600 dark:text-purple-400">Level 2 — Engineering Wing</span>
                    <p className="font-bold text-slate-900 dark:text-white">Hardware & Quantum Lab</p>
                    <p className="text-[11px] text-slate-500">4 Bookable spaces • Badge Access</p>
                  </div>
                  <div className="p-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">Level 3 — Executive Suite</span>
                    <p className="font-bold text-slate-900 dark:text-white">4K Conference Suites</p>
                    <p className="text-[11px] text-slate-500">2 Bookable spaces • Hourly Model</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ========================================================================= */}
      {/* 2. STATS BAR SECTION */}
      {/* ========================================================================= */}
      <section className="border-y border-slate-200/80 dark:border-white/[0.08] py-10 bg-slate-100/50 dark:bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">0.00%</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Double Booking Conflict Rate</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight">&lt; 8ms</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Atomic Lock Resolution Time</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">100%</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">FIFO Waitlist Automated Promotion</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-purple-600 dark:text-purple-400 tracking-tight">19 / 19</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Backend Test Suites Passing</div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. INTERACTIVE CONCURRENCY SIMULATOR */}
      {/* ========================================================================= */}
      <section id="simulator" className="scroll-mt-24 space-y-6">
        <div className="rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-white/[0.08] bg-white/90 dark:bg-[#0b0e17]/95 shadow-xl transition-colors">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-white/[0.08] pb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/60 mb-2">
                <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                Live Concurrency Engine Test
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Race Condition & Double-Booking Simulator
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                Simulate multiple simultaneous threads competing for the exact same 30-minute interval to observe SmartSlot’s atomic gate in action.
              </p>
            </div>

            {/* Simulator Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/[0.05] px-3 py-2 rounded-xl border border-slate-200/80 dark:border-white/[0.08] text-xs">
                <span className="text-slate-500 dark:text-slate-400">Concurrent Requests:</span>
                <select
                  value={simThreads}
                  onChange={(e) => setSimThreads(parseInt(e.target.value))}
                  disabled={isSimulating}
                  className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded px-2 py-1 border border-slate-300 dark:border-slate-700 focus:outline-none"
                >
                  <option value={4}>4 Threads</option>
                  <option value={6}>6 Threads</option>
                  <option value={8}>8 Threads</option>
                  <option value={12}>12 Threads</option>
                </select>
              </div>

              <button
                onClick={runSimulation}
                disabled={isSimulating}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {isSimulating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Firing Simultaneous Requests...</span>
                  </>
                ) : (
                  <>
                    <Flame className="w-4 h-4 text-amber-300" />
                    <span>Fire Concurrent Requests</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Target Slot Details */}
          <div className="py-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-300 border-b border-slate-200/80 dark:border-white/[0.08]">
            <div className="flex items-center gap-3">
              <span className="font-mono bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-md text-indigo-700 dark:text-indigo-400 font-bold border border-indigo-200/60 dark:border-indigo-800/60">
                Target Slot: #SLOT-A492
              </span>
              <span><strong>Facility:</strong> Nexus Innovation Tower (Floor 3)</span>
              <span><strong>Interval:</strong> 14:00 – 14:30 UTC</span>
            </div>

            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 201 Created (1 Winner)
              </span>
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> 409 Conflict (N-1 Protected)
              </span>
            </div>
          </div>

          {/* Simulation Output Area */}
          <div className="pt-6">
            {!simulationResults && !isSimulating && (
              <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-2">
                <Activity className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto" />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ready to test. Click <strong>"Fire Concurrent Requests"</strong> above to test the atomic concurrency gate.
                </p>
              </div>
            )}

            {isSimulating && (
              <div className="text-center py-12 space-y-3">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400">Executing {simThreads} simultaneous HTTP POST /bookings requests against the database...</p>
              </div>
            )}

            {simulationResults && (
              <div className="space-y-4 animate-in fade-in">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {simulationResults.map((res) => (
                    <div
                      key={res.id}
                      className={`p-4 rounded-xl border text-xs font-mono transition-all ${
                        res.won
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-200 shadow-sm'
                          : 'bg-slate-50/80 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold">{res.user}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            res.won
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30'
                          }`}
                        >
                          HTTP {res.status} {res.statusText}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-2">
                        {res.message}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-200 dark:border-white/[0.08]">
                        <span>Latency: {res.latency}ms</span>
                        <span className={res.won ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500'}>
                          {res.won ? '✓ WON LOCK' : 'BLOCKED (409)'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-200 dark:border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-700 dark:text-slate-300 space-y-0.5">
                    <span className="font-bold flex items-center gap-1.5 text-slate-900 dark:text-white">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Zero Double-Bookings Verified: Exactly 1 reservation created, all other requests blocked safely.
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Now test what happens when Thread #1 cancels their reservation.
                    </p>
                  </div>

                  {!waitlistPromoted ? (
                    <button
                      onClick={simulateWaitlistPromotion}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Simulate Cancel & Auto-Promote Thread #2</span>
                    </button>
                  ) : (
                    <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs font-bold flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>Thread #2 (User_B) Promoted to Confirmed via FIFO Queue!</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. MULTI-TENANT ROLE EXPLORER (TABBED) */}
      {/* ========================================================================= */}
      <section className="space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Tailored Experiences
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Built for Every Stakeholder
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Switch between user roles to see how SmartSlot unifies property ownership, team bookings, and platform governance.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center justify-center gap-2 max-w-md mx-auto p-1.5 bg-slate-100 dark:bg-white/[0.04] rounded-2xl border border-slate-200/80 dark:border-white/[0.08]">
          <button
            onClick={() => setActiveRoleTab('owner')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeRoleTab === 'owner'
                ? 'bg-white dark:bg-white/[0.08] text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Property Owners</span>
          </button>

          <button
            onClick={() => setActiveRoleTab('booker')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeRoleTab === 'booker'
                ? 'bg-white dark:bg-white/[0.08] text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Enterprise Bookers</span>
          </button>

          <button
            onClick={() => setActiveRoleTab('admin')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeRoleTab === 'admin'
                ? 'bg-white dark:bg-white/[0.08] text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Platform Admins</span>
          </button>
        </div>

        {/* Tab Panels */}
        <div className="glass-card rounded-3xl p-6 sm:p-10 transition-colors">
          {activeRoleTab === 'owner' && (
            <div className="grid md:grid-cols-3 gap-6 items-center">
              <div className="space-y-4 md:col-span-1">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                  Property Portfolio Operator
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  Full Building & Floor Control
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Onboard commercial buildings with the 5-step wizard. Configure floor levels, assign rooms, schedule maintenance windows, and oversee reservations with multi-tenant isolation.
                </p>
                <div className="pt-2">
                  <Link
                    to="/owner"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm"
                  >
                    <span>Open Owner Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="md:col-span-2 grid sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">5-Step Property Wizard</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Draft properties with address, timezone, standard hours, predefined & custom amenities, and AI draft auto-fill.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Physical Floor Manager</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Map out real floors (Levels 1..N), assign rooms to wings, and set hourly, fixed-slot, or complimentary pricing.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Maintenance Block Scheduler</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Schedule downtime windows for ductwork, equipment checks, or cleaning that immediately invalidates slots.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                    4
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Occupancy Analytics</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Live booking volume counters, active confirmation ratios, cancellation rates, and tenant reservation rosters.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeRoleTab === 'booker' && (
            <div className="grid md:grid-cols-3 gap-6 items-center">
              <div className="space-y-4 md:col-span-1">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                  Client & Team Experience
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  Zero-Latency Frictionless Booking
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Browse commercial buildings across cities, select rooms by floor, inspect discrete 30-min intervals in real-time, and join automated waitlist queues.
                </p>
                <div className="pt-2">
                  <Link
                    to="/resources"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm"
                  >
                    <span>Browse All Spaces</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="md:col-span-2 grid sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] space-y-2">
                  <Clock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Discrete 30-Min Intervals</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Clean timeline grid normalized to UTC. Green indicators for available slots, grey for booked slots.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] space-y-2">
                  <Lock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Instant Lock Acquisition</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Claim slots with zero delay. Client idempotency keys ensure no double charges or duplicate submissions.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] space-y-2">
                  <RefreshCcw className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Auto-Waitlist Queue</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    If your desired slot is taken, join the queue with 1 click. You are promoted automatically if cancelled.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] space-y-2">
                  <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Smart Resource Finder</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Let AI recommend the right room based on capacity, tech gear (whiteboard, 4K projector), and location.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeRoleTab === 'admin' && (
            <div className="grid md:grid-cols-3 gap-6 items-center">
              <div className="space-y-4 md:col-span-1">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                  Global Platform Governance
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  Multi-Tenant RBAC & Telemetry
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Supervise cross-tenant isolation, manage universal resources, review throughput analytics, and monitor system concurrency guards.
                </p>
                <div className="pt-2">
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm"
                  >
                    <span>Open Admin Console</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="md:col-span-2 grid sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] space-y-2">
                  <ShieldCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Server-Side Tenant Isolation</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Strict middleware boundary checks prevent Insecure Direct Object Reference (IDOR) attacks across organizations.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] space-y-2">
                  <Cpu className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Engine Guard Telemetry</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Live verification of atomic slot filter status and partial compound index integrity.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] space-y-2">
                  <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Global Throughput Metrics</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Platform-wide tracking of registered users, bookable resources, active confirmations, and cancellation rates.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] space-y-2">
                  <Layers className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Universal Override</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Administrative capability to inspect any organization or facility for compliance and platform audits.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. FEATURED COMMERCIAL PROPERTIES SHOWCASE */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Verified Commercial Directory
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Featured Properties on SmartSlot
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Live multi-tenant commercial facilities currently hosting bookable meeting rooms and tech workspaces.
            </p>
          </div>

          <Link
            to="/properties"
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All Facilities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="glass-card-hover rounded-3xl overflow-hidden flex flex-col justify-between group">
            <div>
              <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"
                  alt="Nexus Innovation Tower"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-sm">
                    Co-Working Tower
                  </span>
                </div>
                <div className="absolute bottom-3 right-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-sm flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified Space
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-3">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Nexus Innovation Tower
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  Prime commercial hub with 3 floors of soundproof video conference suites and dedicated podcast studios.
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 font-medium">Gigabit Fiber</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 font-medium">Basement Parking</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 font-medium">4K Projectors</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50/70 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                3 Floors • Austin, TX
              </span>
              <Link
                to="/properties"
                className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
              >
                <span>Explore</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-card-hover rounded-3xl overflow-hidden flex flex-col justify-between group">
            <div>
              <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80"
                  alt="Pacific Heights Creative Hub"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-sm">
                    Design & Media Suite
                  </span>
                </div>
                <div className="absolute bottom-3 right-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-sm flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified Space
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-3">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Pacific Heights Creative Hub
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  Boutique creative laboratory tailored for product design sprints, quiet focus booths, and video shoots.
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 font-medium">Digital Whiteboard</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 font-medium">Espresso Bar</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 font-medium">Climate Control</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50/70 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                2 Floors • San Francisco, CA
              </span>
              <Link
                to="/properties"
                className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
              >
                <span>Explore</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-card-hover rounded-3xl overflow-hidden flex flex-col justify-between group">
            <div>
              <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80"
                  alt="Quantum Research Campus"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-sm">
                    Research Campus
                  </span>
                </div>
                <div className="absolute bottom-3 right-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-sm flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified Space
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-3">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Quantum Research Campus
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  Specialized hardware development workstations and collaborative lecture auditoriums with badge access.
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 font-medium">Cleanroom Tech</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 font-medium">Security Access</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 font-medium">Auditorium</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50/70 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                4 Floors • Seattle, WA
              </span>
              <Link
                to="/properties"
                className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
              >
                <span>Explore</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. TESTIMONIALS & TRUST */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        <div className="text-center space-y-1.5 max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Trusted by Modern Operators
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Loved by Facility Managers & Teams
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          <div className="glass-card p-6 rounded-2xl space-y-3">
            <div className="flex items-center space-x-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              "Before SmartSlot, our multi-floor tech hub suffered weekly double bookings during peak Monday morning scrums. SmartSlot’s atomic gate completely solved the problem."
            </p>
            <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
                EK
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Elena Rostova</h4>
                <p className="text-[10px] text-slate-400">VP Operations, Apex Innovation Tower</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-3">
            <div className="flex items-center space-x-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              "The automatic waitlist queue promotion is pure magic. When a team cancels their sprint room, the next engineer gets it without anyone sending an email."
            </p>
            <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                MC
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Marcus Chen</h4>
                <p className="text-[10px] text-slate-400">Head of Facilities, Quantum Collective</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-3">
            <div className="flex items-center space-x-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              "The 5-step property onboarding wizard and AI co-pilot made adding our 4-floor Seattle campus effortless. All 18 rooms were configured in minutes."
            </p>
            <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-xs">
                SD
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Sophia Diaz</h4>
                <p className="text-[10px] text-slate-400">Director of Workspace, Silicon Prairie</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. 1-CLICK INSTANT TEST DRIVE STATION */}
      {/* ========================================================================= */}
      <section className="glass-card rounded-3xl p-6 sm:p-10 space-y-6">
        <div className="text-center space-y-1.5 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-4 h-4" />
            1-Click Live Test Drive
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Pre-Seeded Evaluator Accounts
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Click any account below to authenticate immediately and test all user roles.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Owner Fast Login */}
          <div className="p-5 bg-white/70 dark:bg-white/[0.02] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-sm space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                Property Owner
              </span>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Commercial Facility Owner</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Access Owner Portal, configure buildings, manage floor layouts, add rooms, and schedule maintenance blocks.
              </p>
            </div>
            <button
              onClick={() => handleFastLogin('owner@example.com', 'owner123', '/owner')}
              className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <span>Test as Property Owner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Admin Fast Login */}
          <div className="p-5 bg-white/70 dark:bg-white/[0.02] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-sm space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                Platform Admin
              </span>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">System Administrator</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Monitor global platform throughput, review verified concurrency guards, and inspect universal facility resources.
              </p>
            </div>
            <button
              onClick={() => handleFastLogin('admin@example.com', 'admin123', '/admin')}
              className="w-full py-2.5 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <span>Test as Platform Admin</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Client Fast Login */}
          <div className="p-5 bg-white/70 dark:bg-white/[0.02] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-sm space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                Enterprise Booker
              </span>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">End-User Client</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Browse properties, select rooms, book discrete 30-min slots, test cancellations, and join waitlist queues.
              </p>
            </div>
            <button
              onClick={() => handleFastLogin('user@example.com', 'user123', '/properties')}
              className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <span>Test as Booker</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FREQUENTLY ASKED QUESTIONS ACCORDION */}
      {/* ========================================================================= */}
      <section className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Engineering FAQ
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Technical architecture, concurrency isolation, and platform capabilities explained.
          </p>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={i}
                className="glass-card rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 shrink-0 text-slate-400" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-white/[0.06] animate-in fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
