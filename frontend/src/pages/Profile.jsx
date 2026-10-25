import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { User, Mail, Shield, Calendar, BookmarkCheck, LogOut, ArrowRight } from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Account Profile</h1>
        <p className="text-slate-500 text-sm mt-1">
          Review your authenticated identity, privileges, and system settings.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center font-extrabold text-2xl shadow-md shadow-indigo-100">
            {user.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-500">{user.email}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                user.role === 'admin' 
                  ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
              }`}>
                {user.role}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 grid sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="text-slate-500 font-medium">Session Status</span>
            <div className="font-bold text-emerald-600 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              JWT Authenticated (Active)
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="text-slate-500 font-medium">Security Policy</span>
            <div className="font-bold text-slate-700">
              Role-Based Access Control (RBAC)
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Link
            to="/my-bookings"
            className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <BookmarkCheck className="w-4 h-4" />
            View Active Bookings
          </Link>
          <button
            onClick={logout}
            className="py-2.5 px-4 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
