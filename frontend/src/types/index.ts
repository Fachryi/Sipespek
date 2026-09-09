// ============================================================
// TypeScript Types & Interfaces — SIPESPEK
// ============================================================

export type Role = 'warga' | 'admin' | 'kades';

export type StatusPermohonan =
  | 'pending'
  | 'diverifikasi_admin'
  | 'ditolak_admin'
  | 'disetujui_kades'
  | 'ditolak_kades';

export interface User {
  id: number;
  nik: string | null;
  username: string;
  nama_lengkap: string;
  no_hp: string | null;
  alamat: string | null;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface JenisSurat {
  id: number;
  kode_surat: string;
  nama_surat: string;
  deskripsi: string;
  persyaratan: Array<{
    key: string;
    label: string;
    type: string;
  }>;
}

export interface BerkasPermohonan {
  id: number;
  permohonan_id: number;
  nama_persyaratan: string;
  original_filename: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
}

export interface PermohonanSurat {
  id: number;
  nomor_permohonan: string;
  user_id: number;
  jenis_surat_id: number;
  keperluan: string | null;
  tanggal_pengajuan: string;
  status: StatusPermohonan;
  catatan_admin: string | null;
  alasan_penolakan: string | null;
  nomor_surat_resmi: string | null;
  tanggal_persetujuan: string | null;
  // Joined fields
  nama_surat?: string;
  kode_surat?: string;
  nama_lengkap?: string;
  nik?: string;
  no_hp?: string;
  // Detail only
  berkas?: BerkasPermohonan[];
  tempat_lahir?: string;
  tanggal_lahir?: string;
  jenis_kelamin?: string;
  pekerjaan?: string;
  rt_rw?: string;
  dusun?: string;
  no_kk?: string;
  agama?: string;
  status_perkawinan?: string;
  alamat?: string;
}

export interface Penduduk {
  id: number;
  nik: string;
  no_kk: string;
  nama: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: 'L' | 'P';
  alamat: string;
  rt_rw: string;
  dusun: string;
  agama: string;
  status_perkawinan: string;
  pekerjaan: string;
  no_hp: string | null;
  created_at: string;
}

export interface Statistik {
  total_permohonan: number;
  permohonan_bulan_ini: number;
  total_penduduk: number;
  total_warga_terdaftar: number;
  per_status: {
    pending: number;
    diverifikasi_admin: number;
    ditolak_admin: number;
    disetujui_kades: number;
    ditolak_kades: number;
  };
  per_jenis_surat: Array<{
    nama_surat: string;
    kode_surat: string;
    jumlah: number;
  }>;
}

export interface Pagination {
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface ApiResponse<T = unknown> {
  status: boolean;
  message: string;
  data: T;
}

export interface PaginatedData<T> {
  data: T[];
  pagination: Pagination;
}
