-- ============================================================
-- SIPESPEK - Sistem Informasi Pelayanan Surat Pengantar
-- Kependudukan Desa Wangkar Weli
-- Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS sipespek_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sipespek_db;

-- ============================================================
-- Tabel Users (Autentikasi & Role)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nik VARCHAR(16) UNIQUE NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nama_lengkap VARCHAR(100) NOT NULL,
    no_hp VARCHAR(15) NULL,
    alamat TEXT NULL,
    role ENUM('warga', 'admin', 'kades') NOT NULL DEFAULT 'warga',
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- Tabel Penduduk (Data Master Kependudukan)
-- ============================================================
CREATE TABLE IF NOT EXISTS penduduk (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nik VARCHAR(16) UNIQUE NOT NULL,
    no_kk VARCHAR(16) NOT NULL,
    nama VARCHAR(100) NOT NULL,
    tempat_lahir VARCHAR(50) NOT NULL,
    tanggal_lahir DATE NOT NULL,
    jenis_kelamin ENUM('L', 'P') NOT NULL,
    alamat TEXT NOT NULL,
    rt_rw VARCHAR(10) NOT NULL,
    dusun VARCHAR(50) NOT NULL,
    agama VARCHAR(20) NOT NULL,
    status_perkawinan VARCHAR(20) NOT NULL,
    pekerjaan VARCHAR(50) NOT NULL,
    no_hp VARCHAR(15) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- Tabel Jenis Surat
-- ============================================================
CREATE TABLE IF NOT EXISTS jenis_surat (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kode_surat VARCHAR(20) NOT NULL,
    nama_surat VARCHAR(100) NOT NULL,
    deskripsi TEXT NULL,
    persyaratan JSON NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Tabel Permohonan Surat
-- ============================================================
CREATE TABLE IF NOT EXISTS permohonan_surat (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nomor_permohonan VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    jenis_surat_id INT NOT NULL,
    keperluan TEXT NULL,
    tanggal_pengajuan DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'diverifikasi_admin', 'ditolak_admin', 'disetujui_kades', 'ditolak_kades') DEFAULT 'pending',
    catatan_admin TEXT NULL,
    alasan_penolakan TEXT NULL,
    nomor_surat_resmi VARCHAR(100) NULL,
    tanggal_persetujuan DATETIME NULL,
    diverifikasi_oleh INT NULL,
    disetujui_oleh INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (jenis_surat_id) REFERENCES jenis_surat(id),
    FOREIGN KEY (diverifikasi_oleh) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (disetujui_oleh) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- Tabel Berkas Persyaratan Permohonan
-- ============================================================
CREATE TABLE IF NOT EXISTS berkas_permohonan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    permohonan_id INT NOT NULL,
    nama_persyaratan VARCHAR(100) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NULL,
    file_size INT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (permohonan_id) REFERENCES permohonan_surat(id) ON DELETE CASCADE
);

-- ============================================================
-- SEED DATA — Jenis Surat
-- ============================================================
INSERT INTO jenis_surat (kode_surat, nama_surat, deskripsi, persyaratan) VALUES
(
    'KTP',
    'Surat Pengantar Kartu Tanda Penduduk',
    'Surat pengantar untuk pembuatan atau perpanjangan KTP di Dinas Kependudukan dan Pencatatan Sipil.',
    JSON_ARRAY(
        JSON_OBJECT('key', 'pasfoto', 'label', 'Pasfoto 3x4 (terbaru)', 'type', 'image'),
        JSON_OBJECT('key', 'scan_kk', 'label', 'Scan Kartu Keluarga (KK)', 'type', 'image')
    )
),
(
    'KK',
    'Surat Pengantar Kartu Keluarga',
    'Surat pengantar untuk pembuatan, perubahan, atau pecah KK di Dinas Kependudukan dan Pencatatan Sipil.',
    JSON_ARRAY(
        JSON_OBJECT('key', 'scan_ktp', 'label', 'Scan KTP Kepala Keluarga', 'type', 'image'),
        JSON_OBJECT('key', 'scan_kk_lama', 'label', 'Scan KK Lama / Surat Keterangan Pecah KK', 'type', 'image')
    )
),
(
    'DOMISILI',
    'Surat Keterangan Domisili',
    'Surat keterangan yang menyatakan bahwa seseorang berdomisili di wilayah Desa Wangkar Weli.',
    JSON_ARRAY(
        JSON_OBJECT('key', 'scan_ktp', 'label', 'Scan KTP', 'type', 'image'),
        JSON_OBJECT('key', 'scan_kk', 'label', 'Scan Kartu Keluarga (KK)', 'type', 'image')
    )
);

-- ============================================================
-- SEED DATA — Akun Default (password di-hash bcrypt)
-- Admin    : admin / admin123
-- Kades    : kades / kades123
-- ============================================================
INSERT INTO users (nik, username, password, nama_lengkap, no_hp, role) VALUES
(
    NULL,
    'admin',
    '$2y$12$kl2uqvdJReDzJl1Oa9fsI.gsQ2Dcor3Zwuak.hHXxMsaiow6FuFTG',
    'Administrator Desa Wangkar Weli',
    '081234567890',
    'admin'
),
(
    NULL,
    'kades',
    '$2y$12$I4G11vTFF30861g/59UKV.XfMoafab/T.jVkOI2JHAX8hxUZ4Dk12',
    'Kepala Desa Wangkar Weli',
    '081234567891',
    'kades'
);

-- ============================================================
-- SEED DATA — Contoh Data Penduduk
-- ============================================================
INSERT INTO penduduk (nik, no_kk, nama, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, rt_rw, dusun, agama, status_perkawinan, pekerjaan, no_hp) VALUES
('7301010101010001', '7301011234567001', 'Budi Santoso', 'Wangkar Weli', '1990-05-15', 'L', 'Jl. Desa Wangkar Weli No. 1', '001/001', 'Dusun I', 'Islam', 'Kawin', 'Petani', '082111111111'),
('7301010101010002', '7301011234567002', 'Siti Rahayu', 'Wangkar Weli', '1995-08-20', 'P', 'Jl. Desa Wangkar Weli No. 2', '001/002', 'Dusun II', 'Islam', 'Belum Kawin', 'Buruh', '082222222222'),
('7301010101010003', '7301011234567003', 'Ahmad Fauzi', 'Manado', '1985-03-10', 'L', 'Jl. Desa Wangkar Weli No. 3', '002/001', 'Dusun I', 'Kristen', 'Kawin', 'Wiraswasta', '082333333333');
