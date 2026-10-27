import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import AIAssistantModal from '../ai/AIAssistantModal';
import { 
  Calendar, 
  LogOut, 
  ShieldCheck, 
  Menu, 
  X, 
  BookmarkCheck,
  Building2,
  Sparkles,
  Briefcase,
  Sun,
  Moon,
  ChevronRight
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-[#080b11]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.08] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo & Brand */}
            <div className="flex items-center space-x-3">
              <Link to="/" className="flex items-center space-x-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                      SmartSlot
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                      V3
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 -mt-0.5">
                    Multi-Tenant Platform
                  </span>
                </div>
              </Link>

              {/* Desktop Nav Items */}
              <div className="hidden md:flex md:items-center md:space-x-1 ml-8">
                <Link
                  to="/properties"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isActive('/properties')
                      ? 'bg-indigo-50/90 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Properties</span>
                </Link>

                <Link
                  to="/resources"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive('/resources')
                      ? 'bg-indigo-50/90 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                  }`}
                >
                  All Spaces
                </Link>

                {user && (
                  <>
                    <Link
                      to="/my-bookings"
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        isActive('/my-bookings')
                          ? 'bg-indigo-50/90 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <BookmarkCheck className="w-3.5 h-3.5" />
                      <span>My Bookings</span>
                    </Link>

                    <Link
                      to="/owner"
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        isActive('/owner')
                          ? 'bg-indigo-50/90 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Owner Portal</span>
                    </Link>
                  </>
                )}

                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isActive('/admin')
                        ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 font-bold'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
                    <span>Admin</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Desktop Right Side */}
            <div className="hidden md:flex md:items-center md:space-x-2.5">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                className="p-2 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.04] text-slate-600 dark:text-amber-400 hover:text-slate-900 dark:hover:text-amber-300 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-all"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 transition-transform hover:rotate-45" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-700 transition-transform hover:-rotate-12" />
                )}
              </button>

              {/* AI Co-Pilot Button */}
              <button
                onClick={() => setIsAiModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50/80 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/50 text-xs font-bold transition-all shadow-sm"
                title="AI Co-Pilot: Property Draft & Resource Finder"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 animate-pulse" />
                <span>AI Co-Pilot</span>
              </button>

              {user ? (
                <div className="flex items-center space-x-2 pl-1">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 px-2.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.15] hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all text-xs font-medium text-slate-700 dark:text-slate-200"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-[10px] uppercase shadow-sm">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                    <span className="font-semibold">{user.name?.split(' ')[0]}</span>
                    {user.role === 'admin' && (
                      <span className="bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
                        Admin
                      </span>
                    )}
                  </Link>

                  <button
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                    className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2 pl-1">
                  <Link
                    to="/login"
                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] rounded-xl transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-500/20 transition-all flex items-center gap-1"
                  >
                    <span>Get Started</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu and theme buttons */}
            <div className="flex items-center space-x-1.5 md:hidden">
              <button
                onClick={toggleTheme}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                className="p-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.04] text-slate-600 dark:text-amber-400"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-slate-700" />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05]"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200/80 dark:border-white/[0.08] bg-white/95 dark:bg-[#0c0f17]/95 backdrop-blur-xl px-4 pt-3 pb-5 space-y-1.5 animate-in fade-in">
            <Link
              to="/properties"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.05]"
            >
              Explore Properties
            </Link>
            <Link
              to="/resources"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.05]"
            >
              All Spaces
            </Link>
            {user && (
              <>
                <Link
                  to="/my-bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                >
                  My Bookings
                </Link>
                <Link
                  to="/owner"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                >
                  Owner Portal & Properties
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                >
                  My Profile
                </Link>
              </>
            )}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40"
              >
                Admin Dashboard
              </Link>
            )}
            <div className="pt-3 border-t border-slate-100 dark:border-white/[0.08] flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsAiModalOpen(true);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-purple-500" /> AI Co-Pilot
              </button>
              {user ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/[0.05] rounded-xl"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <AIAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />
    </>
  );
}
