import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, FileText, LogIn, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { type ApiResponse, type AuthResponse, type Role } from '@/types';

const DASHBOARD_MAP: Record<Role, string> = {
  warga: '/warga/dashboard',
  admin: '/admin/dashboard',
  kades: '/kades/dashboard',
};

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative animate-fade-in-up">
        {/* Card */}
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl">
                <FileText size={28} className="text-white" />
              </div>
              <div>
                <div className="text-white font-bold text-xl">SIPESPEK</div>
                <div className="text-slate-400 text-xs">Desa Wangkar Weli</div>
              </div>
            </Link>
          </div>

          <h1 className="text-white font-bold text-xl text-center mb-1">Masuk ke Akun</h1>
          <p className="text-slate-400 text-sm text-center mb-6">Gunakan username dan password Anda untuk masuk</p>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-5 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-slate-300 text-sm font-medium block mb-1.5">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="w-full bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition-all"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="text-slate-300 text-sm font-medium block mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition-all"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              id="btn-login"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-xl font-semibold text-sm hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.01] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100 mt-2"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
              {isLoading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Belum punya akun?{' '}
            <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
              Daftar sebagai Warga
            </Link>
          </p>

          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <Link to="/" className="flex items-center justify-center text-slate-500 hover:text-slate-300 text-xs transition-colors gap-1">
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>

        {/* Demo credentials hint */}
        <div className="mt-4 bg-slate-800/50 border border-slate-700/30 rounded-2xl p-4 text-xs text-slate-500">
          <p className="font-semibold text-slate-400 mb-2">Demo Kredensial:</p>
          <p>Admin: <span className="text-slate-300">admin / admin123</span></p>
          <p>Kades: <span className="text-slate-300">kades / kades123</span></p>
        </div>
      </div>
    </div>
  );
}
