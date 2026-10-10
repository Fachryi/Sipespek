import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText, CheckCircle, Clock, Download, ArrowRight,
  Phone, MapPin, Shield, Star, ChevronRight, Building2,
  Search, Loader2, AlertCircle, XCircle, CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { type Role } from '@/types';
import api from '@/lib/api';
import { type ApiResponse } from '@/types';

// ── Types untuk lacak mandiri ────────────────────────────────
interface LacakResult {
  nomor_permohonan: string;
  status: string;
  status_label: string;
  stage: number;
  is_selesai: boolean;
  is_ditolak: boolean;
  tanggal_pengajuan: string;
  tanggal_persetujuan: string | null;
  nomor_surat_resmi: string | null;
  alasan_penolakan: string | null;
  nama_surat: string;
  kode_surat: string;
  nama_sensor: string;
}
interface LacakResponse {
  found: boolean;
  query_type: string;
  jumlah?: number;
  results: LacakResult[];
}

const DASHBOARD_MAP: Record<Role, string> = {
  warga: '/warga/dashboard',
  admin: '/admin/dashboard',
  kades: '/kades/dashboard',
};

const steps = [
  {
    num: '01', icon: <FileText size={22} />, title: 'Daftar & Login',
    desc: 'Buat akun warga dengan NIK dan masuk ke portal layanan desa.',
    color: '#166534',
  },
  {
    num: '02', icon: <CheckCircle size={22} />, title: 'Pilih & Ajukan Surat',
    desc: 'Pilih jenis surat pengantar dan unggah berkas persyaratan.',
    color: '#0f766e',
  },
  {
    num: '03', icon: <Clock size={22} />, title: 'Verifikasi Petugas',
    desc: 'Admin desa dan Kepala Desa memverifikasi berkas permohonan.',
    color: '#ca8a04',
  },
  {
    num: '04', icon: <Download size={22} />, title: 'Unduh Surat Resmi',
    desc: 'Unduh PDF surat pengantar bernomor resmi kapan saja.',
    color: '#166534',
  },
];

const layanan = [
  {
    kode: 'KTP-EL',
    nama: 'Pengantar KTP Elektronik',
    desc: 'Surat pengantar untuk pembuatan atau perpanjangan KTP Elektronik di Dinas Dukcapil.',
    syarat: ['Scan Kartu Keluarga (KK)', 'Foto Copy KTP-el lama (bagi yang sudah merekam)'],
    syaratUmum: ['Berusia ≥ 17 tahun atau sudah menikah', 'Memiliki KK', 'Terdaftar sebagai warga desa'],
    icon: '🪪',
    accentColor: '#166534',
    bgColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    badgeBg: '#dcfce7',
    badgeText: '#14532d',
  },
  {
    kode: 'KK',
    nama: 'Pengantar Kartu Keluarga',
    desc: 'Surat pengantar untuk pembuatan Kartu Keluarga (KK) baru di Dinas Dukcapil.',
    syarat: ['Foto Copy KTP-el Kepala Keluarga', 'Buku Nikah / Akta Perkawinan', 'Akta Kelahiran Anak', 'Ijazah / Surat Keterangan Lulus', 'Surat Keterangan Pindah (jika dari daerah lain)'],
    syaratUmum: [],
    icon: '👨‍👩‍👧‍👦',
    accentColor: '#0f766e',
    bgColor: '#f0fdfa',
    borderColor: '#99f6e4',
    badgeBg: '#ccfbf1',
    badgeText: '#134e4a',
  },
  {
    kode: 'DOMISILI',
    nama: 'Keterangan Domisili',
    desc: 'Surat keterangan yang menerangkan bahwa seseorang berdomisili di Desa Wangkar Weli.',
    syarat: ['Foto Copy KTP Pemohon', 'Foto Copy Kartu Keluarga (KK)', 'Formulir permohonan keterangan domisili'],
    syaratUmum: [],
    icon: '🏠',
    accentColor: '#ca8a04',
    bgColor: '#fffbeb',
    borderColor: '#fde68a',
    badgeBg: '#fef3c7',
    badgeText: '#78350f',
  },
];

const stats = [
  { label: 'Jenis Layanan', value: '4+', icon: '📋' },
  { label: 'Warga Terlayani', value: '1.200+', icon: '👥' },
  { label: 'Waktu Rata-rata', value: '<24 Jam', icon: '⚡' },
  { label: 'Kepuasan Warga', value: '100%', icon: '⭐' },
];

export default function LandingPage() {
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  // ── Pelacakan Mandiri state ──────────────────────────────────
  const [lacakQuery, setLacakQuery]   = useState('');
  const [lacakLoading, setLacakLoading] = useState(false);
  const [lacakResult, setLacakResult] = useState<LacakResponse | null>(null);
  const [lacakError, setLacakError]   = useState('');
  const lacakRef = useRef<HTMLDivElement>(null);

  const handleMulai = () => {
    if (isAuthenticated && role) {
      navigate(DASHBOARD_MAP[role]);
    } else {
      navigate('/login');
    }
  };

  const handleLacak = async (e: React.FormEvent) => {
    e.preventDefault();
    setLacakError('');
    setLacakResult(null);
    const q = lacakQuery.trim();
    if (!q) { setLacakError('Masukkan NIK atau nomor permohonan terlebih dahulu.'); return; }
    if (q.length < 5) { setLacakError('Query terlalu pendek. Masukkan NIK (16 digit) atau nomor permohonan.'); return; }
    try {
      setLacakLoading(true);
      const res = await api.get<ApiResponse<LacakResponse>>(`/public/lacak?query=${encodeURIComponent(q)}`);
      setLacakResult(res.data.data);
    } catch {
      setLacakError('Gagal menghubungi server. Coba beberapa saat lagi.');
    } finally {
      setLacakLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Manrope', sans-serif", background: '#faf8ff' }}>

      {/* ════════════════════════════════════
          NAVBAR — Civic green with gold line
      ════════════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 civic-topbar shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-14 gap-4">
            {/* Logo + Brand */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
              <img
                src="/logo.jpeg"
                alt="Logo Kabupaten Manggarai Timur"
                className="w-9 h-9 rounded-full object-cover border-2 shadow"
                style={{ borderColor: '#fbbf24' }}
              />
              <div className="leading-tight">
                <div className="text-white font-bold text-sm tracking-wide">SIPESPEK</div>
                <div className="text-green-200 text-[10px] hidden sm:block">
                  Desa Wangkar Weli — Manggarai Timur
                </div>
              </div>
            </Link>

            <div className="flex-1" />

            {/* CTA Buttons */}
            <div className="flex items-center gap-2">
              {isAuthenticated && role ? (
                <Link
                  to={DASHBOARD_MAP[role]}
                  className="flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold text-white border border-white/30 hover:bg-white/10 transition-colors"
                >
                  Dashboard <ArrowRight size={14} />
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-semibold text-green-100 hover:text-white transition-colors"
                  >
                    Masuk
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded text-sm font-bold border-2 transition-all"
                    style={{ background: '#ca8a04', borderColor: '#ca8a04', color: '#fff' }}
                  >
                    Daftar Sekarang
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        {/* Gold accent line */}
        <div style={{ height: '3px', background: 'linear-gradient(90deg, #ca8a04, #fbbf24, #ca8a04)' }} />
      </nav>

      {/* ════════════════════════════════════
          HERO
      ════════════════════════════════════ */}
      <section className="hero-bg pt-20" style={{ minHeight: '520px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <div className="animate-fade-in-up">
              {/* Institutional label */}
              <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded"
                style={{ background: 'rgba(202,138,4,0.2)', border: '1px solid rgba(202,138,4,0.4)' }}>
                <span className="w-2 h-2 rounded-full animate-pulse-slow" style={{ background: '#fbbf24' }} />
                <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#fbbf24', fontFamily: 'Manrope' }}>
                  Pelayanan Administrasi Digital
                </span>
              </div>

              <h1 className="display-hero text-white mb-5">
                Pelayanan Surat Kependudukan Desa Wangkar Weli{' '}
                <span className="text-gradient-civic">Lebih Cepat, Terbuka &amp; Mudah</span>
              </h1>

              <p className="mb-8 leading-relaxed text-green-100" style={{ fontSize: '16px' }}>
                Portal resmi warga Desa Wangkar Weli untuk membuat Surat Pengantar KTP Elektronik, Kartu Keluarga (KK), Keterangan Domisili, dan tang lain — langsung dari rumah tanpa perlu antri di kantor.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <button
                  onClick={handleMulai}
                  className="btn-primary"
                  style={{ height: '48px', paddingLeft: '24px', paddingRight: '24px', fontSize: '15px', background: '#ca8a04', borderRadius: '4px' }}
                >
                  Mulai Buat Surat Sekarang <ArrowRight size={16} />
                </button>
                <a
                  href="#layanan"
                  className="btn-secondary"
                  style={{ height: '48px', paddingLeft: '24px', paddingRight: '24px', fontSize: '15px', borderColor: 'rgba(255,255,255,0.4)', color: '#fff', background: 'transparent', borderRadius: '4px' }}
                >
                  Lihat Layanan
                </a>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="text-center px-3 py-3 rounded"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
                  >
                    <div className="text-xl mb-0.5">{s.icon}</div>
                    <div className="text-white font-bold text-lg leading-tight">{s.value}</div>
                    <div className="text-green-200 text-xs mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Foto Kantor Desa + Caption */}
            <div className="hidden lg:block animate-fade-in delay-200">
              <div className="civic-card overflow-hidden" style={{ borderRadius: '8px' }}>
                {/* Badge Sistem Digital */}
                <div className="relative">
                  <img
                    src="/kantor_desa.png"
                    alt="Kantor Pelayanan Desa Wangkar Weli"
                    className="w-full object-cover"
                    style={{ height: '260px', objectPosition: 'center top' }}
                  />
                  {/* Overlay badge top-right */}
                  <div
                    className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded"
                    style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid #e2e8f0', backdropFilter: 'blur(4px)' }}
                  >
                    <span className="w-2 h-2 rounded-full animate-pulse-slow" style={{ background: '#16a34a' }} />
                    <span className="text-xs font-bold" style={{ color: '#166534', fontFamily: 'Manrope' }}>Sistem Digital Desa</span>
                  </div>
                </div>

                {/* Caption area */}
                <div style={{ background: '#166534', padding: '14px 18px 16px' }}>
                  <div className="text-white font-bold text-sm mb-1" style={{ fontFamily: 'Source Serif 4' }}>
                    Kantor Pelayanan Desa Wangkar Weli
                  </div>
                  <p className="text-green-200 text-xs leading-relaxed">
                    Kami menyediakan pelayanan administrasi kependudukan Desa Wangkar Weli yang profesional, ramah, dan terbuka untuk seluruh masyarakat.
                  </p>
                  <div className="flex items-center gap-2 mt-2.5">
                    <MapPin size={12} style={{ color: '#fbbf24' }} />
                    <span className="text-xs" style={{ color: '#fbbf24', fontFamily: 'Manrope' }}>Kec. Lamba Leda, Manggarai Timur, NTT</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          FITUR PELACAKAN MANDIRI
      ════════════════════════════════════ */}
      <section ref={lacakRef} style={{ background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="max-w-3xl">
            {/* Label */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-widest"
                  style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', fontFamily: 'Manrope' }}
                >
                  Fitur Pelacakan Mandiri
                </span>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="text-xs font-semibold hover:underline"
                style={{ color: '#166534', fontFamily: 'Manrope' }}
              >
                Pembuatan Surat Baru →
              </button>
            </div>

            <p className="text-sm mb-4" style={{ color: '#475569', fontFamily: 'Manrope' }}>
              <strong style={{ color: '#0f172a' }}>Cek Status Pengajuan Surat Anda</strong>{' '}—
              Masukkan NIK atau Nomor Permohonan (format: CTIRO-xxxxxxxx) untuk memantau proses surat.
            </p>

            {/* Search form */}
            <form onSubmit={handleLacak} className="flex gap-2">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }} />
                <input
                  type="text"
                  value={lacakQuery}
                  onChange={e => setLacakQuery(e.target.value)}
                  placeholder="Masukkan Nomor NIK/KTP Anda (Contoh: CTIRO-xxxxxxx)"
                  className="civic-input"
                  style={{ paddingLeft: '38px', height: '44px', borderRadius: '4px' }}
                  id="input-lacak-mandiri"
                />
              </div>
              <button
                type="submit"
                id="btn-lacak-mandiri"
                disabled={lacakLoading}
                className="btn-primary flex-shrink-0"
                style={{ height: '44px', paddingLeft: '20px', paddingRight: '20px', borderRadius: '4px', minWidth: '130px' }}
              >
                {lacakLoading
                  ? <><Loader2 size={15} className="animate-spin" /> Mencari...</>
                  : <><Search size={15} /> Lacak Dokumen</>
                }
              </button>
            </form>

            {/* Error */}
            {lacakError && (
              <div className="flex items-center gap-2 mt-3 text-sm" style={{ color: '#b91c1c', fontFamily: 'Manrope' }}>
                <AlertCircle size={15} className="flex-shrink-0" />
                {lacakError}
              </div>
            )}

            {/* Results */}
            {lacakResult && (
              <div className="mt-4 space-y-3 animate-fade-in">
                {!lacakResult.found ? (
                  <div
                    className="flex items-center gap-3 p-4 rounded"
                    style={{ background: '#fef9c3', border: '1px solid #fef08a' }}
                  >
                    <AlertCircle size={18} style={{ color: '#ca8a04', flexShrink: 0 }} />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#713f12', fontFamily: 'Manrope' }}>Data tidak ditemukan</p>
                      <p className="text-xs mt-0.5" style={{ color: '#92400e', fontFamily: 'Manrope' }}>
                        Tidak ada permohonan yang terdaftar dengan {lacakResult.query_type} tersebut.
                        Pastikan NIK atau nomor permohonan sudah benar.
                      </p>
                    </div>
                  </div>
                ) : (
                  lacakResult.results.map((r) => (
                    <div
                      key={r.nomor_permohonan}
                      className="civic-dossier p-4"
                      style={{ borderLeftColor: r.is_ditolak ? '#dc2626' : r.is_selesai ? '#16a34a' : '#ca8a04' }}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: '#94a3b8', fontFamily: 'Manrope' }}>
                            {r.kode_surat}
                          </div>
                          <div className="font-bold text-sm" style={{ color: '#0f172a', fontFamily: 'Source Serif 4' }}>
                            {r.nama_surat}
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: '#64748b', fontFamily: 'Manrope' }}>
                            a.n. {r.nama_sensor} &nbsp;·&nbsp; {r.nomor_permohonan}
                          </div>
                        </div>
                        {/* Status badge */}
                        {r.is_selesai ? (
                          <span className="badge-success flex-shrink-0">
                            <CheckCircle2 size={11} /> Selesai
                          </span>
                        ) : r.is_ditolak ? (
                          <span className="badge-error flex-shrink-0">
                            <XCircle size={11} /> Ditolak
                          </span>
                        ) : (
                          <span className="badge-warning flex-shrink-0">
                            <Clock size={11} /> Diproses
                          </span>
                        )}
                      </div>

                      {/* Progress bar */}
                      {!r.is_ditolak && (
                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1" style={{ color: '#94a3b8', fontFamily: 'Manrope' }}>
                            <span>Diajukan</span><span>Verifikasi</span><span>Disetujui</span>
                          </div>
                          <div className="relative h-1.5 rounded-full" style={{ background: '#e2e8f0' }}>
                            <div
                              className="absolute left-0 top-0 h-full rounded-full transition-all"
                              style={{ background: '#166534', width: `${Math.min(100, (r.stage / 3) * 100)}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="text-xs" style={{ color: '#475569', fontFamily: 'Manrope' }}>
                        <span className="font-semibold" style={{ color: '#166534' }}>{r.status_label}</span>
                        {r.alasan_penolakan && (
                          <span className="block mt-1" style={{ color: '#b91c1c' }}>Alasan: {r.alasan_penolakan}</span>
                        )}
                        {r.nomor_surat_resmi && (
                          <span className="block mt-1" style={{ color: '#166534' }}>No. Surat: <strong>{r.nomor_surat_resmi}</strong></span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          JENIS LAYANAN
      ════════════════════════════════════ */}
      <section id="layanan" className="py-20 px-4" style={{ background: '#faf8ff' }}>
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-12">
            <div className="inline-block px-3 py-1 rounded mb-3 text-xs font-bold uppercase tracking-widest"
              style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', fontFamily: 'Manrope' }}>
              Daftar Layanan Surat
            </div>
            <h2 className="headline-lg" style={{ color: '#0f172a' }}>Pilih Jenis Surat Pengantar</h2>
            <div className="section-divider mx-auto mt-4 mb-4" />
            <p className="max-w-xl mx-auto" style={{ color: '#475569', fontSize: '15px' }}>
              Pengajuan praktis dari mana saja. Siapkan foto dokumen persyaratan dan ponsel Anda,
              dan permohonan akan diproses secara langsung.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {layanan.map((l) => (
              <div
                key={l.kode}
                className="civic-card flex flex-col"
                style={{ borderTop: `4px solid ${l.accentColor}` }}
              >
                {/* Card header */}
                <div className="px-5 pt-5 pb-4 border-b" style={{ borderColor: '#f1f5f9' }}>
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">{l.icon}</span>
                    <span
                      className="label-technical px-2 py-1 rounded"
                      style={{ background: l.badgeBg, color: l.badgeText }}
                    >
                      {l.kode}
                    </span>
                  </div>
                  <h3 className="font-bold text-base mb-1" style={{ fontFamily: 'Source Serif 4', color: '#0f172a' }}>
                    {l.nama}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#475569' }}>{l.desc}</p>
                </div>

                {/* Persyaratan */}
                <div className="px-5 py-4 flex-1">
                  <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#94a3b8', fontFamily: 'Manrope' }}>
                    Berkas yang Diperlukan
                  </div>
                  <ul className="space-y-2">
                    {l.syarat.map((s, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: '#334155' }}>
                        <CheckCircle size={14} className="flex-shrink-0 mt-0.5" style={{ color: l.accentColor }} />
                        {s}
                      </li>
                    ))}
                  </ul>

                  {l.syaratUmum.length > 0 && (
                    <div className="mt-3 p-3 rounded" style={{ background: l.bgColor, border: `1px solid ${l.borderColor}` }}>
                      <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: l.accentColor, fontFamily: 'Manrope' }}>
                        Syarat Umum
                      </div>
                      {l.syaratUmum.map((s, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs" style={{ color: l.badgeText }}>
                          <span style={{ color: l.accentColor }}>·</span> {s}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* CTA */}
                <div className="px-5 pb-5">
                  <button
                    onClick={handleMulai}
                    className="w-full btn-primary"
                    style={{ background: l.accentColor, borderRadius: '4px' }}
                  >
                    Ajukan {l.kode} <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          ALUR PENGAJUAN
      ════════════════════════════════════ */}
      <section className="py-20 px-4" style={{ background: '#f0fdf4', borderTop: '1px solid #bbf7d0', borderBottom: '1px solid #bbf7d0' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block px-3 py-1 rounded mb-3 text-xs font-bold uppercase tracking-widest"
              style={{ background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', fontFamily: 'Manrope' }}>
              Tata Cara Mudah
            </div>
            <h2 className="headline-lg" style={{ color: '#0f172a' }}>Alur Pengajuan Surat Online</h2>
            <div className="section-divider mx-auto mt-4 mb-4" />
            <p style={{ color: '#475569', fontSize: '15px' }}>Ikuti langkah berikut dan dapatkan surat resmi tanpa perlu meninggalkan rumah</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div
                key={i}
                className="civic-card p-6 text-center animate-fade-in-up"
                style={{ animationDelay: `${i * 80}ms`, borderTop: `4px solid ${step.color}` }}
              >
                <div
                  className="w-12 h-12 rounded flex items-center justify-center text-white mx-auto mb-4"
                  style={{ background: step.color }}
                >
                  {step.icon}
                </div>
                <div className="label-technical mb-2" style={{ color: step.color }}>Langkah {step.num}</div>
                <h3 className="font-bold text-base mb-2" style={{ fontFamily: 'Source Serif 4', color: '#0f172a' }}>
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#475569' }}>{step.desc}</p>
              </div>
            ))}
          </div>

          {/* FAQ teaser */}
          <div className="mt-10 text-center">
            <div
              className="inline-flex items-center gap-3 px-5 py-3 rounded"
              style={{ background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(15,23,42,0.05)' }}
            >
              <span className="text-sm" style={{ color: '#475569' }}>
                Mengalami Kesulitan atau Kendala?
              </span>
              <a href="#kontak" className="text-sm font-semibold flex items-center gap-1" style={{ color: '#166534' }}>
                Hubungi Operator Desa <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          PROFIL KANTOR DESA
      ════════════════════════════════════ */}
      <section id="kontak" className="py-20 px-4" style={{ background: '#faf8ff' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left */}
            <div>
              <div className="inline-block px-3 py-1 rounded mb-4 text-xs font-bold uppercase tracking-widest"
                style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', fontFamily: 'Manrope' }}>
                Profil & Layanan Kantor
              </div>
              <h2 className="headline-md mb-2" style={{ color: '#0f172a' }}>Kantor Desa Wangkar Weli</h2>
              <div className="section-divider mb-4" />
              <p className="mb-6 leading-relaxed" style={{ color: '#475569', fontSize: '15px' }}>
                Pemerintah Desa Wangkar Weli melayani setiap warga, baik pribumi maupun pendatang, dengan sepenuh hati dan berkeadilan. SIPESPEK dihadirkan untuk meringkas perjalanan warga dan menghemat waktu Anda.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  { icon: <MapPin size={16} />, text: 'Kecamatan Lamba Leda, Kabupaten Manggarai Timur, NTT' },
                  { icon: <Phone size={16} />, text: '+62 813-XXXX-XXXX' },
                  { icon: <Clock size={16} />, text: 'Senin – Jumat, 08.00 – 16.00 WITA' },
                ].map((info, i) => (
                  <div key={i} className="flex items-center gap-3" style={{ color: '#334155', fontSize: '14px' }}>
                    <span style={{ color: '#166534' }}>{info.icon}</span>
                    {info.text}
                  </div>
                ))}
              </div>

              <button
                onClick={handleMulai}
                className="btn-primary"
                style={{ background: '#166534', borderRadius: '4px', height: '44px' }}
              >
                Hubungi Petugas via WhatsApp
              </button>
            </div>

            {/* Right: Feature grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <Shield size={22} />, title: 'Aman & Terpercaya', desc: 'Data kependudukan dilindungi enkripsi dan hanya diakses petugas berwenang.', color: '#166534' },
                { icon: <Star size={22} />, title: 'Proses Cepat & Tanggap', desc: 'Verifikasi berkas dan penerbitan surat dalam 1–3 hari kerja.', color: '#ca8a04' },
                { icon: <FileText size={22} />, title: 'Surat Sah & Berstempel', desc: 'Setiap surat bernomor resmi, berlambang, dan ditandatangani Kepala Desa.', color: '#0f766e' },
                { icon: <Download size={22} />, title: 'Unduh Dokumen PDF', desc: 'Surat tersedia dalam format PDF siap cetak tanpa perlu ambil fisik.', color: '#166534' },
              ].map((f, i) => (
                <div
                  key={i}
                  className="civic-card p-4"
                  style={{ borderLeft: `3px solid ${f.color}` }}
                >
                  <div className="mb-3" style={{ color: f.color }}>{f.icon}</div>
                  <h4 className="font-bold text-sm mb-1" style={{ color: '#0f172a', fontFamily: 'Source Serif 4' }}>{f.title}</h4>
                  <p className="text-xs leading-relaxed" style={{ color: '#475569' }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          CTA BANNER
      ════════════════════════════════════ */}
      <section className="py-16 px-4" style={{ background: '#166534' }}>
        <div
          className="max-w-7xl mx-auto rounded-xl p-10 text-center"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          <div className="inline-block px-3 py-1 rounded mb-4 text-xs font-bold uppercase tracking-widest"
            style={{ background: 'rgba(202,138,4,0.25)', color: '#fbbf24', border: '1px solid rgba(202,138,4,0.4)', fontFamily: 'Manrope' }}>
            Pelayanan Warga Kembali
          </div>
          <h2 className="headline-md text-white mb-3">Siap Mengajukan Surat Kependudukan?</h2>
          <p className="mb-8 max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.75)', fontSize: '15px' }}>
            Mulai permohonan sekarang dan rasakan kemudahan layanan Digital Desa Wangkar Weli — cepat, transparan, dan tanpa biaya.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={handleMulai}
              className="btn-primary"
              style={{ background: '#ca8a04', height: '48px', paddingLeft: '28px', paddingRight: '28px', borderRadius: '4px', fontSize: '15px' }}
            >
              Mulai Pengajuan Surat <ArrowRight size={16} />
            </button>
            <button
              onClick={() => document.querySelector('#layanan')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-secondary"
              style={{ height: '48px', paddingLeft: '28px', paddingRight: '28px', borderRadius: '4px', fontSize: '15px', background: 'transparent', borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}
            >
              Lacak Status Surat
            </button>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          FOOTER
      ════════════════════════════════════ */}
      <footer style={{ background: '#0f172a', borderTop: '3px solid #ca8a04' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <img src="/logo.jpeg" alt="Logo" className="w-10 h-10 rounded-full object-cover border-2" style={{ borderColor: '#fbbf24' }} />
                <div>
                  <div className="text-white font-bold" style={{ fontFamily: 'Source Serif 4' }}>SIPESPEK</div>
                  <div className="text-xs" style={{ color: '#64748b' }}>Desa Wangkar Weli</div>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>
                Sistem Informasi Pelayanan Surat Pengantar Kependudukan — Pemerintah Desa Wangkar Weli, Kabupaten Manggarai Timur, NTT.
              </p>
            </div>

            {/* Layanan */}
            <div>
              <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#4ade80', fontFamily: 'Manrope' }}>
                Layanan Surat
              </div>
              {['Pengantar KTP Elektronik', 'Pengantar Kartu Keluarga', 'Keterangan Domisili'].map((l) => (
                <button
                  key={l}
                  onClick={handleMulai}
                  className="flex items-center gap-2 text-sm mb-2 hover:opacity-80 transition-opacity"
                  style={{ color: '#94a3b8' }}
                >
                  <ChevronRight size={13} style={{ color: '#4ade80' }} /> {l}
                </button>
              ))}
            </div>

            {/* Kontak */}
            <div>
              <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#fbbf24', fontFamily: 'Manrope' }}>
                Kontak & Informasi
              </div>
              <div className="space-y-2 text-sm" style={{ color: '#94a3b8' }}>
                <div className="flex items-center gap-2">
                  <Building2 size={13} style={{ color: '#4ade80' }} /> Kantor Desa Wangkar Weli
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={13} style={{ color: '#4ade80' }} /> Kec. Lamba Leda, Manggarai Timur
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={13} style={{ color: '#4ade80' }} /> Senin–Jumat, 08.00–16.00 WITA
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderColor: '#1e293b' }}>
            <p className="text-xs" style={{ color: '#475569' }}>
              © {new Date().getFullYear()} SIPESPEK — Sistem Informasi Pelayanan Surat Pengantar Kependudukan
            </p>
            <p className="text-xs" style={{ color: '#475569' }}>
              Pemerintah Desa Wangkar Weli — Kabupaten Manggarai Timur (NTT)
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
