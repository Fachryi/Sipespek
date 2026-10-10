import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home, FileText, Users, ClipboardList,
  BarChart2, CheckSquare, LogOut, Menu, X,
  ChevronDown,
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
    { to: '/warga/dashboard',  label: 'Dashboard',          icon: <Home size={16} /> },
    { to: '/warga/ajukan',     label: 'Ajukan Surat',        icon: <FileText size={16} /> },
    { to: '/warga/riwayat',    label: 'Riwayat Permohonan', icon: <ClipboardList size={16} /> },
  ],
  admin: [
    { to: '/admin/dashboard',  label: 'Dashboard',           icon: <Home size={16} /> },
    { to: '/admin/permohonan', label: 'Permohonan',          icon: <ClipboardList size={16} /> },
    { to: '/admin/penduduk',   label: 'Data Penduduk',       icon: <Users size={16} /> },
  ],
  kades: [
    { to: '/kades/dashboard',  label: 'Dashboard',           icon: <Home size={16} /> },
    { to: '/kades/validasi',   label: 'Validasi & Approval', icon: <CheckSquare size={16} /> },
    { to: '/kades/laporan',    label: 'Laporan Pelayanan',   icon: <BarChart2 size={16} /> },
  ],
};

const roleLabels: Record<Role, string> = {
  warga: 'Warga',
  admin: 'Admin Desa',
  kades: 'Kepala Desa',
};

const roleBadgeStyle: Record<Role, string> = {
  warga: 'bg-sky-100 text-sky-800 border border-sky-200',
  admin: 'bg-amber-100 text-amber-800 border border-amber-200',
  kades: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  const navItems = role ? navByRole[role] : [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close user menu on outside click
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#faf8ff' }}>

      {/* ── TOPBAR ── */}
      <header className="sticky top-0 z-40 civic-topbar shadow-md">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-14 gap-6">

            {/* Logo */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <img
                src="/logo.jpeg"
                alt="Logo Desa Wangkar Weli"
                className="w-8 h-8 rounded-full object-cover border-2 border-yellow-400 shadow"
              />
              <div className="leading-tight">
                <div className="text-white font-bold text-sm tracking-wide" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  SIPESPEK
                </div>
                <div className="text-green-200 text-[10px] font-medium hidden sm:block">
                  Desa Wangkar Weli
                </div>
              </div>
            </div>

            {/* Gold separator */}
            <div className="hidden lg:block w-px h-6 bg-yellow-400/40" />

            {/* Desktop Nav Links */}
            <nav className="hidden lg:flex items-center gap-1 flex-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-all duration-150
                     ${isActive
                       ? 'bg-white/20 text-white border border-white/30'
                       : 'text-green-100 hover:text-white hover:bg-white/10'
                     }`
                  }
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Right: User Dropdown */}
            <div className="ml-auto flex items-center gap-3">
              {/* Role badge */}
              {role && (
                <span
                  className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border"
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    color: '#fef08a',
                    borderColor: 'rgba(254,240,138,0.4)',
                    fontFamily: 'Manrope',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  {roleLabels[role]}
                </span>
              )}

              {/* User menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(v => !v)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
                >
                  {/* Avatar */}
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white border border-yellow-400/60 flex-shrink-0"
                    style={{ background: 'rgba(202,138,4,0.7)' }}
                  >
                    {getInitials(user?.nama_lengkap ?? 'U')}
                  </div>
                  <span className="text-white text-sm font-medium hidden sm:block max-w-28 truncate" style={{ fontFamily: 'Manrope' }}>
                    {user?.nama_lengkap?.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} className={`text-green-200 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-56 rounded-lg shadow-xl border overflow-hidden animate-fade-in"
                    style={{ background: '#fff', borderColor: '#e2e8f0' }}
                  >
                    {/* User info */}
                    <div className="px-4 py-3 border-b" style={{ borderColor: '#e2e8f0', background: '#f0fdf4' }}>
                      <div className="text-sm font-semibold" style={{ color: '#0f172a', fontFamily: 'Manrope' }}>
                        {user?.nama_lengkap}
                      </div>
                      {user?.nik && (
                        <div className="text-xs mt-0.5 label-technical" style={{ color: '#475569' }}>
                          NIK: {user.nik}
                        </div>
                      )}
                      {role && (
                        <span className={`inline-block mt-1.5 px-2 py-0.5 rounded text-xs font-semibold ${roleBadgeStyle[role]}`}
                          style={{ fontFamily: 'Manrope' }}>
                          {roleLabels[role]}
                        </span>
                      )}
                    </div>

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-red-50"
                      style={{ color: '#dc2626', fontFamily: 'Manrope' }}
                    >
                      <LogOut size={15} />
                      Keluar dari Akun
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(v => !v)}
                className="lg:hidden p-2 rounded text-green-100 hover:text-white hover:bg-white/10 transition-colors"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav drawer */}
        {mobileOpen && (
          <div
            className="lg:hidden border-t px-4 py-3 space-y-1 animate-fade-in"
            style={{ background: '#14532d', borderColor: 'rgba(255,255,255,0.15)' }}
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2.5 rounded text-sm font-medium transition-colors
                   ${isActive
                     ? 'bg-white/20 text-white'
                     : 'text-green-100 hover:text-white hover:bg-white/10'
                   }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </div>
        )}
      </header>

      {/* ── Gold strip below topbar (accent line from DESIGN.md) ── */}
      <div style={{ height: '2px', background: 'linear-gradient(90deg, #ca8a04, #fbbf24, #ca8a04)' }} />

      {/* ── Page Content ── */}
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>

    </div>
  );
}
