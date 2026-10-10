import React from 'react';
import { type StatusPermohonan } from '@/types';
import { STATUS_LABELS } from '@/lib/utils';
import { Clock, CheckCircle, XCircle, Shield } from 'lucide-react';

interface StatusBadgeProps {
  status: StatusPermohonan;
  className?: string;
}

// Maps to CSS classes defined in index.css (DESIGN.md badge spec)
const STATUS_BADGE_CLASS: Record<StatusPermohonan, string> = {
  pending:             'badge-warning',
  diverifikasi_admin:  'badge-info',
  ditolak_admin:       'badge-error',
  disetujui_kades:     'badge-success',
  ditolak_kades:       'badge-error',
};

const STATUS_ICONS: Record<StatusPermohonan, React.ReactNode> = {
  pending:             <Clock size={11} />,
  diverifikasi_admin:  <Shield size={11} />,
  ditolak_admin:       <XCircle size={11} />,
  disetujui_kades:     <CheckCircle size={11} />,
  ditolak_kades:       <XCircle size={11} />,
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  return (
    <span className={`${STATUS_BADGE_CLASS[status]} ${className}`}>
      {STATUS_ICONS[status]}
      {STATUS_LABELS[status]}
    </span>
  );
}
