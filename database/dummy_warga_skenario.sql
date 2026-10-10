-- ============================================================
-- DUMMY DATA — Skenario Kelayakan KTP-el
-- SIPESPEK - Desa Wangkar Weli
--
-- Skenario yang dibuat:
--   ✅ Warga 1 (rinasafitri)   → Eligible: usia 18 thn, punya KK
--   ✅ Warga 2 (mayasari)      → Eligible: usia 16 thn TAPI sudah menikah, punya KK
--   ❌ Warga 3 (donipratama)   → NOT Eligible: usia 15 thn, belum menikah
--   ❌ Warga 4 (hendrasusanto) → NOT Eligible: usia 21 thn tapi TIDAK punya KK
-- ============================================================

-- Agar dapat dijalankan ulang tanpa error
DELETE FROM users    WHERE username IN ('rinasafitri','mayasari','donipratama','hendrasusanto');
DELETE FROM penduduk WHERE nik IN ('7301010101010004','7301010101010005','7301010101010006','7301010101010007');

-- ============================================================
-- A. DATA PENDUDUK
-- ============================================================

-- 1. ✅ Rina Safitri — Usia 18 thn, Belum Kawin, punya KK
--    Lahir: 2008-01-15 → per 10 Oktober 2026 = 18 tahun → LOLOS umur
INSERT INTO penduduk
  (nik, no_kk, nama, tempat_lahir, tanggal_lahir, jenis_kelamin,
   alamat, rt_rw, dusun, agama, status_perkawinan, pekerjaan, no_hp)
VALUES
  ('7301010101010004','7301011234567004','Rina Safitri','Wangkar Weli','2008-01-15','P',
   'Jl. Desa Wangkar Weli No. 4','001/003','Dusun I','Islam','Belum Kawin','Pelajar','082444444444');

-- 2. ✅ Maya Sari — Usia 16 thn, SUDAH MENIKAH, punya KK
--    Lahir: 2010-03-20 → 16 tahun (di bawah 17), tapi status Kawin → LOLOS via menikah
INSERT INTO penduduk
  (nik, no_kk, nama, tempat_lahir, tanggal_lahir, jenis_kelamin,
   alamat, rt_rw, dusun, agama, status_perkawinan, pekerjaan, no_hp)
VALUES
  ('7301010101010005','7301011234567005','Maya Sari','Manado','2010-03-20','P',
   'Jl. Desa Wangkar Weli No. 5','002/001','Dusun II','Islam','Kawin','Ibu Rumah Tangga','082555555555');

-- 3. ❌ Doni Pratama — Usia 15 thn, BELUM MENIKAH, punya KK
--    Lahir: 2011-06-15 → 15 tahun, Belum Kawin → GAGAL (terlalu muda & belum menikah)
INSERT INTO penduduk
  (nik, no_kk, nama, tempat_lahir, tanggal_lahir, jenis_kelamin,
   alamat, rt_rw, dusun, agama, status_perkawinan, pekerjaan, no_hp)
VALUES
  ('7301010101010006','7301011234567006','Doni Pratama','Wangkar Weli','2011-06-15','L',
   'Jl. Desa Wangkar Weli No. 6','001/001','Dusun I','Kristen','Belum Kawin','Pelajar','082666666666');

-- 4. ❌ Hendra Susanto — Usia 21 thn, Belum Kawin, TIDAK punya KK
--    Lahir: 2005-05-10 → 21 tahun (lolos umur), tapi no_kk = '0' (kosong/tidak ada) → GAGAL (no KK)
--    NB: PHP empty('0') === true, dipakai untuk simulasi "tanpa KK"
INSERT INTO penduduk
  (nik, no_kk, nama, tempat_lahir, tanggal_lahir, jenis_kelamin,
   alamat, rt_rw, dusun, agama, status_perkawinan, pekerjaan, no_hp)
VALUES
  ('7301010101010007','0','Hendra Susanto','Gorontalo','2005-05-10','L',
   'Jl. Desa Wangkar Weli No. 7','002/002','Dusun III','Islam','Belum Kawin','Wiraswasta','082777777777');

-- ============================================================
-- B. DATA USERS (akun login warga)
--    Password semua: "password123"
--    Hash bcrypt: $2y$10$nmNzozbTgNZ7JdwxHLt9t.Rg8j8HFGPWZ4aTDJPZSXOJFg5VqlF6y
-- ============================================================

-- 1. ✅ Akun Rina Safitri
INSERT INTO users
  (nik, username, password, nama_lengkap, no_hp, alamat, role, is_active)
VALUES
  ('7301010101010004','rinasafitri',
   '$2y$10$nmNzozbTgNZ7JdwxHLt9t.Rg8j8HFGPWZ4aTDJPZSXOJFg5VqlF6y',
   'Rina Safitri','082444444444','Jl. Desa Wangkar Weli No. 4','warga',1);

-- 2. ✅ Akun Maya Sari
INSERT INTO users
  (nik, username, password, nama_lengkap, no_hp, alamat, role, is_active)
VALUES
  ('7301010101010005','mayasari',
   '$2y$10$nmNzozbTgNZ7JdwxHLt9t.Rg8j8HFGPWZ4aTDJPZSXOJFg5VqlF6y',
   'Maya Sari','082555555555','Jl. Desa Wangkar Weli No. 5','warga',1);

-- 3. ❌ Akun Doni Pratama
INSERT INTO users
  (nik, username, password, nama_lengkap, no_hp, alamat, role, is_active)
VALUES
  ('7301010101010006','donipratama',
   '$2y$10$nmNzozbTgNZ7JdwxHLt9t.Rg8j8HFGPWZ4aTDJPZSXOJFg5VqlF6y',
   'Doni Pratama','082666666666','Jl. Desa Wangkar Weli No. 6','warga',1);

-- 4. ❌ Akun Hendra Susanto
INSERT INTO users
  (nik, username, password, nama_lengkap, no_hp, alamat, role, is_active)
VALUES
  ('7301010101010007','hendrasusanto',
   '$2y$10$nmNzozbTgNZ7JdwxHLt9t.Rg8j8HFGPWZ4aTDJPZSXOJFg5VqlF6y',
   'Hendra Susanto','082777777777','Jl. Desa Wangkar Weli No. 7','warga',1);

-- ============================================================
-- C. VERIFIKASI — cek semua data yang baru dimasukkan
-- ============================================================
SELECT
  p.nik,
  p.nama,
  p.tanggal_lahir,
  TIMESTAMPDIFF(YEAR, p.tanggal_lahir, CURDATE()) AS usia,
  p.status_perkawinan,
  IF(p.no_kk = '0' OR p.no_kk = '', 'TIDAK ADA', p.no_kk) AS no_kk,
  CASE
    WHEN (TIMESTAMPDIFF(YEAR, p.tanggal_lahir, CURDATE()) >= 17
          OR p.status_perkawinan IN ('Kawin','Cerai Hidup','Cerai Mati'))
         AND p.no_kk != '0' AND p.no_kk != ''
    THEN '✅ ELIGIBLE KTP'
    ELSE '❌ TIDAK ELIGIBLE KTP'
  END AS status_kelayakan_ktp,
  u.username
FROM penduduk p
JOIN users u ON u.nik = p.nik
WHERE p.nik IN ('7301010101010004','7301010101010005','7301010101010006','7301010101010007')
ORDER BY p.nik;
