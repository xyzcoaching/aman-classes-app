import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Attendance from './pages/Attendance';
import Fees from './pages/Fees';
import { Materials, Announcements, Schedule } from './pages/OtherPages';
import {
  StudentDashboard, StudentAttendance, StudentFees,
  StudentMaterials, StudentAnnouncements,
} from './pages/StudentPortal';

function RequireAuth({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/student/dashboard" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Admin routes */}
      <Route path="/dashboard" element={<RequireAuth adminOnly><Layout><Dashboard /></Layout></RequireAuth>} />
      <Route path="/students"  element={<RequireAuth adminOnly><Layout><Students /></Layout></RequireAuth>} />
      <Route path="/attendance" element={<RequireAuth adminOnly><Layout><Attendance /></Layout></RequireAuth>} />
      <Route path="/fees"      element={<RequireAuth adminOnly><Layout><Fees /></Layout></RequireAuth>} />
      <Route path="/materials" element={<RequireAuth adminOnly><Layout><Materials /></Layout></RequireAuth>} />
      <Route path="/announcements" element={<RequireAuth adminOnly><Layout><Announcements /></Layout></RequireAuth>} />
      <Route path="/schedule"  element={<RequireAuth adminOnly><Layout><Schedule /></Layout></RequireAuth>} />

      {/* Student routes */}
      <Route path="/student/dashboard"     element={<RequireAuth><Layout><StudentDashboard /></Layout></RequireAuth>} />
      <Route path="/student/attendance"    element={<RequireAuth><Layout><StudentAttendance /></Layout></RequireAuth>} />
      <Route path="/student/fees"          element={<RequireAuth><Layout><StudentFees /></Layout></RequireAuth>} />
      <Route path="/student/materials"     element={<RequireAuth><Layout><StudentMaterials /></Layout></RequireAuth>} />
      <Route path="/student/announcements" element={<RequireAuth><Layout><StudentAnnouncements /></Layout></RequireAuth>} />

      {/* Redirect root */}
      <Route path="/" element={
        user ? <Navigate to={user.role==='admin'?'/dashboard':'/student/dashboard'} /> : <Navigate to="/login" />
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{
          style: { fontSize: '13px', fontFamily: 'Plus Jakarta Sans, sans-serif' },
          success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
        }} />
      </BrowserRouter>
    </AuthProvider>
  );
}
