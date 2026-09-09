import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home, FileText, Users, ClipboardList,
  BarChart2, CheckSquare, LogOut, Menu, X, ChevronRight,
  Bell, User
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getInitials } from '@/lib/utils';
import { type Role } from '@/types';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const navByRole: Record<Role, NavItem[]> = {
  warga: [
    { to: '/warga/dashboard', label: 'Dashboard', icon: <Home size={18} /> },
    { to: '/warga/ajukan', label: 'Ajukan Surat', icon: <FileText size={18} /> },
    { to: '/warga/riwayat', label: 'Riwayat Permohonan', icon: <ClipboardList size={18} /> },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: <Home size={18} /> },
    { to: '/admin/permohonan', label: 'Manajemen Permohonan', icon: <ClipboardList size={18} /> },
    { to: '/admin/penduduk', label: 'Data Penduduk', icon: <Users size={18} /> },
  ],
  kades: [
    { to: '/kades/dashboard', label: 'Dashboard', icon: <Home size={18} /> },
    { to: '/kades/validasi', label: 'Validasi & Approval', icon: <CheckSquare size={18} /> },
    { to: '/kades/laporan', label: 'Laporan Pelayanan', icon: <BarChart2 size={18} /> },
  ],
};

const roleLabels: Record<Role, string> = {
  warga: 'Warga',
  admin: 'Admin Desa',
  kades: 'Kepala Desa',
};

const roleBadgeColors: Record<Role, string> = {
  warga: 'bg-sky-100 text-sky-700',
  admin: 'bg-violet-100 text-violet-700',
  kades: 'bg-emerald-100 text-emerald-700',
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const navItems = role ? navByRole[role] : [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 z-30 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto flex flex-col shadow-2xl`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText size={20} className="text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-lg leading-tight">SIPESPEK</div>
              <div className="text-slate-400 text-xs">Desa Wangkar Weli</div>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
              {getInitials(user?.nama_lengkap ?? 'U')}
            </div>
            <div className="min-w-0">
              <div className="text-white font-medium text-sm truncate">{user?.nama_lengkap}</div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${role ? roleBadgeColors[role] : ''}`}>
                {role ? roleLabels[role] : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3 px-2">Menu</div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                 ${isActive
                   ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/20'
                   : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                 }`
              }
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span>{item.label}</span>
              <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-700/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 text-sm font-medium transition-all duration-200"
          >
            <LogOut size={18} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 lg:px-6 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-slate-800 font-semibold text-base leading-tight">
                Sistem Informasi Pelayanan Surat
              </h1>
              <p className="text-slate-500 text-xs">Kantor Desa Wangkar Weli</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 bg-slate-100 rounded-full px-3 py-1.5">
              <div className="w-6 h-6 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {getInitials(user?.nama_lengkap ?? 'U')}
              </div>
              <span className="text-slate-700 text-sm font-medium">{user?.nama_lengkap?.split(' ')[0]}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
