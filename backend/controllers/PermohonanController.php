<?php
/**
 * PermohonanController - Pengajuan, Verifikasi, Approval Surat
 * SIPESPEK - Desa Wangkar Weli
 */

class PermohonanController {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    /**
     * POST /permohonan
     * Warga mengajukan permohonan surat + upload berkas (multipart/form-data)
     */
    public function store(): void {
        $authUser = AuthMiddleware::requireRole('warga');

        $jenisSuratId = (int) ($_POST['jenis_surat_id'] ?? 0);
        $keperluan    = sanitize($_POST['keperluan'] ?? '');

        if (!$jenisSuratId) {
            sendError('Jenis surat wajib dipilih.');
        }

        // Validasi jenis surat
        $stmt = $this->db->prepare('SELECT * FROM jenis_surat WHERE id = ? AND is_active = 1');
        $stmt->execute([$jenisSuratId]);
        $jenisSurat = $stmt->fetch();
        if (!$jenisSurat) {
            sendError('Jenis surat tidak valid.');
        }

        // Validasi berkas upload
        $persyaratan = json_decode($jenisSurat['persyaratan'] ?? '[]', true);
        if (empty($_FILES)) {
            sendError('Berkas persyaratan wajib diunggah.');
        }

        // Buat nomor permohonan unik
        $nomorPermohonan = generateNomorPermohonan();

        // Insert permohonan
        $stmt = $this->db->prepare(
            'INSERT INTO permohonan_surat (nomor_permohonan, user_id, jenis_surat_id, keperluan, status) VALUES (?, ?, ?, ?, "pending")'
        );
        $stmt->execute([$nomorPermohonan, $authUser->id, $jenisSuratId, $keperluan]);
        $permohonanId = (int) $this->db->lastInsertId();

        // Handle file uploads
        if (!is_dir(UPLOAD_DIR)) {
            mkdir(UPLOAD_DIR, 0755, true);
        }

        $uploadedFiles = [];

        foreach ($_FILES as $fieldKey => $file) {
            if ($file['error'] !== UPLOAD_ERR_OK) {
                continue;
            }

            // Validasi ukuran
            if ($file['size'] > UPLOAD_MAX_SIZE) {
                sendError("File '{$fieldKey}' melebihi ukuran maksimal 2MB.");
            }

            // Validasi MIME type
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mimeType = finfo_file($finfo, $file['tmp_name']);
            finfo_close($finfo);

            if (!in_array($mimeType, UPLOAD_ALLOWED_TYPES)) {
                sendError("Format file '{$fieldKey}' tidak didukung. Gunakan JPG, PNG, atau PDF.");
            }

            // Simpan file dengan nama unik
            $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
            $uniqueName = $permohonanId . '_' . $fieldKey . '_' . time() . '.' . $ext;
            $targetPath = UPLOAD_DIR . $uniqueName;

            if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
                sendError('Gagal menyimpan file. Silakan coba lagi.');
            }

            // Cari label dari persyaratan
            $label = $fieldKey;
            foreach ($persyaratan as $syarat) {
                if ($syarat['key'] === $fieldKey) {
                    $label = $syarat['label'];
                    break;
                }
            }

            $stmt = $this->db->prepare(
                'INSERT INTO berkas_permohonan (permohonan_id, nama_persyaratan, original_filename, file_path, file_type, file_size) VALUES (?, ?, ?, ?, ?, ?)'
            );
            $stmt->execute([$permohonanId, $label, $file['name'], 'uploads/' . $uniqueName, $mimeType, $file['size']]);
            $uploadedFiles[] = $label;
        }

        sendSuccess('Permohonan surat berhasil diajukan! Silakan pantau status permohonan Anda.', [
            'permohonan_id'    => $permohonanId,
            'nomor_permohonan' => $nomorPermohonan,
            'berkas_diupload'  => $uploadedFiles,
        ], 201);
    }

    /**
     * GET /permohonan
     * Riwayat permohonan warga yang sedang login
     */
    public function myPermohonan(): void {
        $authUser = AuthMiddleware::requireRole('warga');

        $page    = max(1, (int) ($_GET['page'] ?? 1));
        $perPage = 10;
        $offset  = ($page - 1) * $perPage;
        $status  = $_GET['status'] ?? '';

        $where  = 'WHERE ps.user_id = ?';
        $params = [$authUser->id];

        if (!empty($status)) {
            $where  .= ' AND ps.status = ?';
            $params[] = $status;
        }

        $stmtCount = $this->db->prepare("SELECT COUNT(*) FROM permohonan_surat ps {$where}");
        $stmtCount->execute($params);
        $total = (int) $stmtCount->fetchColumn();

        $stmt = $this->db->prepare(
            "SELECT ps.*, js.nama_surat, js.kode_surat
             FROM permohonan_surat ps
             JOIN jenis_surat js ON ps.jenis_surat_id = js.id
             {$where}
             ORDER BY ps.tanggal_pengajuan DESC
             LIMIT {$perPage} OFFSET {$offset}"
        );
        $stmt->execute($params);
        $data = $stmt->fetchAll();

        sendSuccess('Riwayat permohonan berhasil dimuat.', [
            'data'       => $data,
            'pagination' => [
                'total'    => $total,
                'page'     => $page,
                'per_page' => $perPage,
                'pages'    => (int) ceil($total / $perPage),
            ]
        ]);
    }

    /**
     * GET /permohonan/all
     * Semua permohonan (Admin/Kades)
     */
    public function all(): void {
        $authUser = AuthMiddleware::requireRole(['admin', 'kades']);

        $page    = max(1, (int) ($_GET['page'] ?? 1));
        $perPage = max(1, min(100, (int) ($_GET['per_page'] ?? 10)));
        $offset  = ($page - 1) * $perPage;
        $status  = $_GET['status'] ?? '';
        $search  = sanitize($_GET['search'] ?? '');

        $where  = 'WHERE 1=1';
        $params = [];

        if (!empty($status)) {
            $where  .= ' AND ps.status = ?';
            $params[] = $status;
        }

        if (!empty($search)) {
            $where  .= ' AND (u.nama_lengkap LIKE ? OR ps.nomor_permohonan LIKE ? OR u.nik LIKE ?)';
            $s = "%{$search}%";
            $params = array_merge($params, [$s, $s, $s]);
        }

        $stmtCount = $this->db->prepare(
            "SELECT COUNT(*) FROM permohonan_surat ps
             JOIN users u ON ps.user_id = u.id
             {$where}"
        );
        $stmtCount->execute($params);
        $total = (int) $stmtCount->fetchColumn();

        $stmt = $this->db->prepare(
            "SELECT ps.*, js.nama_surat, js.kode_surat,
                    u.nama_lengkap, u.nik, u.no_hp
             FROM permohonan_surat ps
             JOIN jenis_surat js ON ps.jenis_surat_id = js.id
             JOIN users u ON ps.user_id = u.id
             {$where}
             ORDER BY ps.tanggal_pengajuan DESC
             LIMIT {$perPage} OFFSET {$offset}"
        );
        $stmt->execute($params);
        $data = $stmt->fetchAll();

        sendSuccess('Data permohonan berhasil dimuat.', [
            'data'       => $data,
            'pagination' => [
                'total'    => $total,
                'page'     => $page,
                'per_page' => $perPage,
                'pages'    => (int) ceil($total / $perPage),
            ]
        ]);
    }

    /**
     * GET /permohonan/{id}
     * Detail permohonan + berkas
     */
    public function show(int $id): void {
        $authUser = AuthMiddleware::authenticate();

        $stmt = $this->db->prepare(
            "SELECT ps.*, js.nama_surat, js.kode_surat, js.persyaratan,
                    u.nama_lengkap, u.nik, u.no_hp, u.alamat,
                    p.tempat_lahir, p.tanggal_lahir, p.jenis_kelamin, p.pekerjaan,
                    p.rt_rw, p.dusun, p.no_kk, p.agama, p.status_perkawinan
             FROM permohonan_surat ps
             JOIN jenis_surat js ON ps.jenis_surat_id = js.id
             JOIN users u ON ps.user_id = u.id
             LEFT JOIN penduduk p ON u.nik = p.nik
             WHERE ps.id = ?"
        );
        $stmt->execute([$id]);
        $permohonan = $stmt->fetch();

        if (!$permohonan) {
            sendNotFound('Permohonan tidak ditemukan.');
        }

        // Warga hanya bisa lihat milik sendiri
        if ($authUser->role === 'warga' && (int) $permohonan['user_id'] !== $authUser->id) {
            sendForbidden();
        }

        // Ambil berkas
        $stmtBerkas = $this->db->prepare('SELECT * FROM berkas_permohonan WHERE permohonan_id = ?');
        $stmtBerkas->execute([$id]);
        $berkas = $stmtBerkas->fetchAll();

        $permohonan['berkas'] = $berkas;

        sendSuccess('Detail permohonan berhasil dimuat.', $permohonan);
    }

    /**
     * PUT /permohonan/{id}/verifikasi
     * Admin: verifikasi berkas (setujui → kades / tolak + alasan)
     */
    public function verifikasi(int $id): void {
        $authUser = AuthMiddleware::requireRole('admin');

        $stmt = $this->db->prepare('SELECT * FROM permohonan_surat WHERE id = ?');
        $stmt->execute([$id]);
        $permohonan = $stmt->fetch();

        if (!$permohonan) {
            sendNotFound('Permohonan tidak ditemukan.');
        }

        if ($permohonan['status'] !== 'pending') {
            sendError('Permohonan ini sudah diproses sebelumnya (status: ' . $permohonan['status'] . ').');
        }

        $body   = getJsonBody();
        $aksi   = $body['aksi'] ?? ''; // 'setujui' | 'tolak'
        $alasan = sanitize($body['alasan'] ?? '');
        $catatan = sanitize($body['catatan'] ?? '');

        if (!in_array($aksi, ['setujui', 'tolak'])) {
            sendError('Aksi tidak valid. Gunakan "setujui" atau "tolak".');
        }

        if ($aksi === 'tolak' && empty($alasan)) {
            sendError('Alasan penolakan wajib diisi.');
        }

        $newStatus = $aksi === 'setujui' ? 'diverifikasi_admin' : 'ditolak_admin';

        $stmt = $this->db->prepare(
            'UPDATE permohonan_surat SET status = ?, alasan_penolakan = ?, catatan_admin = ?, diverifikasi_oleh = ? WHERE id = ?'
        );
        $stmt->execute([$newStatus, $aksi === 'tolak' ? $alasan : null, $catatan ?: null, $authUser->id, $id]);

        $msg = $aksi === 'setujui'
            ? 'Berkas terverifikasi. Permohonan diteruskan ke Kepala Desa untuk persetujuan akhir.'
            : 'Permohonan ditolak. Warga akan diberitahu alasan penolakan.';

        sendSuccess($msg, ['status' => $newStatus]);
    }

    /**
     * PUT /permohonan/{id}/approve
     * Kades: approval akhir + terbitkan nomor surat resmi
     */
    public function approve(int $id): void {
        $authUser = AuthMiddleware::requireRole('kades');

        $stmt = $this->db->prepare(
            'SELECT ps.*, js.kode_surat FROM permohonan_surat ps JOIN jenis_surat js ON ps.jenis_surat_id = js.id WHERE ps.id = ?'
        );
        $stmt->execute([$id]);
        $permohonan = $stmt->fetch();

        if (!$permohonan) {
            sendNotFound('Permohonan tidak ditemukan.');
        }

        if ($permohonan['status'] !== 'diverifikasi_admin') {
            sendError('Permohonan ini belum diverifikasi oleh Admin Desa atau sudah diproses.');
        }

        $body   = getJsonBody();
        $aksi   = $body['aksi'] ?? ''; // 'setujui' | 'tolak'
        $alasan = sanitize($body['alasan'] ?? '');

        if (!in_array($aksi, ['setujui', 'tolak'])) {
            sendError('Aksi tidak valid. Gunakan "setujui" atau "tolak".');
        }

        if ($aksi === 'tolak' && empty($alasan)) {
            sendError('Alasan penolakan wajib diisi.');
        }

        if ($aksi === 'setujui') {
            // Generate nomor surat urut
            $stmtCount = $this->db->prepare('SELECT COUNT(*) FROM permohonan_surat WHERE status = "disetujui_kades" AND YEAR(tanggal_persetujuan) = YEAR(NOW())');
            $stmtCount->execute();
            $urutan = (int) $stmtCount->fetchColumn() + 1;

            $nomorSurat = generateNomorSurat($permohonan['kode_surat'], $urutan);

            $stmt = $this->db->prepare(
                'UPDATE permohonan_surat SET status = "disetujui_kades", nomor_surat_resmi = ?, tanggal_persetujuan = NOW(), disetujui_oleh = ?, alasan_penolakan = NULL WHERE id = ?'
            );
            $stmt->execute([$nomorSurat, $authUser->id, $id]);

            sendSuccess('Permohonan disetujui. Surat Pengantar resmi telah diterbitkan.', [
                'status'         => 'disetujui_kades',
                'nomor_surat'    => $nomorSurat,
            ]);
        } else {
            $stmt = $this->db->prepare(
                'UPDATE permohonan_surat SET status = "ditolak_kades", alasan_penolakan = ?, disetujui_oleh = ? WHERE id = ?'
            );
            $stmt->execute([$alasan, $authUser->id, $id]);

            sendSuccess('Permohonan ditolak oleh Kepala Desa.', ['status' => 'ditolak_kades']);
        }
    }

    /**
     * GET /jenis-surat
     * List semua jenis surat aktif (public)
     */
    public function jenisSurat(): void {
        $stmt = $this->db->prepare('SELECT * FROM jenis_surat WHERE is_active = 1 ORDER BY id ASC');
        $stmt->execute();
        $data = $stmt->fetchAll();

        // Decode JSON persyaratan
        foreach ($data as &$item) {
            $item['persyaratan'] = json_decode($item['persyaratan'] ?? '[]', true);
        }

        sendSuccess('Jenis surat berhasil dimuat.', $data);
    }
}
