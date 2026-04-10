import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, CalendarCheck, IndianRupee,
  BookOpen, Megaphone, Clock, LogOut, Menu, X, GraduationCap,
} from 'lucide-react';

const adminNav = [
  { to:'/dashboard',     label:'Dashboard',    icon: LayoutDashboard },
  { to:'/students',      label:'Students',     icon: Users },
  { to:'/attendance',    label:'Attendance',   icon: CalendarCheck },
  { to:'/fees',          label:'Fees',         icon: IndianRupee },
  { to:'/materials',     label:'Materials',    icon: BookOpen },
  { to:'/announcements', label:'Announcements',icon: Megaphone },
  { to:'/schedule',      label:'Schedule',     icon: Clock },
];

const studentNav = [
  { to:'/student/dashboard',     label:'Dashboard',    icon: LayoutDashboard },
  { to:'/student/attendance',    label:'My Attendance', icon: CalendarCheck },
  { to:'/student/fees',          label:'My Fees',       icon: IndianRupee },
  { to:'/student/materials',     label:'Materials',     icon: BookOpen },
  { to:'/student/announcements', label:'Announcements', icon: Megaphone },
];

export default function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const navItems = isAdmin ? adminNav : studentNav;

  const handleLogout = () => { logout(); navigate('/login'); };

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-white border-r border-gray-100 w-60">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-600 rounded-lg flex items-center justify-center">
            <GraduationCap size={20} className="text-white" />
          </div>
          <div>
            <p className="font-700 text-gray-900 text-sm leading-tight font-semibold">Aman Classes</p>
            <p className="text-xs text-gray-400">Class 6–10 Coaching</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }>
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 mb-2">
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-semibold">
            {user?.name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-150">
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col h-full"><Sidebar /></div>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute left-0 top-0 h-full w-60 z-50" onClick={e=>e.stopPropagation()}>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
          <button onClick={() => setOpen(true)} className="p-1 text-gray-600"><Menu size={20} /></button>
          <span className="font-semibold text-gray-900 text-sm">Aman Classes</span>
        </div>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
