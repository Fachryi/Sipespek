import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Pages
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import WargaDashboard from '@/pages/warga/WargaDashboard';
import AjukanSuratPage from '@/pages/warga/AjukanSuratPage';
import RiwayatPage from '@/pages/warga/RiwayatPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import PendudukPage from '@/pages/admin/PendudukPage';
import KadesDashboard from '@/pages/kades/KadesDashboard';
import LaporanPage from '@/pages/kades/LaporanPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function RootRedirect() {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  const map = { warga: '/warga/dashboard', admin: '/admin/dashboard', kades: '/kades/dashboard' };
  return <Navigate to={map[role!] ?? '/'} replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Warga */}
            <Route path="/warga/dashboard" element={
              <ProtectedRoute allowedRoles={['warga']}><WargaDashboard /></ProtectedRoute>
            } />
            <Route path="/warga/ajukan" element={
              <ProtectedRoute allowedRoles={['warga']}><AjukanSuratPage /></ProtectedRoute>
            } />
            <Route path="/warga/riwayat" element={
              <ProtectedRoute allowedRoles={['warga']}><RiwayatPage /></ProtectedRoute>
            } />

            {/* Admin */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
            } />
            <Route path="/admin/permohonan" element={
              <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
            } />
            <Route path="/admin/penduduk" element={
              <ProtectedRoute allowedRoles={['admin']}><PendudukPage /></ProtectedRoute>
            } />

            {/* Kades */}
            <Route path="/kades/dashboard" element={
              <ProtectedRoute allowedRoles={['kades']}><KadesDashboard /></ProtectedRoute>
            } />
            <Route path="/kades/validasi" element={
              <ProtectedRoute allowedRoles={['kades']}><KadesDashboard /></ProtectedRoute>
            } />
            <Route path="/kades/laporan" element={
              <ProtectedRoute allowedRoles={['kades']}><LaporanPage /></ProtectedRoute>
            } />

            {/* Catch-all */}
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
