import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, X, Loader2, Search } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DataTable } from '@/components/DataTable';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { type ApiResponse, type Penduduk, type PaginatedData } from '@/types';

const EMPTY_FORM: Omit<Penduduk, 'id' | 'created_at'> = {
  nik: '', no_kk: '', nama: '', tempat_lahir: '', tanggal_lahir: '',
  jenis_kelamin: 'L', alamat: '', rt_rw: '', dusun: '', agama: '',
  status_perkawinan: '', pekerjaan: '', no_hp: '',
};

type PendudukForm = Omit<Penduduk, 'id' | 'created_at'>;

interface FormModalProps {
  initial?: Penduduk | null;
  onClose: () => void;
  onSave: (form: PendudukForm) => void;
  isLoading: boolean;
  error?: string;
}

function FormModal({ initial, onClose, onSave, isLoading, error }: FormModalProps) {
  const [form, setForm] = useState<PendudukForm>(initial ? { ...initial } : { ...EMPTY_FORM });
  const update = (k: keyof PendudukForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const Field = ({ id, label, children }: { id: string; label: string; children: React.ReactNode }) => (
    <div>
      <label className="text-slate-600 text-sm font-medium block mb-1">{label}</label>
      {children}
    </div>
  );

  const Input = ({ id, kkey, placeholder, maxLength, type = 'text' }: { id: string; kkey: keyof PendudukForm; placeholder?: string; maxLength?: number; type?: string }) => (
    <input
      id={id} type={type} value={form[kkey] as string} onChange={update(kkey)}
      placeholder={placeholder} maxLength={maxLength}
      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
    />
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <h3 className="font-bold text-slate-800">{initial ? 'Edit Data Penduduk' : 'Tambah Data Penduduk'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">{error}</div>}
          <div className="grid sm:grid-cols-2 gap-4">
            <Field id="nik" label="NIK *"><Input id="nik" kkey="nik" placeholder="16 digit NIK" maxLength={16} /></Field>
            <Field id="no_kk" label="No. KK *"><Input id="no_kk" kkey="no_kk" placeholder="No. Kartu Keluarga" maxLength={16} /></Field>
            <Field id="nama" label="Nama Lengkap *"><Input id="nama" kkey="nama" placeholder="Nama sesuai KTP" /></Field>
            <Field id="no_hp" label="No. HP"><Input id="no_hp" kkey="no_hp" placeholder="08xxxxxxxxxx" /></Field>
            <Field id="tempat_lahir" label="Tempat Lahir *"><Input id="tempat_lahir" kkey="tempat_lahir" placeholder="Kota kelahiran" /></Field>
            <Field id="tanggal_lahir" label="Tanggal Lahir *"><Input id="tanggal_lahir" kkey="tanggal_lahir" type="date" /></Field>
            <Field id="jenis_kelamin" label="Jenis Kelamin *">
              <select id="jenis_kelamin" value={form.jenis_kelamin} onChange={update('jenis_kelamin')}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
                <option value="L">Laki-laki</option><option value="P">Perempuan</option>
              </select>
            </Field>
            <Field id="agama" label="Agama *">
              <select id="agama" value={form.agama} onChange={update('agama')}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
                <option value="">-- Pilih --</option>
                {['Islam','Kristen','Katolik','Hindu','Buddha','Konghucu'].map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </Field>
            <Field id="status_perkawinan" label="Status Perkawinan *">
              <select id="status_perkawinan" value={form.status_perkawinan} onChange={update('status_perkawinan')}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
                <option value="">-- Pilih --</option>
                {['Belum Kawin','Kawin','Cerai Hidup','Cerai Mati'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field id="pekerjaan" label="Pekerjaan *"><Input id="pekerjaan" kkey="pekerjaan" placeholder="Pekerjaan" /></Field>
            <Field id="rt_rw" label="RT/RW *"><Input id="rt_rw" kkey="rt_rw" placeholder="001/001" /></Field>
            <Field id="dusun" label="Dusun *"><Input id="dusun" kkey="dusun" placeholder="Nama dusun" /></Field>
          </div>
          <Field id="alamat" label="Alamat Lengkap *">
            <textarea value={form.alamat} onChange={update('alamat')} rows={2} placeholder="Alamat lengkap"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none" />
          </Field>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">Batal</button>
            <button
              onClick={() => onSave(form)} disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading && <Loader2 size={14} className="animate-spin" />} {initial ? 'Simpan Perubahan' : 'Tambahkan Data'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PendudukPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [selected, setSelected] = useState<Penduduk | null>(null);
  const [formError, setFormError] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['penduduk', page, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), search });
      const res = await api.get<ApiResponse<PaginatedData<Penduduk>>>(`/penduduk?${params}`);
      return res.data.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (form: PendudukForm) => {
      if (modal === 'edit' && selected) await api.put(`/penduduk/${selected.id}`, form);
      else await api.post('/penduduk', form);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['penduduk'] }); setModal(null); setSelected(null); setFormError(''); },
    onError: (err: unknown) => { const e = err as { response?: { data?: { message?: string } } }; setFormError(e.response?.data?.message ?? 'Gagal menyimpan data.'); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => await api.delete(`/penduduk/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['penduduk'] }); setDeleteId(null); },
  });

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-slate-800 font-bold text-2xl">Data Kependudukan</h2>
            <p className="text-slate-500 text-sm mt-1">Manajemen data master penduduk Desa Wangkar Weli</p>
          </div>
          <button
            onClick={() => { setSelected(null); setFormError(''); setModal('add'); }}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center gap-2"
          >
            <Plus size={16} /> Tambah Penduduk
          </button>
        </div>

        <div className="relative max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Cari NIK atau nama..."
            className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-white w-full" />
        </div>

        <DataTable<Penduduk>
          columns={[
            { key: 'nik', label: 'NIK', render: v => <span className="font-mono text-xs text-slate-600">{String(v)}</span> },
            { key: 'nama', label: 'Nama Lengkap', render: v => <span className="font-medium text-slate-700">{String(v)}</span> },
            { key: 'jenis_kelamin', label: 'JK', render: (v) => <span>{v === 'L' ? '♂ L' : '♀ P'}</span> },
            { key: 'tempat_lahir', label: 'TTL', render: (v, r) => <span className="text-xs">{String(v)}, {formatDate(r.tanggal_lahir)}</span> },
            { key: 'dusun', label: 'Dusun' },
            { key: 'pekerjaan', label: 'Pekerjaan' },
            { key: 'no_hp', label: 'No. HP', render: (v) => <span>{v != null ? String(v) : '-'}</span> },
          ]}
          data={data?.data ?? []}
          pagination={data?.pagination}
          onPageChange={setPage}
          isLoading={isLoading}
          emptyMessage="Tidak ada data penduduk."
          actions={(row) => (
            <>
              <button onClick={() => { setSelected(row); setFormError(''); setModal('edit'); }}
                className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-colors">
                <Edit2 size={12} /> Edit
              </button>
              <button onClick={() => setDeleteId(row.id)}
                className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-colors">
                <Trash2 size={12} /> Hapus
              </button>
            </>
          )}
        />
      </div>

      {(modal === 'add' || modal === 'edit') && (
        <FormModal initial={selected} onClose={() => { setModal(null); setFormError(''); }}
          onSave={saveMutation.mutate} isLoading={saveMutation.isPending} error={formError} />
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-slate-800 mb-2">Hapus Data Penduduk?</h3>
            <p className="text-slate-500 text-sm mb-6">Tindakan ini tidak dapat dibatalkan. Data penduduk akan dihapus permanen.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">Batal</button>
              <button onClick={() => deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                {deleteMutation.isPending && <Loader2 size={14} className="animate-spin" />} Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
