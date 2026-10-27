import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Resources from './pages/Resources.jsx';
import ResourceDetail from './pages/ResourceDetail.jsx';
import MyBookings from './pages/MyBookings.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Profile from './pages/Profile.jsx';
import PublicProperties from './pages/PublicProperties.jsx';
import PropertyPublicDetail from './pages/PropertyPublicDetail.jsx';
import OwnerPortal from './pages/OwnerPortal.jsx';
import PropertyWizard from './pages/PropertyWizard.jsx';
import PropertyManager from './pages/PropertyManager.jsx';
import Navbar from './components/common/Navbar.jsx';
import BackgroundDecor from './components/common/BackgroundDecor.jsx';
import { Toaster } from 'react-hot-toast';

function Protected({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">Checking authorization...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="relative min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
            <BackgroundDecor />
            <Navbar />
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Routes>
                {/* Public Discovery Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/properties" element={<PublicProperties />} />
                <Route path="/properties/:id" element={<PropertyPublicDetail />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/resources/:id" element={<ResourceDetail />} />

                {/* Authenticated Client Routes */}
                <Route
                  path="/my-bookings"
                  element={
                    <Protected>
                      <MyBookings />
                    </Protected>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <Protected>
                      <Profile />
                    </Protected>
                  }
                />

                {/* Multi-Tenant Property Owner Routes */}
                <Route
                  path="/owner"
                  element={
                    <Protected>
                      <OwnerPortal />
                    </Protected>
                  }
                />
                <Route
                  path="/owner/properties/new"
                  element={
                    <Protected>
                      <PropertyWizard />
                    </Protected>
                  }
                />
                <Route
                  path="/owner/properties/:id/manage"
                  element={
                    <Protected>
                      <PropertyManager />
                    </Protected>
                  }
                />

                {/* Admin Platform Console */}
                <Route
                  path="/admin"
                  element={
                    <Protected adminOnly={true}>
                      <AdminDashboard />
                    </Protected>
                  }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <footer className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 py-6 mt-12 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
              <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">SmartSlot V3 Multi-Tenant Platform</span>
                  <span>— Atomic Concurrency & Property Management Engine</span>
                </div>
                <p>© 2026 SmartSlot Platform. All rights reserved.</p>
              </div>
            </footer>
            <Toaster 
              position="top-right" 
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#0f172a',
                  color: '#f8fafc',
                  border: '1px solid #334155',
                  fontSize: '14px',
                  borderRadius: '12px',
                  padding: '12px 18px',
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
