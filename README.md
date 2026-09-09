# SIPESPEK - Desa Wangkar Weli

**Sistem Informasi Pelayanan Surat Pengantar Kependudukan Berbasis Website**

Aplikasi pelayanan surat pengantar kependudukan digital terintegrasi untuk Desa Wangkar Weli, Manggarai Timur, Nusa Tenggara Timur.

---

## 📌 Fitur Utama

- **Pelayanan 3 Jenis Surat**:
  - Surat Pengantar KTP
  - Surat Pengantar Kartu Keluarga (KK)
  - Surat Keterangan Domisili
- **Tracking Permohonan**: Warga dapat melacak status permohonan secara real-time via kode unik / NIK.
- **Admin Dashboard**: Manajemen data penduduk, verifikasi berkas permohonan, dan monitoring status.
- **Kades Approval**: Tanda tangan / persetujuan surat secara digital dan generate dokumen surat (PDF) dengan QR Code verifikasi.
- **Laporan & Statistik**: Rekapitulasi permohonan surat per periode dengan grafik interaktif.

---

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4 + Lucide Icons + Recharts
- **Backend**: Native PHP (OOP Modular, PDO MySQL, RESTful API JSON) + Dompdf
- **Database**: MySQL (MariaDB) via XAMPP

---

## 📁 Struktur Direktori

```text
sipespek/
├── backend/            # REST API (PHP Native)
│   ├── config/         # Konfigurasi Database & CORS
│   ├── controllers/    # Handler endpoint API
│   ├── helpers/        # PDF Generator & Response Helper
│   ├── middleware/     # Auth & Role Middleware
│   ├── uploads/        # Direktori berkas persyaratan warga
│   └── index.php       # Entry router API
├── database/
│   └── schema.sql      # Skema database DDL & data seed
└── frontend/           # Aplikasi React Vite
    ├── src/
    │   ├── components/ # Komponen UI & Layout
    │   ├── context/    # Auth context & state
    │   ├── pages/      # Halaman Warga, Admin, & Kades
    │   ├── services/   # Axios API client
    │   └── types/      # TypeScript interfaces
    └── vite.config.ts
```

---

## 🚀 Panduan Instalasi & Menjalankan

### 1. Prasyarat
- XAMPP (Apache & MySQL)
- Node.js (v18+) & npm
- Composer (untuk dependensi backend)

### 2. Setup Database
1. Buka XAMPP Control Panel dan nyalakan **Apache** & **MySQL**.
2. Buat database baru bernama `sipespek_db` di phpMyAdmin (`http://localhost/phpmyadmin`).
3. Import file `database/schema.sql` ke dalam database `sipespek_db`.

### 3. Setup Backend
1. Pastikan folder project berada di `htdocs/sipespek`.
2. Masuk ke folder backend:
   ```bash
   cd backend
   composer install
   ```
3. Backend REST API dapat diakses di: `http://localhost/sipespek/backend/`

### 4. Setup Frontend
1. Buka terminal baru dan masuk ke folder frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. Buka browser di `http://localhost:5173`.

---

## 🔑 Akun Default (Demo)

| Role | Username | Password |
|---|---|---|
| **Administrator** | `admin` | `admin123` |
| **Kepala Desa (Kades)** | `kades` | `kades123` |
| **Warga** | Daftar mandiri melalui menu Register |

---

## 📄 Lisensi
Sistem ini dikembangkan khusus untuk Kantor Desa Wangkar Weli.
