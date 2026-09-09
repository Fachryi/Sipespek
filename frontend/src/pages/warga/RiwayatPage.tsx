import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { FileText, Download, Eye } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DataTable } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import api from '@/lib/api';
import { formatDateTime, BACKEND_URL } from '@/lib/utils';
import { type ApiResponse, type PermohonanSurat, type PaginatedData } from '@/types';

export default function RiwayatPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const location = useLocation();
  const showSuccess = (location.state as { success?: boolean })?.success;

  const { data, isLoading } = useQuery({
    queryKey: ['my-permohonan', page, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page) });
      if (statusFilter) params.append('status', statusFilter);
      const res = await api.get<ApiResponse<PaginatedData<PermohonanSurat>>>(`/permohonan?${params}`);
      return res.data.data;
    },
  });

  const statusOptions = [
    { value: '', label: 'Semua Status' },
    { value: 'pending', label: 'Menunggu Verifikasi' },
    { value: 'diverifikasi_admin', label: 'Terverifikasi Admin' },
    { value: 'disetujui_kades', label: 'Disetujui Kades' },
    { value: 'ditolak_admin', label: 'Ditolak Admin' },
    { value: 'ditolak_kades', label: 'Ditolak Kades' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div>
          <h2 className="text-slate-800 font-bold text-2xl">Riwayat Permohonan</h2>
          <p className="text-slate-500 text-sm mt-1">Pantau status semua permohonan surat Anda</p>
        </div>

        {showSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-700 text-sm flex items-center gap-2">
            ✅ Permohonan berhasil dikirim! Admin desa akan segera memverifikasi berkas Anda.
          </div>
        )}

        {/* Filter */}
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="text-sm border border-slate-200 rounded-xl px-3 py-2 text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-white"
          >
            {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <DataTable<PermohonanSurat>
          columns={[
            { key: 'nomor_permohonan', label: 'No. Permohonan', render: (v) => <span className="font-mono text-xs text-slate-600">{String(v)}</span> },
            { key: 'nama_surat', label: 'Jenis Surat', render: (v) => <span className="font-medium text-slate-700">{String(v)}</span> },
            { key: 'tanggal_pengajuan', label: 'Tanggal Pengajuan', render: (v) => <span className="text-xs text-slate-500">{formatDateTime(String(v))}</span> },
            {
              key: 'status', label: 'Status',
              render: (_, row) => (
                <div>
                  <StatusBadge status={row.status} />
                  {row.alasan_penolakan && (
                    <div className="text-red-500 text-xs mt-1 max-w-xs truncate" title={row.alasan_penolakan}>
                      💬 {row.alasan_penolakan}
                    </div>
                  )}
                </div>
              )
            },
            {
              key: 'nomor_surat_resmi', label: 'No. Surat Resmi',
              render: (v) => v ? <span className="font-mono text-xs text-emerald-700 font-semibold">{String(v)}</span> : <span className="text-slate-300 text-xs">-</span>
            },
          ]}
          data={data?.data ?? []}
          pagination={data?.pagination}
          onPageChange={setPage}
          isLoading={isLoading}
          emptyMessage="Belum ada permohonan surat."
          actions={(row) => (
            <>
              {row.status === 'disetujui_kades' && (
                <a
                  href={`${BACKEND_URL}/cetak/${row.id}`}
                  target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-2.5 py-1.5 rounded-lg font-medium transition-colors"
                >
                  <Download size={13} /> Unduh PDF
                </a>
              )}
            </>
          )}
        />
      </div>
    </DashboardLayout>
  );
}
