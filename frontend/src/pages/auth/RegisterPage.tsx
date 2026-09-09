import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, FileText, UserPlus, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { type ApiResponse } from '@/types';

interface RegisterForm {
  nik: string;
  username: string;
  password: string;
  confirmPassword: string;
  nama_lengkap: string;
  no_hp: string;
  alamat: string;
}

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterForm>({
    nik: '', username: '', password: '', confirmPassword: '',
    nama_lengkap: '', no_hp: '', alamat: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const update = (key: keyof RegisterForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }
    if (!/^\d{16}$/.test(form.nik)) {
      setError('NIK harus 16 digit angka.');
      return;
    }

    try {
      setIsLoading(true);
      await api.post<ApiResponse>('/auth/register', {
        nik: form.nik,
        username: form.username,
        password: form.password,
        nama_lengkap: form.nama_lengkap,
        no_hp: form.no_hp,
        alamat: form.alamat,
      });
      setSuccess('Registrasi berhasil! Anda akan diarahkan ke halaman login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? 'Registrasi gagal. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const InputField = ({
    id, label, type = 'text', value, onChange, placeholder, maxLength
  }: {
    id: string; label: string; type?: string; value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string; maxLength?: number;
  }) => (
    <div>
      <label className="text-slate-300 text-sm font-medium block mb-1.5">{label}</label>
      <input
        id={id} type={type} value={value} onChange={onChange}
        placeholder={placeholder} maxLength={maxLength} disabled={isLoading}
        className="w-full bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition-all"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 py-8">
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative animate-fade-in-up">
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl">
                <FileText size={22} className="text-white" />
              </div>
              <span className="text-white font-bold text-lg">SIPESPEK</span>
            </Link>
          </div>

          <h1 className="text-white font-bold text-xl text-center mb-1">Daftar Akun Warga</h1>
          <p className="text-slate-400 text-sm text-center mb-6">Isi data diri Anda untuk mendaftar</p>

          {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-red-400 text-sm">{error}</div>}
          {success && <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 mb-4 text-emerald-400 text-sm">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <InputField id="nik" label="NIK (16 digit)" value={form.nik} onChange={update('nik')} placeholder="3201010101010001" maxLength={16} />
              <InputField id="username" label="Username" value={form.username} onChange={update('username')} placeholder="username_anda" />
            </div>
            <InputField id="nama_lengkap" label="Nama Lengkap" value={form.nama_lengkap} onChange={update('nama_lengkap')} placeholder="Nama sesuai KTP" />
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 text-sm font-medium block mb-1.5">Password</label>
                <div className="relative">
                  <input
                    id="password" type={showPassword ? 'text' : 'password'}
                    value={form.password} onChange={update('password')} placeholder="Min. 6 karakter"
                    disabled={isLoading}
                    className="w-full bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition-all"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <InputField id="confirm-password" label="Konfirmasi Password" type="password" value={form.confirmPassword} onChange={update('confirmPassword')} placeholder="Ulangi password" />
            </div>
            <InputField id="no_hp" label="Nomor HP / WhatsApp" value={form.no_hp} onChange={update('no_hp')} placeholder="08xxxxxxxxxx" />
            <div>
              <label className="text-slate-300 text-sm font-medium block mb-1.5">Alamat Lengkap</label>
              <textarea
                id="alamat" value={form.alamat} onChange={update('alamat')} rows={2}
                placeholder="Alamat lengkap sesuai KTP" disabled={isLoading}
                className="w-full bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition-all resize-none"
              />
            </div>

            <button
              type="submit" disabled={isLoading} id="btn-register"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-xl font-semibold text-sm hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.01] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
              {isLoading ? 'Mendaftar...' : 'Daftar Sekarang'}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-5">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">Masuk</Link>
          </p>
          <div className="mt-3 pt-3 border-t border-slate-700/50">
            <Link to="/" className="flex items-center justify-center text-slate-500 hover:text-slate-300 text-xs transition-colors">← Kembali ke Beranda</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
