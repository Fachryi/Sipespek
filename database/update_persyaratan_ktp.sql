-- Update persyaratan KTP-el (id=1)
-- Berkas wajib upload: Scan KK + Foto Copy KTP lama
UPDATE jenis_surat
SET
  persyaratan = '[{"key":"scan_kk","label":"Scan Kartu Keluarga (KK)","type":"image","required":true},{"key":"foto_ktp_lama","label":"Foto Copy KTP-el (bagi yang sudah merekam)","type":"image","required":true}]',
  deskripsi   = 'Surat pengantar untuk pembuatan atau perpanjangan KTP Elektronik di Dinas Kependudukan dan Pencatatan Sipil. Syarat: berusia 17 tahun atau sudah/pernah menikah, memiliki KK, dan tercatat sebagai warga desa.'
WHERE id = 1 AND kode_surat = 'KTP';

-- Update persyaratan KK Baru (id=2)
-- Berkas wajib upload sesuai syarat pembuatan KK baru
UPDATE jenis_surat
SET
  persyaratan = '[{"key":"scan_ktp_el","label":"Foto Copy KTP-el Kepala Keluarga (bagi yang sudah merekam)","type":"image","required":true},{"key":"buku_nikah","label":"Buku Nikah / Akta Perkawinan (bagi pasangan yang sudah menikah)","type":"image","required":true},{"key":"akta_kelahiran","label":"Akta Kelahiran Anak / Anggota Keluarga","type":"image","required":true},{"key":"surat_lulus","label":"Surat Keterangan Lulus / Ijazah (bagi anak yang masih sekolah)","type":"image","required":true},{"key":"surat_pindah","label":"Surat Keterangan Pindah (apabila berasal dari daerah lain)","type":"image","required":true}]',
  deskripsi   = 'Surat pengantar untuk pembuatan Kartu Keluarga (KK) baru di Dinas Kependudukan dan Pencatatan Sipil.'
WHERE id = 2 AND kode_surat = 'KK';

-- Update persyaratan Surat Keterangan Domisili (id=3)
-- Berkas wajib upload + formulir khusus domisili
UPDATE jenis_surat
SET
  persyaratan = '[{"key":"scan_ktp","label":"Foto Copy KTP Pemohon","type":"image","required":true},{"key":"scan_kk","label":"Foto Copy Kartu Keluarga (KK)","type":"image","required":true}]',
  deskripsi   = 'Surat keterangan yang menyatakan bahwa seseorang berdomisili di wilayah Desa Wangkar Weli. Pemohon wajib mengisi formulir permohonan keterangan domisili.'
WHERE id = 3 AND kode_surat = 'DOMISILI';

SELECT id, kode_surat, nama_surat, persyaratan, deskripsi FROM jenis_surat;
