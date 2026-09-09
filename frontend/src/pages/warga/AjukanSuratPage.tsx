import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, X, CheckCircle, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import api from '@/lib/api';
import { type ApiResponse, type JenisSurat } from '@/types';

interface UploadedFile {
  key: string;
  label: string;
  file: File | null;
}

export default function AjukanSuratPage() {
  const navigate = useNavigate();
  const [selectedJenis, setSelectedJenis] = useState<JenisSurat | null>(null);
  const [keperluan, setKeperluan] = useState('');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState('');

  const { data: jenisSuratList, isLoading: loadingJenis } = useQuery({
    queryKey: ['jenis-surat'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<JenisSurat[]>>('/jenis-surat');
      return res.data.data;
    },
  });

  const handleSelectJenis = (js: JenisSurat) => {
    setSelectedJenis(js);
    setFiles(js.persyaratan.map(p => ({ key: p.key, label: p.label, file: null })));
    setError('');
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
    const missing = files.filter(f => !f.file);
    if (missing.length) { setError(`Berkas wajib: ${missing.map(m => m.label).join(', ')}`); return; }
    submitMutation.mutate();
  };

  const kodeIcons: Record<string, string> = { KTP: '🪪', KK: '👨‍👩‍👧‍👦', DOMISILI: '🏠' };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h2 className="text-slate-800 font-bold text-2xl">Ajukan Surat Pengantar</h2>
          <p className="text-slate-500 text-sm mt-1">Pilih jenis surat dan unggah berkas persyaratan</p>
        </div>

        {/* Step 1: Pilih Jenis Surat */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-slate-700 font-semibold mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
            Pilih Jenis Surat
          </h3>
          {loadingJenis ? (
            <div className="grid sm:grid-cols-3 gap-3">
              {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="grid sm:grid-cols-3 gap-3">
              {(jenisSuratList ?? []).map((js) => (
                <button
                  key={js.id}
                  onClick={() => handleSelectJenis(js)}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-200 hover:scale-[1.02]
                    ${selectedJenis?.id === js.id
                      ? 'border-emerald-500 bg-emerald-50 shadow-md'
                      : 'border-slate-200 hover:border-emerald-200 hover:bg-slate-50'
                    }`}
                >
                  <div className="text-2xl mb-2">{kodeIcons[js.kode_surat] ?? '📄'}</div>
                  <div className="text-slate-800 font-semibold text-sm">{js.nama_surat}</div>
                  <div className="text-slate-500 text-xs mt-1 line-clamp-2">{js.deskripsi}</div>
                  {selectedJenis?.id === js.id && (
                    <CheckCircle size={16} className="text-emerald-500 mt-2" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Step 2: Form */}
        {selectedJenis && (
          <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
            {/* Keperluan */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-slate-700 font-semibold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                Keterangan Keperluan
              </h3>
              <textarea
                value={keperluan} onChange={e => setKeperluan(e.target.value)} rows={3}
                placeholder={`Contoh: Pembuatan ${selectedJenis.nama_surat} baru`}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all resize-none"
              />
            </div>

            {/* Upload Berkas */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-slate-700 font-semibold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
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
                        <button type="button" onClick={() => removeFile(key)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-xl p-6 cursor-pointer transition-colors bg-slate-50 hover:bg-emerald-50/50 group">
                        <Upload size={24} className="text-slate-300 group-hover:text-emerald-400 mb-2 transition-colors" />
                        <span className="text-slate-400 text-sm group-hover:text-slate-600">Klik untuk pilih file</span>
                        <span className="text-slate-300 text-xs mt-1">JPG, PNG, atau PDF — Maks. 2MB</span>
                        <input
                          type="file" accept="image/jpeg,image/png,application/pdf"
                          className="hidden" onChange={e => handleFileChange(key, e)}
                        />
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit" disabled={submitMutation.isPending} id="btn-ajukan"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3.5 rounded-xl font-semibold hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
              {submitMutation.isPending ? 'Mengirim Permohonan...' : 'Kirim Permohonan'}
            </button>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
