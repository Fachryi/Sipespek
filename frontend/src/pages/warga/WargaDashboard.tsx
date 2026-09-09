import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle, XCircle, Plus, ArrowRight } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { formatDateTime, BACKEND_URL } from '@/lib/utils';
import { type ApiResponse, type PermohonanSurat, type PaginatedData } from '@/types';

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number | string; color: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm card-hover`}>
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-800">{value}</div>
        <div className="text-slate-500 text-sm">{label}</div>
      </div>
    </div>
  );
}

export default function WargaDashboard() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['my-permohonan', page],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PaginatedData<PermohonanSurat>>>(`/permohonan?page=${page}`);
      return res.data.data;
    },
  });

  const permohonan = data?.data ?? [];
  const pagination = data?.pagination;

  const stats = {
    total: pagination?.total ?? 0,
    pending: permohonan.filter(p => p.status === 'pending').length,
    disetujui: permohonan.filter(p => p.status === 'disetujui_kades').length,
    ditolak: permohonan.filter(p => ['ditolak_admin', 'ditolak_kades'].includes(p.status)).length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Greeting */}
        <div>
          <h2 className="text-slate-800 font-bold text-2xl">
            Selamat Datang, {user?.nama_lengkap?.split(' ')[0]} 👋
          </h2>
          <p className="text-slate-500 text-sm mt-1">Kelola permohonan surat kependudukan Anda di sini</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<FileText size={22} className="text-violet-600" />} label="Total Permohonan" value={stats.total} color="bg-violet-50" />
          <StatCard icon={<Clock size={22} className="text-amber-500" />} label="Sedang Diproses" value={stats.pending} color="bg-amber-50" />
          <StatCard icon={<CheckCircle size={22} className="text-emerald-600" />} label="Disetujui" value={stats.disetujui} color="bg-emerald-50" />
          <StatCard icon={<XCircle size={22} className="text-red-500" />} label="Ditolak" value={stats.ditolak} color="bg-red-50" />
        </div>

        {/* Quick Action */}
        <Link
          to="/warga/ajukan"
          className="flex items-center justify-between bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl p-5 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 card-hover"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Plus size={24} />
            </div>
            <div>
              <div className="font-bold text-lg">Ajukan Surat Baru</div>
              <div className="text-emerald-100 text-sm">KTP · KK · Domisili</div>
            </div>
          </div>
          <ArrowRight size={22} />
        </Link>

        {/* Riwayat Terbaru */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-slate-800 font-semibold">Riwayat Permohonan Terbaru</h3>
            <Link to="/warga/riwayat" className="text-emerald-600 text-sm hover:text-emerald-700 font-medium flex items-center gap-1">
              Lihat Semua <ArrowRight size={14} />
            </Link>
          </div>

          {isLoading ? (
            <div className="p-5 space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
          ) : permohonan.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <FileText size={40} className="mx-auto mb-3 opacity-30" />
              <p>Belum ada permohonan. <Link to="/warga/ajukan" className="text-emerald-600 hover:underline">Ajukan sekarang</Link></p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {permohonan.slice(0, 5).map((item) => (
                <div key={item.id} className="px-5 py-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText size={18} className="text-slate-500" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-slate-800 font-medium text-sm truncate">{item.nama_surat}</div>
                      <div className="text-slate-400 text-xs mt-0.5">
                        {item.nomor_permohonan} · {formatDateTime(item.tanggal_pengajuan)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    <StatusBadge status={item.status} />
                    {item.status === 'disetujui_kades' && (
                      <a
                        href={`${BACKEND_URL}/cetak/${item.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1"
                      >
                        <FileText size={12} /> PDF
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
