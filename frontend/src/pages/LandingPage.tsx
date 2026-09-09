import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, CheckCircle, Clock, Download, ArrowRight, Building2, Phone, MapPin, Shield, Users, Star, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { type Role } from '@/types';

const DASHBOARD_MAP: Record<Role, string> = {
  warga: '/warga/dashboard',
  admin: '/admin/dashboard',
  kades: '/kades/dashboard',
};

const steps = [
  { icon: <FileText size={24} />, title: 'Daftar & Login', desc: 'Buat akun atau login dengan NIK Anda', color: 'from-violet-500 to-purple-600' },
  { icon: <CheckCircle size={24} />, title: 'Ajukan Surat', desc: 'Pilih jenis surat & unggah berkas persyaratan', color: 'from-blue-500 to-cyan-500' },
  { icon: <Clock size={24} />, title: 'Proses Verifikasi', desc: 'Admin & Kepala Desa memverifikasi permohonan', color: 'from-amber-500 to-orange-500' },
  { icon: <Download size={24} />, title: 'Unduh Surat', desc: 'Download PDF surat pengantar resmi', color: 'from-emerald-500 to-teal-500' },
];

const layanan = [
  {
    kode: 'KTP',
    nama: 'Surat Pengantar KTP',
    desc: 'Untuk keperluan pembuatan atau perpanjangan Kartu Tanda Penduduk di Dukcapil.',
    syarat: ['Pasfoto 3×4 terbaru', 'Scan Kartu Keluarga'],
    icon: '🪪',
    color: 'from-violet-500/10 to-purple-500/10 border-violet-200',
    badge: 'bg-violet-100 text-violet-700',
  },
  {
    kode: 'KK',
    nama: 'Surat Pengantar KK',
    desc: 'Untuk keperluan pembuatan, perubahan, atau pecah Kartu Keluarga di Dukcapil.',
    syarat: ['Scan KTP Kepala Keluarga', 'Scan KK Lama / Keterangan Pecah KK'],
    icon: '👨‍👩‍👧‍👦',
    color: 'from-blue-500/10 to-cyan-500/10 border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
  },
  {
    kode: 'DOMISILI',
    nama: 'Surat Keterangan Domisili',
    desc: 'Menerangkan bahwa seseorang berdomisili di wilayah Desa Wangkar Weli.',
    syarat: ['Scan KTP', 'Scan Kartu Keluarga'],
    icon: '🏠',
    color: 'from-emerald-500/10 to-teal-500/10 border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700',
  },
];

const stats = [
  { label: 'Jenis Layanan', value: '3', icon: '📋' },
  { label: 'Warga Terlayani', value: '1.200+', icon: '👥' },
  { label: 'Surat Diterbitkan', value: '850+', icon: '📄' },
  { label: 'Tingkat Kepuasan', value: '98%', icon: '⭐' },
];

export default function LandingPage() {
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  const handleMulai = () => {
    if (isAuthenticated && role) {
      navigate(DASHBOARD_MAP[role]);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10 bg-slate-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText size={18} className="text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-base">SIPESPEK</span>
              <span className="hidden sm:block text-slate-400 text-xs">Desa Wangkar Weli</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated && role ? (
              <Link
                to={DASHBOARD_MAP[role]}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 flex items-center gap-2"
              >
                Dashboard <ArrowRight size={14} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-slate-300 hover:text-white text-sm font-medium transition-colors px-3 py-1.5">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300"
                >
                  Daftar Sekarang
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-24 pb-20 px-4 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse-slow delay-300" />
          <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-teal-500/5 rounded-full blur-2xl" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative">
          {/* Chip */}
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-emerald-400 text-sm font-medium">Layanan Administrasi Digital</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight animate-fade-in-up">
            Pelayanan Surat Kependudukan
            <br />
            <span className="gradient-text">Desa Wangkar Weli</span>
          </h1>

          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-100">
            Platform digital modern untuk mengajukan surat pengantar KTP, KK, dan Keterangan Domisili secara online. Cepat, mudah, dan transparan.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-200">
            <button
              onClick={handleMulai}
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-2xl text-base font-bold hover:shadow-2xl hover:shadow-emerald-500/40 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Mulai Pengajuan <ArrowRight size={18} />
            </button>
            <a
              href="#layanan"
              className="w-full sm:w-auto border border-slate-600 text-slate-300 hover:text-white hover:border-slate-400 px-8 py-4 rounded-2xl text-base font-semibold transition-all duration-300 text-center"
            >
              Lihat Layanan
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 animate-fade-in-up delay-300">
            {stats.map((s) => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center backdrop-blur-sm card-hover">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-white font-bold text-xl">{s.value}</div>
                <div className="text-slate-400 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LAYANAN ── */}
      <section id="layanan" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Jenis Layanan Surat</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Tiga jenis surat pengantar yang dapat Anda ajukan secara online melalui sistem kami</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {layanan.map((l) => (
              <div key={l.kode} className={`bg-gradient-to-br ${l.color} border rounded-2xl p-6 card-hover backdrop-blur-sm`}>
                <div className="text-4xl mb-4">{l.icon}</div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${l.badge} mb-3 inline-block`}>{l.kode}</span>
                <h3 className="text-white font-bold text-lg mb-2">{l.nama}</h3>
                <p className="text-slate-300 text-sm mb-4 leading-relaxed">{l.desc}</p>
                <div className="space-y-1.5">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Persyaratan:</p>
                  {l.syarat.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-300 text-sm">
                      <CheckCircle size={13} className="text-emerald-400 flex-shrink-0" />
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ALUR PENGAJUAN ── */}
      <section className="py-20 px-4 bg-slate-800/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Alur Pengajuan</h2>
            <p className="text-slate-400">Proses pengajuan surat yang mudah dan transparan dalam 4 langkah</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="relative bg-white/5 border border-white/10 rounded-2xl p-6 text-center card-hover">
                <div className={`w-14 h-14 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg`}>
                  {step.icon}
                </div>
                <div className="absolute top-4 right-4 w-7 h-7 bg-slate-700 rounded-full flex items-center justify-center text-slate-300 text-xs font-bold">
                  {i + 1}
                </div>
                <h3 className="text-white font-semibold mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INFO DESA ── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-3xl p-8 lg:p-12">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <Building2 size={20} className="text-emerald-400" />
                  </div>
                  <span className="text-emerald-400 font-semibold">Tentang Kami</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                  Kantor Desa Wangkar Weli
                </h2>
                <p className="text-slate-300 leading-relaxed mb-6">
                  Desa Wangkar Weli berkomitmen untuk memberikan pelayanan administrasi kependudukan yang cepat, transparan, dan berintegritas kepada seluruh masyarakat.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-300">
                    <MapPin size={16} className="text-emerald-400 flex-shrink-0" />
                    <span className="text-sm">Kecamatan Wori, Kabupaten Minahasa Utara, Sulawesi Utara</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <Phone size={16} className="text-emerald-400 flex-shrink-0" />
                    <span className="text-sm">(0431) XXXXXX</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <Clock size={16} className="text-emerald-400 flex-shrink-0" />
                    <span className="text-sm">Senin – Jumat, 08.00 – 16.00 WITA</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <Shield size={24} />, title: 'Aman & Terpercaya', desc: 'Data kependudukan diproteksi dengan enkripsi tingkat tinggi' },
                  { icon: <Clock size={24} />, title: 'Proses Cepat', desc: 'Verifikasi dan approval dilakukan dalam 1–3 hari kerja' },
                  { icon: <FileText size={24} />, title: 'Surat Resmi', desc: 'Surat pengantar berlambang resmi dan bernomor surat' },
                  { icon: <Download size={24} />, title: 'Unduh PDF', desc: 'Surat dapat diunduh kapan saja setelah disetujui' },
                ].map((f, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                    <div className="text-emerald-400 flex justify-center mb-2">{f.icon}</div>
                    <h4 className="text-white font-semibold text-sm mb-1">{f.title}</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Siap Mengajukan Surat?
          </h2>
          <p className="text-slate-400 mb-8">Daftar sekarang dan nikmati kemudahan layanan administrasi digital Desa Wangkar Weli</p>
          <button
            onClick={handleMulai}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-10 py-4 rounded-2xl text-base font-bold hover:shadow-2xl hover:shadow-emerald-500/40 hover:scale-105 transition-all duration-300 flex items-center gap-2 mx-auto"
          >
            Mulai Sekarang <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-700/50 py-8 px-4 text-center">
        <p className="text-slate-500 text-sm">
          © {new Date().getFullYear()} SIPESPEK — Sistem Informasi Pelayanan Surat Pengantar Kependudukan
          <br className="sm:hidden" />
          <span className="hidden sm:inline"> · </span>Kantor Desa Wangkar Weli, Kecamatan Wori, Sulawesi Utara
        </p>
      </footer>
    </div>
  );
}
