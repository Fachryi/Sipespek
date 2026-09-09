import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Download, Filter } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { type ApiResponse } from '@/types';

interface RekapData {
  filter: { tanggal_mulai: string; tanggal_akhir: string };
  summary: { total: number; disetujui: number; ditolak: number; pending: number; dalam_proses: number };
  per_jenis: Array<{ kode: string; nama: string; jumlah: number; disetujui: number }>;
  data: Array<{ id: number; nomor_permohonan: string; nama_lengkap: string; nik: string; nama_surat: string; kode_surat: string; status: string; tanggal_pengajuan: string; nomor_surat_resmi: string | null }>;
}

const COLORS = ['#10b981', '#6366f1', '#f59e0b'];

export default function LaporanPage() {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

  const [mulai, setMulai] = useState(firstDay);
  const [akhir, setAkhir] = useState(lastDay);
  const [applied, setApplied] = useState({ mulai: firstDay, akhir: lastDay });

  const { data: rekap, isLoading } = useQuery({
    queryKey: ['rekap', applied],
    queryFn: async () => {
      const params = new URLSearchParams({ tanggal_mulai: applied.mulai, tanggal_akhir: applied.akhir });
      const res = await api.get<ApiResponse<RekapData>>(`/laporan/rekap?${params}`);
      return res.data.data;
    },
  });

  const { data: chartData } = useQuery({
    queryKey: ['chart'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Array<{ bulan: string; total: number; disetujui: number; ditolak: number }>>>('/laporan/chart');
      return res.data.data;
    },
  });

  const pieData = rekap ? [
    { name: 'Disetujui', value: rekap.summary.disetujui },
    { name: 'Ditolak', value: rekap.summary.ditolak },
    { name: 'Pending/Proses', value: rekap.summary.pending + rekap.summary.dalam_proses },
  ].filter(d => d.value > 0) : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-slate-800 font-bold text-2xl">Laporan Pelayanan</h2>
            <p className="text-slate-500 text-sm mt-1">Rekapitulasi permohonan surat kependudukan</p>
          </div>
        </div>

        {/* Filter Tanggal */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-slate-700 font-semibold mb-4 flex items-center gap-2"><Filter size={16} /> Filter Periode</h3>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="text-slate-500 text-xs font-medium block mb-1">Dari Tanggal</label>
              <input type="date" value={mulai} onChange={e => setMulai(e.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div>
              <label className="text-slate-500 text-xs font-medium block mb-1">Sampai Tanggal</label>
              <input type="date" value={akhir} onChange={e => setAkhir(e.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <button onClick={() => setApplied({ mulai, akhir })}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:shadow-md hover:shadow-emerald-500/30 transition-all flex items-center gap-2">
              <Calendar size={15} /> Tampilkan
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />)}</div>
        ) : rekap ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: 'Total', value: rekap.summary.total, color: 'bg-slate-100 text-slate-700' },
                { label: 'Disetujui', value: rekap.summary.disetujui, color: 'bg-emerald-100 text-emerald-700' },
                { label: 'Ditolak', value: rekap.summary.ditolak, color: 'bg-red-100 text-red-700' },
                { label: 'Dalam Proses', value: rekap.summary.dalam_proses, color: 'bg-blue-100 text-blue-700' },
                { label: 'Pending', value: rekap.summary.pending, color: 'bg-amber-100 text-amber-700' },
              ].map(s => (
                <div key={s.label} className={`${s.color} rounded-2xl p-4 text-center`}>
                  <div className="text-2xl font-bold">{s.value}</div>
                  <div className="text-sm font-medium opacity-80">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-3 gap-5">
              {/* Bar Chart — Tren Bulanan */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h4 className="text-slate-700 font-semibold mb-4">Tren Permohonan (12 Bulan Terakhir)</h4>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData ?? []} margin={{ top: 5, right: 0, left: -30, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="bulan" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid #e2e8f0' }} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="total" name="Total" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="disetujui" name="Disetujui" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="ditolak" name="Ditolak" fill="#f87171" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart — Per Status */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h4 className="text-slate-700 font-semibold mb-4">Distribusi Status</h4>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(props) => `${String(props.name ?? '')} ${(((props.percent ?? 0) as number) * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <div className="h-40 flex items-center justify-center text-slate-400 text-sm">Tidak ada data</div>}
              </div>
            </div>

            {/* Per Jenis Surat */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h4 className="text-slate-700 font-semibold mb-4">Rekap Per Jenis Surat</h4>
              <div className="grid sm:grid-cols-3 gap-4">
                {rekap.per_jenis.map(j => (
                  <div key={j.kode} className="bg-slate-50 rounded-xl p-4">
                    <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{j.kode}</div>
                    <div className="text-slate-800 font-bold text-2xl mt-1">{j.jumlah}</div>
                    <div className="text-slate-500 text-xs">{j.nama}</div>
                    <div className="text-emerald-600 text-xs mt-1">✓ {j.disetujui} disetujui</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h4 className="text-slate-700 font-semibold">Detail Permohonan ({rekap.data.length} data)</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {['No', 'No. Permohonan', 'Nama Pemohon', 'Jenis Surat', 'Tgl Pengajuan', 'Status', 'No. Surat'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {rekap.data.slice(0, 20).map((row, i) => (
                      <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 text-slate-400 text-xs">{i + 1}</td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-600">{row.nomor_permohonan}</td>
                        <td className="px-4 py-3 text-slate-700 font-medium">{row.nama_lengkap}</td>
                        <td className="px-4 py-3 text-slate-600">{row.kode_surat}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{formatDate(row.tanggal_pengajuan)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            row.status === 'disetujui_kades' ? 'bg-emerald-100 text-emerald-700' :
                            row.status.includes('ditolak') ? 'bg-red-100 text-red-700' :
                            row.status === 'diverifikasi_admin' ? 'bg-blue-100 text-blue-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>{row.status.replace('_', ' ')}</span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-emerald-700">{row.nomor_surat_resmi ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
