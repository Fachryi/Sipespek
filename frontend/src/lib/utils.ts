import { type StatusPermohonan } from '@/types';

export const STATUS_LABELS: Record<StatusPermohonan, string> = {
  pending: 'Menunggu Verifikasi',
  diverifikasi_admin: 'Terverifikasi Admin',
  ditolak_admin: 'Ditolak Admin',
  disetujui_kades: 'Disetujui Kades',
  ditolak_kades: 'Ditolak Kades',
};

export const STATUS_COLORS: Record<StatusPermohonan, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  diverifikasi_admin: 'bg-blue-100 text-blue-800 border-blue-200',
  ditolak_admin: 'bg-red-100 text-red-800 border-red-200',
  disetujui_kades: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  ditolak_kades: 'bg-red-100 text-red-800 border-red-200',
};

export const KODE_SURAT_LABELS: Record<string, string> = {
  KTP: 'Surat Pengantar KTP',
  KK: 'Surat Pengantar KK',
  DOMISILI: 'Surat Keterangan Domisili',
};

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '/api';
