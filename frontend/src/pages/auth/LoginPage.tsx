import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Loader2, ArrowLeft, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { type ApiResponse, type AuthResponse, type Role } from '@/types';

const DASHBOARD_MAP: Record<Role, string> = {
  warga: '/warga/dashboard',
  admin: '/admin/dashboard',
  kades: '/kades/dashboard',
};

export default function LoginPage() {
  const [username, setUsername]         = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState('');

  const { login }  = useAuth();
  const navigate   = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Username dan password wajib diisi.');
      return;
    }
    try {
      setIsLoading(true);
      const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', { username, password });
      const { token, user } = res.data.data;
      login(token, user);
      navigate(DASHBOARD_MAP[user.role]);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? 'Login gagal. Periksa username dan password Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #003a1a 0%, #166534 60%, #0f766e 100%)' }}
    >
      {/* Gold top strip */}
      <div className="fixed top-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, #ca8a04, #fbbf24, #ca8a04)' }} />

      <div className="w-full max-w-md animate-fade-in-up">
        {/* Header brand */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex flex-col items-center gap-3">
            <img
              src="/logo.jpeg"
              alt="Logo Desa Wangkar Weli"
              className="w-16 h-16 rounded-full object-cover border-4 shadow-xl"
              style={{ borderColor: '#fbbf24' }}
            />
            <div>
              <div className="text-white font-bold text-xl tracking-wide" style={{ fontFamily: 'Source Serif 4' }}>
                SIPESPEK
              </div>
              <div className="text-green-200 text-xs" style={{ fontFamily: 'Manrope' }}>
                Desa Wangkar Weli — Kabupaten Manggarai Timur
              </div>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div
          className="rounded-lg overflow-hidden shadow-2xl"
          style={{ background: '#fff', border: '1px solid #e2e8f0' }}
        >
          {/* Card header */}
          <div className="px-6 py-4" style={{ background: '#f0fdf4', borderBottom: '1px solid #bbf7d0' }}>
            <h1 className="font-bold text-lg" style={{ fontFamily: 'Source Serif 4', color: '#0f172a' }}>
              Masuk ke Akun Warga
            </h1>
            <p className="text-sm mt-0.5" style={{ color: '#475569', fontFamily: 'Manrope' }}>
              Gunakan username dan password yang telah Anda daftarkan
            </p>
          </div>

          {/* Form */}
          <div className="px-6 py-6">
            {/* Error */}
            {error && (
              <div
                className="flex items-start gap-2 p-3 rounded mb-5 text-sm"
                style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#7f1d1d', fontFamily: 'Manrope' }}
              >
                <Shield size={15} className="flex-shrink-0 mt-0.5" style={{ color: '#dc2626' }} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-semibold mb-1.5"
                  style={{ color: '#0f172a', fontFamily: 'Manrope' }}
                >
                  Username <span style={{ color: '#b91c1c' }}>*</span>
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="civic-input"
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold mb-1.5"
                  style={{ color: '#0f172a', fontFamily: 'Manrope' }}
                >
                  Password <span style={{ color: '#b91c1c' }}>*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    className="civic-input"
                    style={{ paddingRight: '44px' }}
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: '#94a3b8' }}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                id="btn-login"
                disabled={isLoading}
                className="btn-primary w-full mt-2"
                style={{ borderRadius: '4px', height: '44px', fontSize: '14px' }}
              >
                {isLoading
                  ? <><Loader2 size={16} className="animate-spin" /> Memproses...</>
                  : <><LogIn size={16} /> Masuk ke Sistem</>
                }
              </button>
            </form>

            <p className="text-center text-sm mt-5" style={{ color: '#475569', fontFamily: 'Manrope' }}>
              Belum punya akun?{' '}
              <Link to="/register" className="font-semibold hover:underline" style={{ color: '#166534' }}>
                Daftar sebagai Warga
              </Link>
            </p>

            <div className="mt-4 pt-4 text-center" style={{ borderTop: '1px solid #f1f5f9' }}>
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs transition-colors hover:opacity-70"
                style={{ color: '#94a3b8', fontFamily: 'Manrope' }}
              >
                <ArrowLeft size={13} /> Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>

        {/* Demo credentials */}
        <div
          className="mt-4 rounded-lg p-4 text-xs space-y-1"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', fontFamily: 'Manrope' }}
        >
          <p className="font-bold uppercase tracking-wider mb-2" style={{ color: '#fbbf24', fontSize: '10px' }}>
            Demo Kredensial
          </p>
          {[
            { role: 'Admin',  cred: 'admin / admin123' },
            { role: 'Kades',  cred: 'kades / kades123' },
            { role: 'Warga ✅', cred: 'rinasafitri / password123' },
            { role: 'Warga ❌', cred: 'donipratama / password123' },
          ].map((d) => (
            <div key={d.role} className="flex justify-between">
              <span style={{ color: '#86efac' }}>{d.role}:</span>
              <span className="font-mono" style={{ color: '#fff', letterSpacing: '0.02em' }}>{d.cred}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
