
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
DROP TABLE IF EXISTS `berkas_permohonan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `berkas_permohonan` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `permohonan_id` int(11) NOT NULL,
  `nama_persyaratan` varchar(100) NOT NULL,
  `original_filename` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_type` varchar(50) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `permohonan_id` (`permohonan_id`),
  CONSTRAINT `berkas_permohonan_ibfk_1` FOREIGN KEY (`permohonan_id`) REFERENCES `permohonan_surat` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `berkas_permohonan` WRITE;
/*!40000 ALTER TABLE `berkas_permohonan` DISABLE KEYS */;
/*!40000 ALTER TABLE `berkas_permohonan` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `jenis_surat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jenis_surat` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `kode_surat` varchar(20) NOT NULL,
  `nama_surat` varchar(100) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `persyaratan` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`persyaratan`)),
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `jenis_surat` WRITE;
/*!40000 ALTER TABLE `jenis_surat` DISABLE KEYS */;
INSERT INTO `jenis_surat` VALUES (1,'KTP','Surat Pengantar Kartu Tanda Penduduk','Surat pengantar untuk pembuatan atau perpanjangan KTP di Dinas Kependudukan dan Pencatatan Sipil.','[{\"key\": \"pasfoto\", \"label\": \"Pasfoto 3x4 (terbaru)\", \"type\": \"image\"}, {\"key\": \"scan_kk\", \"label\": \"Scan Kartu Keluarga (KK)\", \"type\": \"image\"}]',1,'2026-09-09 16:52:10'),(2,'KK','Surat Pengantar Kartu Keluarga','Surat pengantar untuk pembuatan, perubahan, atau pecah KK di Dinas Kependudukan dan Pencatatan Sipil.','[{\"key\": \"scan_ktp\", \"label\": \"Scan KTP Kepala Keluarga\", \"type\": \"image\"}, {\"key\": \"scan_kk_lama\", \"label\": \"Scan KK Lama / Surat Keterangan Pecah KK\", \"type\": \"image\"}]',1,'2026-09-09 16:52:10'),(3,'DOMISILI','Surat Keterangan Domisili','Surat keterangan yang menyatakan bahwa seseorang berdomisili di wilayah Desa Wangkar Weli.','[{\"key\": \"scan_ktp\", \"label\": \"Scan KTP\", \"type\": \"image\"}, {\"key\": \"scan_kk\", \"label\": \"Scan Kartu Keluarga (KK)\", \"type\": \"image\"}]',1,'2026-09-09 16:52:10');
/*!40000 ALTER TABLE `jenis_surat` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `penduduk`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `penduduk` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nik` varchar(16) NOT NULL,
  `no_kk` varchar(16) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `tempat_lahir` varchar(50) NOT NULL,
  `tanggal_lahir` date NOT NULL,
  `jenis_kelamin` enum('L','P') NOT NULL,
  `alamat` text NOT NULL,
  `rt_rw` varchar(10) NOT NULL,
  `dusun` varchar(50) NOT NULL,
  `agama` varchar(20) NOT NULL,
  `status_perkawinan` varchar(20) NOT NULL,
  `pekerjaan` varchar(50) NOT NULL,
  `no_hp` varchar(15) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `nik` (`nik`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `penduduk` WRITE;
/*!40000 ALTER TABLE `penduduk` DISABLE KEYS */;
INSERT INTO `penduduk` VALUES (1,'7301010101010001','7301011234567001','Budi Santoso','Wangkar Weli','1990-05-15','L','Jl. Desa Wangkar Weli No. 1','001/001','Dusun I','Islam','Kawin','Petani','082111111111','2026-09-09 16:52:10','2026-09-09 16:52:10'),(2,'7301010101010002','7301011234567002','Siti Rahayu','Wangkar Weli','1995-08-20','P','Jl. Desa Wangkar Weli No. 2','001/002','Dusun II','Islam','Belum Kawin','Buruh','082222222222','2026-09-09 16:52:10','2026-09-09 16:52:10'),(3,'7301010101010003','7301011234567003','Ahmad Fauzi','Manado','1985-03-10','L','Jl. Desa Wangkar Weli No. 3','002/001','Dusun I','Kristen','Kawin','Wiraswasta','082333333333','2026-09-09 16:52:10','2026-09-09 16:52:10');
/*!40000 ALTER TABLE `penduduk` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `permohonan_surat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `permohonan_surat` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nomor_permohonan` varchar(50) NOT NULL,
  `user_id` int(11) NOT NULL,
  `jenis_surat_id` int(11) NOT NULL,
  `keperluan` text DEFAULT NULL,
  `tanggal_pengajuan` datetime DEFAULT current_timestamp(),
  `status` enum('pending','diverifikasi_admin','ditolak_admin','disetujui_kades','ditolak_kades') DEFAULT 'pending',
  `catatan_admin` text DEFAULT NULL,
  `alasan_penolakan` text DEFAULT NULL,
  `nomor_surat_resmi` varchar(100) DEFAULT NULL,
  `tanggal_persetujuan` datetime DEFAULT NULL,
  `diverifikasi_oleh` int(11) DEFAULT NULL,
  `disetujui_oleh` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `nomor_permohonan` (`nomor_permohonan`),
  KEY `user_id` (`user_id`),
  KEY `jenis_surat_id` (`jenis_surat_id`),
  KEY `diverifikasi_oleh` (`diverifikasi_oleh`),
  KEY `disetujui_oleh` (`disetujui_oleh`),
  CONSTRAINT `permohonan_surat_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `permohonan_surat_ibfk_2` FOREIGN KEY (`jenis_surat_id`) REFERENCES `jenis_surat` (`id`),
  CONSTRAINT `permohonan_surat_ibfk_3` FOREIGN KEY (`diverifikasi_oleh`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `permohonan_surat_ibfk_4` FOREIGN KEY (`disetujui_oleh`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `permohonan_surat` WRITE;
/*!40000 ALTER TABLE `permohonan_surat` DISABLE KEYS */;
/*!40000 ALTER TABLE `permohonan_surat` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nik` varchar(16) DEFAULT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nama_lengkap` varchar(100) NOT NULL,
  `no_hp` varchar(15) DEFAULT NULL,
  `alamat` text DEFAULT NULL,
  `role` enum('warga','admin','kades') NOT NULL DEFAULT 'warga',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `nik` (`nik`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,NULL,'admin','$2y$12$kl2uqvdJReDzJl1Oa9fsI.gsQ2Dcor3Zwuak.hHXxMsaiow6FuFTG','Administrator Desa Wangkar Weli','081234567890',NULL,'admin',1,'2026-09-09 16:52:10','2026-09-09 16:52:10'),(2,NULL,'kades','$2y$12$I4G11vTFF30861g/59UKV.XfMoafab/T.jVkOI2JHAX8hxUZ4Dk12','Kepala Desa Wangkar Weli','081234567891',NULL,'kades',1,'2026-09-09 16:52:10','2026-09-09 16:52:10'),(3,'7301010101010003','ahmadfauzi','$2y$10$nmNzozbTgNZ7JdwxHLt9t.Rg8j8HFGPWZ4aTDJPZSXOJFg5VqlF6y','Ahmad Fauzi','082333333333','Jln Wengkar Weli 2','warga',1,'2026-09-09 17:09:17','2026-09-09 18:34:46'),(4,'7301010101010001','budisantoso','$2y$10$nmNzozbTgNZ7JdwxHLt9t.Rg8j8HFGPWZ4aTDJPZSXOJFg5VqlF6y','Budi Santoso','082111111111','Jl. Desa Wangkar Weli No. 1','warga',1,'2026-09-09 18:30:04','2026-09-09 18:34:46'),(5,'7301010101010002','sitirahayu','$2y$10$nmNzozbTgNZ7JdwxHLt9t.Rg8j8HFGPWZ4aTDJPZSXOJFg5VqlF6y','Siti Rahayu','082222222222','Jl. Desa Wangkar Weli No. 2','warga',1,'2026-09-09 18:30:04','2026-09-09 18:34:46');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

