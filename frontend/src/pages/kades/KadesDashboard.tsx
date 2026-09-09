import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, Eye, FileText, Loader2, X, BarChart2, Users, Clock, TrendingUp } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DataTable } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import api from '@/lib/api';
import { formatDateTime, BACKEND_URL } from '@/lib/utils';
import { type ApiResponse, type PermohonanSurat, type PaginatedData, type Statistik } from '@/types';

function StatCard({ label, value, sub, icon, color }: { label: string; value: number | string; sub?: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm card-hover">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>{icon}</div>
      </div>
      <div className="text-2xl font-bold text-slate-800">{value}</div>
      <div className="text-slate-500 text-sm mt-0.5">{label}</div>
      {sub && <div className="text-slate-400 text-xs mt-1">{sub}</div>}
    </div>
  );
}

interface ApprovalModalProps {
  permohonan: PermohonanSurat;
  onClose: () => void;
  onAction: (aksi: 'setujui' | 'tolak', alasan?: string) => void;
  isLoading: boolean;
}

function ApprovalModal({ permohonan, onClose, onAction, isLoading }: ApprovalModalProps) {
  const [mode, setMode] = useState<'view' | 'tolak'>('view');
  const [alasan, setAlasan] = useState('');

  const { data: detail } = useQuery({
    queryKey: ['permohonan-detail-kades', permohonan.id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PermohonanSurat>>(`/permohonan/${permohonan.id}`);
      return res.data.data;
    },
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Approval Surat Pengantar</h3>
            <p className="text-slate-400 text-xs font-mono">{permohonan.nomor_permohonan}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={permohonan.status} />
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"><X size={20} /></button>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <div className="bg-slate-50 rounded-xl p-4 grid sm:grid-cols-2 gap-3 text-sm">
            {[
              ['Nama Pemohon', detail?.nama_lengkap],
              ['NIK', detail?.nik],
              ['Jenis Surat', detail?.nama_surat],
              ['No. HP', detail?.no_hp],
              ['Keperluan', detail?.keperluan || '-'],
              ['Tanggal Pengajuan', formatDateTime(detail?.tanggal_pengajuan)],
            ].map(([k, v]) => (
              <div key={k as string}>
                <span className="text-slate-400 text-xs">{k as string}</span>
                <div className="text-slate-700 font-medium">{v as string ?? '-'}</div>
              </div>
            ))}
          </div>

          {detail?.berkas && detail.berkas.length > 0 && (
            <div>
              <h4 className="text-slate-600 font-semibold text-sm mb-3">Berkas Persyaratan</h4>
              <div className="space-y-2">
                {detail.berkas.map((b) => (
                  <div key={b.id} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                    <FileText size={15} className="text-slate-400" />
                    <div className="flex-1 min-w-0">
                      <div className="text-slate-700 text-sm font-medium">{b.nama_persyaratan}</div>
                      <div className="text-slate-400 text-xs truncate">{b.original_filename}</div>
                    </div>
                    <a href={`${BACKEND_URL}/${b.file_path}`} target="_blank" rel="noreferrer"
                      className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 hover:bg-blue-100 transition-colors">
                      <Eye size={12} /> Lihat
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {permohonan.status === 'diverifikasi_admin' && (
            <div className="border-t border-slate-100 pt-4">
              {mode === 'view' ? (
                <div className="flex gap-3">
                  <button onClick={() => onAction('setujui')} disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-emerald-500/30 disabled:opacity-60">
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />} Setujui & Terbitkan Surat
                  </button>
                  <button onClick={() => setMode('tolak')}
                    className="flex-1 bg-red-50 text-red-600 border border-red-200 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-red-100 transition-colors">
                    <XCircle size={16} /> Tolak
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-600 block">Alasan Penolakan <span className="text-red-500">*</span></label>
                  <textarea value={alasan} onChange={e => setAlasan(e.target.value)} rows={3} placeholder="Alasan Kepala Desa menolak..."
                    className="w-full border border-red-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none" />
                  <div className="flex gap-3">
                    <button onClick={() => setMode('view')} className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">Batal</button>
                    <button onClick={() => alasan.trim() && onAction('tolak', alasan)} disabled={!alasan.trim() || isLoading}
                      className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                      {isLoading && <Loader2 size={14} className="animate-spin" />} Konfirmasi Penolakan
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function KadesDashboard() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('diverifikasi_admin');
  const [selected, setSelected] = useState<PermohonanSurat | null>(null);
  const queryClient = useQueryClient();

  const { data: statistik } = useQuery({
    queryKey: ['statistik'],
    queryFn: async () => { const res = await api.get<ApiResponse<Statistik>>('/laporan/statistik'); return res.data.data; },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['all-permohonan-kades', page, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page) });
      if (statusFilter) params.append('status', statusFilter);
      const res = await api.get<ApiResponse<PaginatedData<PermohonanSurat>>>(`/permohonan/all?${params}`);
      return res.data.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, aksi, alasan }: { id: number; aksi: string; alasan?: string }) => {
      await api.put(`/permohonan/${id}/approve`, { aksi, alasan });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-permohonan-kades'] });
      queryClient.invalidateQueries({ queryKey: ['statistik'] });
      setSelected(null);
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-slate-800 font-bold text-2xl">Dashboard Kepala Desa</h2>
          <p className="text-slate-500 text-sm mt-1">Ringkasan eksekutif & approval surat pengantar kependudukan</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Permohonan" value={statistik?.total_permohonan ?? 0} icon={<BarChart2 size={20} className="text-violet-600" />} color="bg-violet-50" />
          <StatCard label="Menunggu Approval" value={statistik?.per_status.diverifikasi_admin ?? 0} icon={<Clock size={20} className="text-amber-500" />} color="bg-amber-50" sub="Terverifikasi admin" />
          <StatCard label="Surat Disetujui" value={statistik?.per_status.disetujui_kades ?? 0} icon={<CheckCircle size={20} className="text-emerald-600" />} color="bg-emerald-50" />
          <StatCard label="Total Penduduk" value={statistik?.total_penduduk ?? 0} icon={<Users size={20} className="text-blue-600" />} color="bg-blue-50" />
        </div>

        {/* Per Jenis Surat */}
        {statistik?.per_jenis_surat && (
          <div className="grid sm:grid-cols-3 gap-4">
            {statistik.per_jenis_surat.map(j => (
              <div key={j.kode_surat} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">{j.kode_surat}</div>
                <div className="text-slate-800 font-bold text-xl">{j.jumlah}</div>
                <div className="text-slate-500 text-sm">{j.nama_surat}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {[
            { value: 'diverifikasi_admin', label: 'Menunggu Approval' },
            { value: 'disetujui_kades', label: 'Telah Disetujui' },
            { value: 'ditolak_kades', label: 'Ditolak' },
            { value: '', label: 'Semua' },
          ].map(tab => (
            <button key={tab.value} onClick={() => { setStatusFilter(tab.value); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${statusFilter === tab.value
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        <DataTable<PermohonanSurat>
          columns={[
            { key: 'nomor_permohonan', label: 'No. Permohonan', render: v => <span className="font-mono text-xs text-slate-600">{String(v)}</span> },
            { key: 'nama_lengkap', label: 'Pemohon', render: (_, r) => (
              <div>
                <div className="font-medium text-slate-700 text-sm">{r.nama_lengkap}</div>
                <div className="text-slate-400 text-xs">{r.nik}</div>
              </div>
            )},
            { key: 'nama_surat', label: 'Jenis Surat' },
            { key: 'tanggal_pengajuan', label: 'Tanggal', render: v => <span className="text-xs text-slate-500">{formatDateTime(String(v))}</span> },
            { key: 'status', label: 'Status', render: (_, r) => <StatusBadge status={r.status} /> },
            { key: 'nomor_surat_resmi', label: 'No. Surat', render: v => v ? <span className="font-mono text-xs text-emerald-700 font-semibold">{String(v)}</span> : <span className="text-slate-300 text-xs">-</span> },
          ]}
          data={data?.data ?? []}
          pagination={data?.pagination}
          onPageChange={setPage}
          isLoading={isLoading}
          emptyMessage="Tidak ada permohonan."
          actions={(row) => (
            <div className="flex gap-2">
              <button onClick={() => setSelected(row)}
                className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-colors">
                <Eye size={13} /> {row.status === 'diverifikasi_admin' ? 'Tinjau' : 'Detail'}
              </button>
              {row.status === 'disetujui_kades' && (
                <a href={`${BACKEND_URL}/cetak/${row.id}`} target="_blank" rel="noreferrer"
                  className="text-xs bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-colors">
                  <FileText size={13} /> PDF
                </a>
              )}
            </div>
          )}
        />
      </div>

      {selected && (
        <ApprovalModal permohonan={selected} onClose={() => setSelected(null)}
          onAction={(aksi, alasan) => approveMutation.mutate({ id: selected.id, aksi, alasan })}
          isLoading={approveMutation.isPending} />
      )}
    </DashboardLayout>
  );
}
