import React from 'react';
import { type StatusPermohonan } from '@/types';
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/utils';
import { Clock, CheckCircle, XCircle, Shield } from 'lucide-react';

interface StatusBadgeProps {
  status: StatusPermohonan;
  className?: string;
}

const STATUS_ICONS: Record<StatusPermohonan, React.ReactNode> = {
  pending: <Clock size={12} />,
  diverifikasi_admin: <Shield size={12} />,
  ditolak_admin: <XCircle size={12} />,
  disetujui_kades: <CheckCircle size={12} />,
  ditolak_kades: <XCircle size={12} />,
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[status]} ${className}`}
    >
      {STATUS_ICONS[status]}
      {STATUS_LABELS[status]}
    </span>
  );
}
