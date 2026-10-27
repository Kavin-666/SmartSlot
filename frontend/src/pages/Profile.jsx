import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookmarkCheck, 
  LogOut, 
  ShieldCheck, 
  User as UserIcon, 
  Key, 
  Sparkles,
  Building2,
  CheckCircle2
} from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-60 h-60 bg-brand-500/10 dark:bg-brand-500/15 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800/60">
              <UserIcon className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>Identity & Security</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Account Profile
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
              Review your authenticated identity, security privileges, and tenant settings.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Profile Card */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="glass-card rounded-3xl p-6 sm:p-8 space-y-8 relative overflow-hidden"
      >
        <div className="flex items-center gap-5">
          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-3xl shadow-lg shadow-brand-500/25 shrink-0">
            {user.name?.charAt(0) || 'U'}
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{user.name}</h2>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{user.email}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                user.role === 'admin' 
                  ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20' 
                  : user.role === 'owner'
                  ? 'bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/20'
                  : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
              }`}>
                Role: {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Security Summary Cards */}
        <div className="pt-2 border-t border-slate-200/70 dark:border-white/[0.08] grid sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 glass-card rounded-2xl border border-slate-200/60 dark:border-white/[0.06] space-y-1.5">
            <div className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-brand-500" />
              <span>Session Status</span>
            </div>
            <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 text-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              JWT Authenticated (Active)
            </div>
          </div>

          <div className="p-4 glass-card rounded-2xl border border-slate-200/60 dark:border-white/[0.06] space-y-1.5">
            <div className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
              <span>Security Policy</span>
            </div>
            <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              Role-Based Access Control (RBAC)
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <Link
            to="/my-bookings"
            className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <BookmarkCheck className="w-4 h-4" />
            View Active Bookings
          </Link>

          {user.role === 'owner' && (
            <Link
              to="/owner"
              className="flex-1 py-3 px-5 rounded-xl glass-card hover:border-brand-500/50 text-brand-700 dark:text-brand-300 font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Building2 className="w-4 h-4" />
              Owner Management Portal
            </Link>
          )}

          <button
            onClick={logout}
            className="py-3 px-5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </motion.div>
    </div>
  );
}