import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Upload, FileText, X, CheckCircle, Loader2,
  ShieldCheck, ShieldX, AlertTriangle, Info,
  User, Calendar, CreditCard, Home, BookOpen,
  ArrowRight, ChevronDown,
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import api from '@/lib/api';
import {
  type ApiResponse,
  type JenisSurat,
  type CekSyaratResponse,
} from '@/types';

interface UploadedFile {
  key: string;
  label: string;
  file: File | null;
}

// Pemetaan icon syarat_umum ke komponen Lucide
const syaratIconMap: Record<string, React.ReactNode> = {
  age:     <Calendar size={15} className="text-emerald-500" />,
  kk:      <Home size={15} className="text-emerald-500" />,
  warga:   <User size={15} className="text-emerald-500" />,
  ktp:     <CreditCard size={15} className="text-emerald-500" />,
  nikah:   <ShieldCheck size={15} className="text-emerald-500" />,
  anak:    <User size={15} className="text-emerald-500" />,
  sekolah: <BookOpen size={15} className="text-emerald-500" />,
  pindah:  <ArrowRight size={15} className="text-emerald-500" />,
  form:    <FileText size={15} className="text-emerald-500" />,
};

export default function AjukanSuratPage() {
  const navigate = useNavigate();

  // State
  const [selectedJenis, setSelectedJenis] = useState<JenisSurat | null>(null);
  const [keperluan, setKeperluan]         = useState('');
  const [files, setFiles]                 = useState<UploadedFile[]>([]);
  const [error, setError]                 = useState('');
  const [step, setStep]                   = useState<1 | 2 | 3 | 4>(1);

  // ── 1. Fetch semua jenis surat ────────────────────────────────────
  const { data: jenisSuratList, isLoading: loadingJenis } = useQuery({
    queryKey: ['jenis-surat'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<JenisSurat[]>>('/jenis-surat');
      return res.data.data;
    },
  });

  // ── 2. Fetch cek-syarat tiap jenis surat (untuk badge di Step 1) ─
  // Kita query SEMUA jenis surat sekaligus agar badge bisa langsung tampil
  const jenisSuratIds = jenisSuratList?.map(j => j.id) ?? [];
  const { data: eligibilityMap, isLoading: loadingEligibility } = useQuery({
    queryKey: ['cek-syarat-all', jenisSuratIds],
    enabled: jenisSuratIds.length > 0,
    queryFn: async () => {
      const results: Record<number, CekSyaratResponse> = {};
      await Promise.all(
        jenisSuratIds.map(async (id) => {
          try {
            const res = await api.get<ApiResponse<CekSyaratResponse>>(
              `/permohonan/cek-syarat?jenis_surat_id=${id}`
            );
            results[id] = res.data.data;
          } catch {
            // Abaikan error per-item; badge akan ditampilkan netral
          }
        })
      );
      return results;
    },
  });

  // ── 3. Cek syarat detail untuk jenis surat yang dipilih ──────────
  const { data: syaratDetail, isLoading: loadingSyarat } = useQuery({
    queryKey: ['cek-syarat', selectedJenis?.id],
    enabled: !!selectedJenis,
    queryFn: async () => {
      const res = await api.get<ApiResponse<CekSyaratResponse>>(
        `/permohonan/cek-syarat?jenis_surat_id=${selectedJenis!.id}`
      );
      return res.data.data;
    },
  });

  // Reset step saat jenis surat berubah
  useEffect(() => {
    if (selectedJenis) {
      setStep(2);
      setFiles(selectedJenis.persyaratan.map(p => ({ key: p.key, label: p.label, file: null })));
      setError('');
      setKeperluan('');
    }
  }, [selectedJenis?.id]);

  // ── Handlers ─────────────────────────────────────────────────────
  const handleSelectJenis = (js: JenisSurat) => {
    setSelectedJenis(js);
  };

  const handleFileChange = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file && file.size > 2 * 1024 * 1024) {
      setError(`File "${file.name}" melebihi batas 2MB.`);
      return;
    }
    setFiles(prev => prev.map(f => f.key === key ? { ...f, file } : f));
    setError('');
  };

  const removeFile = (key: string) => {
    setFiles(prev => prev.map(f => f.key === key ? { ...f, file: null } : f));
  };

  // ── Submit mutation ───────────────────────────────────────────────
  const submitMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('jenis_surat_id', String(selectedJenis!.id));
      formData.append('keperluan', keperluan);
      files.forEach(({ key, file }) => {
        if (file) formData.append(key, file);
      });
      const res = await api.post<ApiResponse>('/permohonan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      navigate('/warga/riwayat', { state: { success: true } });
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? 'Pengajuan gagal. Silakan coba lagi.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!selectedJenis) { setError('Pilih jenis surat terlebih dahulu.'); return; }
    if (!syaratDetail?.eligible) { setError('Anda tidak memenuhi syarat untuk jenis surat ini.'); return; }
    const missing = files.filter(f => !f.file);
    if (missing.length) { setError(`Berkas wajib: ${missing.map(m => m.label).join(', ')}`); return; }
    submitMutation.mutate();
  };

  // ── UI Helpers ───────────────────────────────────────────────────
  const kodeIcons: Record<string, string> = { KTP: '🪪', KK: '👨‍👩‍👧‍👦', DOMISILI: '🏠' };

  const isEligible   = eligibilityMap?.[selectedJenis?.id ?? 0]?.eligible;
  const eligibleBg   = isEligible === true ? 'border-emerald-500 bg-emerald-50 shadow-md'
                     : isEligible === false ? 'border-red-400 bg-red-50 shadow-md'
                     : '';

  // ─────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h2 className="headline-sm" style={{ color: '#0f172a' }}>Ajukan Surat Pengantar</h2>
          <p className="text-sm mt-1" style={{ color: '#475569', fontFamily: 'Manrope' }}>Pilih jenis surat, cek persyaratan, dan unggah berkas dokumen</p>
        </div>

        {/* ── STEP 1: Pilih Jenis Surat ── */}
        <div className="civic-card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#0f172a', fontFamily: 'Source Serif 4', fontSize: '17px' }}>
            <span className="w-6 h-6 text-white rounded flex items-center justify-center text-xs font-bold" style={{ background: '#166534' }}>1</span>
            Pilih Jenis Surat
          </h3>

          {loadingJenis ? (
            <div className="grid sm:grid-cols-3 gap-3">
              {[1, 2, 3].map(i => <div key={i} className="h-28 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="grid sm:grid-cols-3 gap-3">
              {(jenisSuratList ?? []).map((js) => {
                const eli = eligibilityMap?.[js.id];
                const isSelected = selectedJenis?.id === js.id;
                return (
                  <button
                    key={js.id}
                    onClick={() => handleSelectJenis(js)}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-200 hover:scale-[1.02] relative
                      ${isSelected
                        ? (eli?.eligible === false
                          ? 'border-red-400 bg-red-50 shadow-md'
                          : 'border-emerald-500 bg-emerald-50 shadow-md')
                        : 'border-slate-200 hover:border-emerald-200 hover:bg-slate-50'
                      }`}
                  >
                    <div className="text-2xl mb-2">{kodeIcons[js.kode_surat] ?? '📄'}</div>
                    <div className="text-slate-800 font-semibold text-sm">{js.nama_surat}</div>
                    <div className="text-slate-500 text-xs mt-1 line-clamp-2">{js.deskripsi}</div>

                    {/* Badge Kelayakan */}
                    <div className="mt-2">
                      {loadingEligibility ? (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                          <Loader2 size={11} className="animate-spin" /> Mengecek...
                        </span>
                      ) : eli?.eligible === true ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <ShieldCheck size={11} /> Memenuhi Syarat
                        </span>
                      ) : eli?.eligible === false ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                          <ShieldX size={11} /> Tidak Memenuhi Syarat
                        </span>
                      ) : null}
                    </div>

                    {isSelected && (
                      <CheckCircle size={16} className="absolute top-3 right-3 text-emerald-500" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── STEP 2: Persyaratan & Ketentuan ── */}
        {selectedJenis && (
          <div className={`rounded-2xl border-2 shadow-sm p-6 transition-all duration-300
            ${syaratDetail?.eligible === false
              ? 'border-red-200 bg-red-50/40'
              : 'border-slate-100 bg-white'}`}
          >
            <h3 className="text-slate-700 font-semibold mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
              Persyaratan &amp; Ketentuan
              {loadingSyarat && <Loader2 size={15} className="ml-2 animate-spin text-slate-400" />}
            </h3>

            {loadingSyarat ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <div key={i} className="h-8 bg-slate-100 rounded-lg animate-pulse" />)}
              </div>
            ) : syaratDetail ? (
              <div className="space-y-4">

                {/* Status Kelayakan */}
                {syaratDetail.eligible ? (
                  <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                    <ShieldCheck size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-emerald-700 font-semibold text-sm">Anda Memenuhi Syarat</p>
                      <p className="text-emerald-600 text-xs mt-0.5">
                        Data kependudukan Anda telah terverifikasi dan memenuhi semua persyaratan.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-3">
                    <ShieldX size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-700 font-semibold text-sm">Tidak Memenuhi Syarat</p>
                      <ul className="mt-1 space-y-1">
                        {syaratDetail.alasan.map((a, i) => (
                          <li key={i} className="text-red-600 text-xs flex items-start gap-1.5">
                            <AlertTriangle size={11} className="flex-shrink-0 mt-0.5" />
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Daftar Syarat Umum — pisahkan universal vs spesifik */}
                <div className="space-y-3">
                  {/* Syarat Dasar Universal */}
                  {syaratDetail.syarat_umum.some((s: {is_universal?: boolean}) => s.is_universal) && (
                    <div className="p-3 rounded" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                      <p className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: '#166534', fontFamily: 'Manrope' }}>
                        <Info size={12} /> Syarat Dasar Universal (Berlaku untuk Semua Layanan)
                      </p>
                      <ul className="space-y-1.5">
                        {syaratDetail.syarat_umum
                          .filter((s: {is_universal?: boolean}) => s.is_universal)
                          .map((s: {icon: string; label: string}, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#14532d' }}>
                              <span className="flex-shrink-0 mt-0.5" style={{ color: '#166534' }}>
                                {syaratIconMap[s.icon] ?? <CheckCircle size={14} />}
                              </span>
                              {s.label}
                            </li>
                          ))
                        }
                      </ul>
                    </div>
                  )}

                  {/* Syarat Spesifik per Jenis Surat */}
                  {syaratDetail.syarat_umum.some((s: {is_universal?: boolean}) => !s.is_universal) && (
                    <div className="p-3 rounded" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
                      <p className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: '#475569', fontFamily: 'Manrope' }}>
                        <Info size={12} /> Berkas yang Diperlukan
                      </p>
                      <ul className="space-y-1.5">
                        {syaratDetail.syarat_umum
                          .filter((s: {is_universal?: boolean}) => !s.is_universal)
                          .map((s: {icon: string; label: string}, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#334155' }}>
                              <span className="flex-shrink-0 mt-0.5" style={{ color: '#166534' }}>
                                {syaratIconMap[s.icon] ?? <CheckCircle size={14} />}
                              </span>
                              {s.label}
                            </li>
                          ))
                        }
                      </ul>
                    </div>
                  )}
                </div>

                {/* Data Penduduk Ringkas */}
                {syaratDetail.data_penduduk && (
                  <details className="group">
                    <summary className="cursor-pointer text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 select-none">
                      <ChevronDown size={13} className="group-open:rotate-180 transition-transform" />
                      Lihat data kependudukan yang terdeteksi
                    </summary>
                    <div className="mt-2 grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
                      <div><span className="text-slate-400">Nama:</span> {syaratDetail.data_penduduk.nama}</div>
                      <div><span className="text-slate-400">NIK:</span> {syaratDetail.data_penduduk.nik}</div>
                      <div><span className="text-slate-400">Tgl Lahir:</span> {syaratDetail.data_penduduk.tanggal_lahir}</div>
                      <div><span className="text-slate-400">Status:</span> {syaratDetail.data_penduduk.status_perkawinan}</div>
                      <div><span className="text-slate-400">No. KK:</span> {syaratDetail.data_penduduk.no_kk || '-'}</div>
                      <div><span className="text-slate-400">Dusun:</span> {syaratDetail.data_penduduk.dusun}</div>
                    </div>
                  </details>
                )}

                {/* Tombol Lanjut — hanya aktif jika eligible */}
                {syaratDetail.eligible && step === 2 && (
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    Lanjut ke Pengisian <ArrowRight size={17} />
                  </button>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* ── STEP 3 & 4: Form (hanya tampil jika step >= 3 dan eligible) ── */}
        {selectedJenis && syaratDetail?.eligible && step >= 3 && (
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Step 3: Keperluan */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-slate-700 font-semibold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                Keterangan Keperluan
              </h3>
              <textarea
                value={keperluan}
                onChange={e => setKeperluan(e.target.value)}
                rows={3}
                placeholder={`Contoh: Pembuatan ${selectedJenis.nama_surat} baru`}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all resize-none"
              />
            </div>

            {/* Step 4: Upload Berkas */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-slate-700 font-semibold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                Unggah Berkas Persyaratan
              </h3>
              <div className="space-y-4">
                {files.map(({ key, label, file }) => (
                  <div key={key}>
                    <label className="text-slate-600 text-sm font-medium block mb-2">
                      {label} <span className="text-red-500">*</span>
                    </label>
                    {file ? (
                      <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                        <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-slate-700 text-sm font-medium truncate">{file.name}</div>
                          <div className="text-slate-400 text-xs">{(file.size / 1024).toFixed(0)} KB</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(key)}
                          className="text-red-400 hover:text-red-600 flex-shrink-0"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-xl p-6 cursor-pointer transition-colors bg-slate-50 hover:bg-emerald-50/50 group">
                        <Upload size={24} className="text-slate-300 group-hover:text-emerald-400 mb-2 transition-colors" />
                        <span className="text-slate-400 text-sm group-hover:text-slate-600">Klik untuk pilih file</span>
                        <span className="text-slate-300 text-xs mt-1">JPG, PNG, atau PDF — Maks. 2MB</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,application/pdf"
                          className="hidden"
                          onChange={e => handleFileChange(key, e)}
                        />
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm flex items-center gap-2">
                <AlertTriangle size={16} className="flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitMutation.isPending}
              id="btn-ajukan"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3.5 rounded-xl font-semibold hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitMutation.isPending
                ? <><Loader2 size={18} className="animate-spin" /> Mengirim Permohonan...</>
                : <><FileText size={18} /> Kirim Permohonan</>}
            </button>
          </form>
        )}

      </div>
    </DashboardLayout>
  );
}
