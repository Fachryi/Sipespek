import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, Loader2, ArrowLeft, Shield, CheckCircle } from 'lucide-react';
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
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState('');
  const navigate = useNavigate();

  const update = (key: keyof RegisterForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Konfirmasi password tidak cocok.'); return; }
    if (form.password.length < 6)               { setError('Password minimal 6 karakter.'); return; }
    if (!/^\d{16}$/.test(form.nik))             { setError('NIK harus 16 digit angka.'); return; }
    try {
      setIsLoading(true);
      await api.post<ApiResponse>('/auth/register', {
        nik: form.nik, username: form.username, password: form.password,
        nama_lengkap: form.nama_lengkap, no_hp: form.no_hp, alamat: form.alamat,
      });
      setSuccess('Pendaftaran berhasil! Mengalihkan ke halaman login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? 'Registrasi gagal. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reusable labeled input
  const Field = ({
    id, label, type = 'text', value, onChange, placeholder, maxLength, required = true,
  }: {
    id: string; label: string; type?: string; value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string; maxLength?: number; required?: boolean;
  }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold mb-1.5" style={{ color: '#0f172a', fontFamily: 'Manrope' }}>
        {label} {required && <span style={{ color: '#b91c1c' }}>*</span>}
      </label>
      <input
        id={id} type={type} value={value} onChange={onChange}
        placeholder={placeholder} maxLength={maxLength} disabled={isLoading}
        className="civic-input"
      />
    </div>
  );

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 py-10"
      style={{ background: 'linear-gradient(135deg, #003a1a 0%, #166534 60%, #0f766e 100%)' }}
    >
      {/* Gold top strip */}
      <div className="fixed top-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, #ca8a04, #fbbf24, #ca8a04)' }} />

      <div className="w-full max-w-lg animate-fade-in-up">
        {/* Brand header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex flex-col items-center gap-3">
            <img
              src="/logo.jpeg"
              alt="Logo Desa Wangkar Weli"
              className="w-14 h-14 rounded-full object-cover border-4 shadow-xl"
              style={{ borderColor: '#fbbf24' }}
            />
            <div>
              <div className="text-white font-bold text-xl" style={{ fontFamily: 'Source Serif 4' }}>SIPESPEK</div>
              <div className="text-green-200 text-xs" style={{ fontFamily: 'Manrope' }}>
                Desa Wangkar Weli — Kabupaten Manggarai Timur
              </div>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-lg overflow-hidden shadow-2xl" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
          {/* Card header */}
          <div className="px-6 py-4" style={{ background: '#f0fdf4', borderBottom: '1px solid #bbf7d0' }}>
            <h1 className="font-bold text-lg" style={{ fontFamily: 'Source Serif 4', color: '#0f172a' }}>
              Pendaftaran Akun Warga
            </h1>
            <p className="text-sm mt-0.5" style={{ color: '#475569', fontFamily: 'Manrope' }}>
              Isi data diri Anda sesuai KTP untuk mendaftar
            </p>
          </div>

          <div className="px-6 py-6">
            {/* Alerts */}
            {error && (
              <div className="flex items-start gap-2 p-3 rounded mb-4 text-sm"
                style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#7f1d1d', fontFamily: 'Manrope' }}>
                <Shield size={15} className="flex-shrink-0 mt-0.5" style={{ color: '#dc2626' }} />
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-start gap-2 p-3 rounded mb-4 text-sm"
                style={{ background: '#dcfce7', border: '1px solid #bbf7d0', color: '#14532d', fontFamily: 'Manrope' }}>
                <CheckCircle size={15} className="flex-shrink-0 mt-0.5" style={{ color: '#16a34a' }} />
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Row 1: NIK + Username */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Field id="nik" label="NIK" value={form.nik} onChange={update('nik')}
                  placeholder="16 digit angka" maxLength={16} />
                <Field id="username" label="Username" value={form.username} onChange={update('username')}
                  placeholder="username_anda" />
              </div>

              {/* Nama Lengkap */}
              <Field id="nama_lengkap" label="Nama Lengkap" value={form.nama_lengkap}
                onChange={update('nama_lengkap')} placeholder="Nama sesuai KTP" />

              {/* Row 2: Password + Konfirmasi */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold mb-1.5" style={{ color: '#0f172a', fontFamily: 'Manrope' }}>
                    Password <span style={{ color: '#b91c1c' }}>*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="password" type={showPassword ? 'text' : 'password'}
                      value={form.password} onChange={update('password')}
                      placeholder="Min. 6 karakter" disabled={isLoading}
                      className="civic-input" style={{ paddingRight: '44px' }}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <Field id="confirm-password" label="Konfirmasi Password" type="password"
                  value={form.confirmPassword} onChange={update('confirmPassword')} placeholder="Ulangi password" />
              </div>

              {/* No HP */}
              <Field id="no_hp" label="Nomor HP / WhatsApp" value={form.no_hp}
                onChange={update('no_hp')} placeholder="08xxxxxxxxxx" required={false} />

              {/* Alamat */}
              <div>
                <label htmlFor="alamat" className="block text-sm font-semibold mb-1.5" style={{ color: '#0f172a', fontFamily: 'Manrope' }}>
                  Alamat Lengkap
                </label>
                <textarea
                  id="alamat" value={form.alamat} onChange={update('alamat')} rows={2}
                  placeholder="Alamat sesuai KTP" disabled={isLoading}
                  className="civic-input"
                  style={{ height: 'auto', paddingTop: '10px', paddingBottom: '10px', resize: 'none' }}
                />
              </div>

              {/* Syarat info box */}
              <div className="p-3 rounded text-xs" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', fontFamily: 'Manrope' }}>
                <span className="font-bold">Catatan:</span> Pastikan NIK sesuai dengan data kependudukan yang terdaftar di desa agar validasi persyaratan surat dapat berjalan dengan benar.
              </div>

              {/* Submit */}
              <button
                type="submit" id="btn-register" disabled={isLoading}
                className="btn-primary w-full"
                style={{ height: '44px', borderRadius: '4px', fontSize: '14px' }}
              >
                {isLoading
                  ? <><Loader2 size={16} className="animate-spin" /> Mendaftarkan Akun...</>
                  : <><UserPlus size={16} /> Daftar Sekarang</>
                }
              </button>
            </form>

            <p className="text-center text-sm mt-5" style={{ color: '#475569', fontFamily: 'Manrope' }}>
              Sudah punya akun?{' '}
              <Link to="/login" className="font-semibold hover:underline" style={{ color: '#166534' }}>
                Masuk ke Sistem
              </Link>
            </p>

            <div className="mt-4 pt-4 text-center" style={{ borderTop: '1px solid #f1f5f9' }}>
              <Link to="/" className="inline-flex items-center gap-1.5 text-xs transition-colors hover:opacity-70"
                style={{ color: '#94a3b8', fontFamily: 'Manrope' }}>
                <ArrowLeft size={13} /> Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
