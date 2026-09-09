import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, Users, CheckCircle, XCircle, Clock, Eye, X, Loader2, FileText } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DataTable } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import api from '@/lib/api';
import { formatDateTime, BACKEND_URL } from '@/lib/utils';
import { type ApiResponse, type PermohonanSurat, type PaginatedData, type Statistik } from '@/types';

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm">
      <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>{icon}</div>
      <div>
        <div className="text-2xl font-bold text-slate-800">{value}</div>
        <div className="text-slate-500 text-xs">{label}</div>
      </div>
    </div>
  );
}

interface DetailModalProps {
  permohonan: PermohonanSurat;
  onClose: () => void;
  onAction: (aksi: 'setujui' | 'tolak', alasan?: string) => void;
  isLoading: boolean;
}

function DetailModal({ permohonan, onClose, onAction, isLoading }: DetailModalProps) {
  const [mode, setMode] = useState<'view' | 'tolak'>('view');
  const [alasan, setAlasan] = useState('');
  const [catatan, setCatatan] = useState('');

  const { data: detail } = useQuery({
    queryKey: ['permohonan-detail', permohonan.id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PermohonanSurat>>(`/permohonan/${permohonan.id}`);
      return res.data.data;
    },
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Detail Permohonan</h3>
            <p className="text-slate-400 text-xs font-mono">{permohonan.nomor_permohonan}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={permohonan.status} />
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"><X size={20} /></button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Data Pemohon */}
          <div>
            <h4 className="text-slate-600 font-semibold text-sm uppercase tracking-wider mb-3">Data Pemohon</h4>
            <div className="bg-slate-50 rounded-xl p-4 grid sm:grid-cols-2 gap-3 text-sm">
              {[
                ['Nama', detail?.nama_lengkap],
                ['NIK', detail?.nik],
                ['No. KK', detail?.no_kk],
                ['No. HP', detail?.no_hp],
                ['Jenis Surat', detail?.nama_surat],
                ['Keperluan', detail?.keperluan ?? '-'],
                ['Tgl Pengajuan', formatDateTime(detail?.tanggal_pengajuan)],
              ].map(([k, v]) => (
                <div key={k as string}>
                  <span className="text-slate-400 text-xs">{k as string}</span>
                  <div className="text-slate-700 font-medium">{v as string ?? '-'}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Berkas */}
          {detail?.berkas && detail.berkas.length > 0 && (
            <div>
              <h4 className="text-slate-600 font-semibold text-sm uppercase tracking-wider mb-3">Berkas Persyaratan</h4>
              <div className="space-y-2">
                {detail.berkas.map((b) => (
                  <div key={b.id} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                    <FileText size={16} className="text-slate-400" />
                    <div className="flex-1 min-w-0">
                      <div className="text-slate-700 font-medium text-sm">{b.nama_persyaratan}</div>
                      <div className="text-slate-400 text-xs truncate">{b.original_filename}</div>
                    </div>
                    <a
                      href={`${BACKEND_URL}/${b.file_path}`}
                      target="_blank" rel="noreferrer"
                      className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1"
                    >
                      <Eye size={12} /> Lihat
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions (hanya jika status pending) */}
          {permohonan.status === 'pending' && (
            <div className="border-t border-slate-100 pt-4">
              {mode === 'view' ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => onAction('setujui')}
                    disabled={isLoading}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                  >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                    Verifikasi & Teruskan ke Kades
                  </button>
                  <button
                    onClick={() => setMode('tolak')}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors border border-red-200"
                  >
                    <XCircle size={16} /> Tolak Berkas
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-slate-600 block mb-1.5">Alasan Penolakan <span className="text-red-500">*</span></label>
                    <textarea
                      value={alasan} onChange={e => setAlasan(e.target.value)} rows={3}
                      placeholder="Jelaskan alasan penolakan berkas..."
                      className="w-full border border-red-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setMode('view')} className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">Batal</button>
                    <button
                      onClick={() => alasan.trim() && onAction('tolak', alasan)}
                      disabled={!alasan.trim() || isLoading}
                      className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {isLoading && <Loader2 size={14} className="animate-spin" />} Kirim Penolakan
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

export default function AdminDashboard() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedPermohonan, setSelectedPermohonan] = useState<PermohonanSurat | null>(null);
  const queryClient = useQueryClient();

  const { data: statistik } = useQuery({
    queryKey: ['statistik'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Statistik>>('/laporan/statistik');
      return res.data.data;
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['all-permohonan', page, statusFilter, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page) });
      if (statusFilter) params.append('status', statusFilter);
      if (search) params.append('search', search);
      const res = await api.get<ApiResponse<PaginatedData<PermohonanSurat>>>(`/permohonan/all?${params}`);
      return res.data.data;
    },
  });

  const verifikasiMutation = useMutation({
    mutationFn: async ({ id, aksi, alasan }: { id: number; aksi: string; alasan?: string }) => {
      await api.put(`/permohonan/${id}/verifikasi`, { aksi, alasan });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-permohonan'] });
      queryClient.invalidateQueries({ queryKey: ['statistik'] });
      setSelectedPermohonan(null);
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-slate-800 font-bold text-2xl">Dashboard Admin Desa</h2>
          <p className="text-slate-500 text-sm mt-1">Manajemen dan verifikasi permohonan surat kependudukan</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Permohonan" value={statistik?.total_permohonan ?? 0} icon={<ClipboardList size={20} className="text-violet-600" />} color="bg-violet-50" />
          <StatCard label="Menunggu Verifikasi" value={statistik?.per_status.pending ?? 0} icon={<Clock size={20} className="text-amber-500" />} color="bg-amber-50" />
          <StatCard label="Telah Disetujui" value={statistik?.per_status.disetujui_kades ?? 0} icon={<CheckCircle size={20} className="text-emerald-600" />} color="bg-emerald-50" />
          <StatCard label="Total Penduduk" value={statistik?.total_penduduk ?? 0} icon={<Users size={20} className="text-blue-600" />} color="bg-blue-50" />
        </div>

        {/* Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Cari nama, NIK, no. permohonan..."
            className="text-sm border border-slate-200 rounded-xl px-3 py-2 text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-white min-w-[220px]"
          />
          <select
            value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="text-sm border border-slate-200 rounded-xl px-3 py-2 text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-white"
          >
            <option value="">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="diverifikasi_admin">Terverifikasi Admin</option>
            <option value="disetujui_kades">Disetujui Kades</option>
            <option value="ditolak_admin">Ditolak Admin</option>
            <option value="ditolak_kades">Ditolak Kades</option>
          </select>
        </div>

        {/* Table */}
        <DataTable<PermohonanSurat>
          columns={[
            { key: 'nomor_permohonan', label: 'No. Permohonan', render: v => <span className="font-mono text-xs text-slate-600">{String(v)}</span> },
            { key: 'nama_lengkap', label: 'Pemohon', render: (_, r) => (
              <div>
                <div className="font-medium text-slate-700 text-sm">{r.nama_lengkap}</div>
                <div className="text-slate-400 text-xs font-mono">{r.nik}</div>
              </div>
            )},
            { key: 'nama_surat', label: 'Jenis Surat' },
            { key: 'tanggal_pengajuan', label: 'Tanggal', render: v => <span className="text-xs text-slate-500">{formatDateTime(String(v))}</span> },
            { key: 'status', label: 'Status', render: (_, r) => <StatusBadge status={r.status} /> },
          ]}
          data={data?.data ?? []}
          pagination={data?.pagination}
          onPageChange={setPage}
          isLoading={isLoading}
          emptyMessage="Tidak ada permohonan ditemukan."
          actions={(row) => (
            <button
              onClick={() => setSelectedPermohonan(row)}
              className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1"
            >
              <Eye size={13} /> Detail
            </button>
          )}
        />
      </div>

      {/* Detail Modal */}
      {selectedPermohonan && (
        <DetailModal
          permohonan={selectedPermohonan}
          onClose={() => setSelectedPermohonan(null)}
          onAction={(aksi, alasan) => verifikasiMutation.mutate({ id: selectedPermohonan.id, aksi, alasan })}
          isLoading={verifikasiMutation.isPending}
        />
      )}
    </DashboardLayout>
  );
}
