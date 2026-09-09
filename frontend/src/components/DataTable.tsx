import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from 'lucide-react';
import { type Pagination } from '@/types';

interface Column<T> {
  key: string;
  label: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T extends object> {
  columns: Column<T>[];
  data: T[];
  pagination?: Pagination;
  onPageChange?: (page: number) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  actions?: (row: T) => React.ReactNode;
}

export function DataTable<T extends object>({
  columns,
  data,
  pagination,
  onPageChange,
  searchable,
  searchPlaceholder = 'Cari...',
  onSearch,
  isLoading,
  emptyMessage = 'Tidak ada data ditemukan.',
  actions,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Search Bar */}
      {searchable && (
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all bg-slate-50"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider ${col.className ?? ''}`}
                >
                  {col.label}
                </th>
              ))}
              {actions && (
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Aksi
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                    </td>
                  ))}
                  {actions && <td className="px-4 py-3"><div className="h-4 bg-slate-100 rounded w-16 ml-auto"></div></td>}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="text-center py-12 text-slate-400"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-3xl">📂</div>
                    <span>{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-50/80 transition-colors duration-150"
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3 text-slate-700 ${col.className ?? ''}`}>
                      {col.render
                        ? col.render((row as Record<string, unknown>)[col.key], row)
                        : String((row as Record<string, unknown>)[col.key] ?? '-')}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {actions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Menampilkan {((pagination.page - 1) * pagination.per_page) + 1}–
            {Math.min(pagination.page * pagination.per_page, pagination.total)} dari {pagination.total} data
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange?.(1)}
              disabled={pagination.page === 1}
              className="p-1.5 rounded-lg disabled:opacity-30 hover:bg-slate-100 transition-colors text-slate-600"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-1.5 rounded-lg disabled:opacity-30 hover:bg-slate-100 transition-colors text-slate-600"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 py-1.5 text-xs font-medium text-slate-700">
              {pagination.page} / {pagination.pages}
            </span>
            <button
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="p-1.5 rounded-lg disabled:opacity-30 hover:bg-slate-100 transition-colors text-slate-600"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => onPageChange?.(pagination.pages)}
              disabled={pagination.page === pagination.pages}
              className="p-1.5 rounded-lg disabled:opacity-30 hover:bg-slate-100 transition-colors text-slate-600"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
