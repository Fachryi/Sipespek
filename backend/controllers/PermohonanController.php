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
     * GET /permohonan/cek-syarat?jenis_surat_id=1
     * Cek kelayakan warga untuk mengajukan jenis surat tertentu.
     *
     * SYARAT DASAR UNIVERSAL (berlaku untuk semua jenis surat):
     *   1. Usia ≥ 17 tahun ATAU sudah/pernah menikah
     *      → Semua layanan memerlukan KTP-el sebagai dokumen dasar.
     *        KTP-el hanya bisa dimiliki oleh warga ≥17 thn atau yang sudah menikah.
     *   2. Memiliki Kartu Keluarga (no_kk tidak kosong)
     *      → Warga harus tercatat dalam administrasi kependudukan desa.
     *   3. Tercatat dalam tabel penduduk desa (validasi otomatis via SELECT)
     */
    public function cekSyarat(): void {
        $authUser     = AuthMiddleware::requireRole('warga');
        $jenisSuratId = (int) ($_GET['jenis_surat_id'] ?? 0);

        if (!$jenisSuratId) {
            sendError('Parameter jenis_surat_id wajib diisi.');
        }

        // Ambil jenis surat
        $stmt = $this->db->prepare('SELECT * FROM jenis_surat WHERE id = ? AND is_active = 1');
        $stmt->execute([$jenisSuratId]);
        $jenisSurat = $stmt->fetch();

        if (!$jenisSurat) {
            sendError('Jenis surat tidak ditemukan.');
        }

        // Cari data penduduk berdasarkan NIK warga yang login
        if (empty($authUser->nik)) {
            sendSuccess('Kelayakan berhasil dicek.', [
                'eligible'       => false,
                'alasan'         => ['NIK Anda belum terdaftar. Silakan hubungi petugas desa untuk melengkapi data kependudukan.'],
                'data_penduduk'  => null,
                'kode_surat'     => $jenisSurat['kode_surat'],
                'syarat_umum'    => $this->getSyaratUmum($jenisSurat['kode_surat']),
            ]);
            return;
        }

        $stmt = $this->db->prepare('SELECT * FROM penduduk WHERE nik = ?');
        $stmt->execute([$authUser->nik]);
        $penduduk = $stmt->fetch();

        if (!$penduduk) {
            sendSuccess('Kelayakan berhasil dicek.', [
                'eligible'      => false,
                'alasan'        => ['Data kependudukan Anda belum terdaftar di database desa. Silakan hubungi petugas desa.'],
                'data_penduduk' => null,
                'kode_surat'    => $jenisSurat['kode_surat'],
                'syarat_umum'   => $this->getSyaratUmum($jenisSurat['kode_surat']),
            ]);
            return;
        }

        $eligible = true;
        $alasan   = [];

        // ================================================================
        // SYARAT DASAR UNIVERSAL — berlaku untuk SEMUA jenis surat
        // Dasar pemikiran:
        //   - KTP-el  → butuh usia ≥ 17 atau menikah + punya KK
        //   - KK Baru → butuh Foto Copy KTP-el kepala keluarga (artinya
        //               pemohon harus sudah bisa memiliki KTP-el)
        //   - Domisili→ butuh Foto Copy KTP pemohon (artinya pemohon
        //               harus sudah bisa memiliki KTP)
        //
        // Karena KTP-el hanya dimiliki oleh seseorang berusia ≥ 17 tahun
        // ATAU sudah/pernah menikah, maka syarat ini berlaku universal
        // untuk semua jenis layanan surat kependudukan.
        // ================================================================

        // Hitung usia
        $tglLahir     = new \DateTime($penduduk['tanggal_lahir']);
        $sekarang     = new \DateTime();
        $usia         = (int) $tglLahir->diff($sekarang)->y;
        $statusKawin  = strtolower($penduduk['status_perkawinan'] ?? '');
        $sudahMenikah = in_array($statusKawin, ['kawin', 'cerai hidup', 'cerai mati', 'pernah kawin']);

        // Syarat Dasar 1: Usia ≥ 17 tahun ATAU sudah/pernah menikah
        if ($usia < 17 && !$sudahMenikah) {
            $eligible = false;
            $alasan[] = "Usia Anda saat ini {$usia} tahun. Syarat mengurus surat kependudukan: "
                      . "minimal berusia 17 tahun atau sudah/pernah menikah, "
                      . "karena semua layanan memerlukan KTP-el sebagai dokumen dasar.";
        }

        // Syarat Dasar 2: Memiliki Kartu Keluarga (no_kk terisi)
        if (empty($penduduk['no_kk'])) {
            $eligible = false;
            $alasan[] = 'Anda belum memiliki Kartu Keluarga (KK) atau belum tercatat sebagai warga desa. '
                      . 'Silakan hubungi petugas desa untuk melengkapi data kependudukan terlebih dahulu.';
        }

        // Syarat Dasar 3: Tercatat sebagai warga desa
        // → Sudah divalidasi di atas (lewat tabel penduduk).

        // ================================================================
        // SYARAT TAMBAHAN SPESIFIK PER JENIS SURAT
        // (bisa ditambahkan di sini jika diperlukan di masa mendatang)
        // ================================================================
        // Contoh: jika KK memerlukan validasi status pernikahan tertentu,
        // atau Domisili memerlukan minimal masa tinggal, dll.


        sendSuccess('Kelayakan berhasil dicek.', [
            'eligible'      => $eligible,
            'alasan'        => $alasan,
            'data_penduduk' => [
                'nama'              => $penduduk['nama'],
                'nik'               => $penduduk['nik'],
                'tanggal_lahir'     => $penduduk['tanggal_lahir'],
                'status_perkawinan' => $penduduk['status_perkawinan'],
                'no_kk'             => $penduduk['no_kk'],
                'dusun'             => $penduduk['dusun'],
            ],
            'kode_surat'    => $jenisSurat['kode_surat'],
            'syarat_umum'   => $this->getSyaratUmum($jenisSurat['kode_surat']),
        ]);
    }

    /**
     * Kembalikan daftar syarat umum (non-berkas) untuk ditampilkan ke warga.
     * Syarat Dasar Universal sudah disertakan di semua jenis surat.
     */
    private function getSyaratUmum(string $kodeSurat): array {
        // Syarat dasar yang berlaku untuk SEMUA jenis surat
        $syaratDasar = [
            ['label' => 'Telah berusia 17 tahun atau sudah/pernah menikah', 'icon' => 'age',   'is_universal' => true],
            ['label' => 'Memiliki Kartu Keluarga (KK)',                     'icon' => 'kk',    'is_universal' => true],
            ['label' => 'Tercatat dalam buku penduduk sebagai warga desa',  'icon' => 'warga', 'is_universal' => true],
        ];

        $syaratSpesifik = [
            'KTP' => [
                // KTP tidak punya syarat spesifik tambahan — syarat dasar sudah mencakup semua
            ],
            'KK' => [
                ['label' => 'Foto Copy KTP-el Kepala Keluarga (bagi yang sudah merekam)', 'icon' => 'ktp'],
                ['label' => 'Buku Nikah atau Akta Perkawinan (bagi pasangan yang sudah menikah)', 'icon' => 'nikah'],
                ['label' => 'Akta Kelahiran anak atau anggota keluarga jika ada', 'icon' => 'anak'],
                ['label' => 'Surat Keterangan Lulus atau Ijazah (bagi anak yang masih sekolah)', 'icon' => 'sekolah'],
                ['label' => 'Surat Keterangan Pindah (apabila berasal dari daerah lain)', 'icon' => 'pindah'],
            ],
            'DOMISILI' => [
                ['label' => 'Foto Copy KTP Pemohon yang masih berlaku', 'icon' => 'ktp'],
                ['label' => 'Foto Copy Kartu Keluarga (KK)', 'icon' => 'kk'],
                ['label' => 'Mengisi formulir permohonan keterangan domisili', 'icon' => 'form'],
            ],
        ];

        // Gabungkan: syarat dasar universal di atas, lalu syarat spesifik
        $spesifik = $syaratSpesifik[$kodeSurat] ?? [];
        return array_merge($syaratDasar, $spesifik);
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

    /**
     * GET /public/lacak?query=<NIK_atau_NomorPermohonan>
     * Pelacakan mandiri — TIDAK memerlukan autentikasi.
     * Mencari berdasarkan NIK warga ATAU nomor permohonan.
     * Hanya menampilkan data yang aman untuk publik (tanpa data pribadi sensitif).
     */
    public function lacakPublik(): void {
        $query = sanitize(trim($_GET['query'] ?? ''));

        if (empty($query)) {
            sendError('Masukkan NIK atau nomor permohonan untuk melacak.');
        }

        if (strlen($query) < 5) {
            sendError('Query terlalu pendek. Masukkan NIK (16 digit) atau nomor permohonan.');
        }

        // Tentukan apakah query adalah NIK (16 digit angka) atau nomor permohonan
        $isNIK = preg_match('/^\d{16}$/', $query);

        if ($isNIK) {
            // Cari berdasarkan NIK warga
            $stmt = $this->db->prepare(
                "SELECT
                    ps.nomor_permohonan,
                    ps.status,
                    ps.tanggal_pengajuan,
                    ps.tanggal_persetujuan,
                    ps.nomor_surat_resmi,
                    ps.alasan_penolakan,
                    ps.catatan_admin,
                    js.nama_surat,
                    js.kode_surat,
                    CONCAT(LEFT(u.nama_lengkap, 2), REPEAT('*', GREATEST(0, LENGTH(u.nama_lengkap) - 4)),
                           RIGHT(u.nama_lengkap, 2)) AS nama_sensor
                 FROM permohonan_surat ps
                 JOIN jenis_surat js ON ps.jenis_surat_id = js.id
                 JOIN users u ON ps.user_id = u.id
                 WHERE u.nik = ?
                 ORDER BY ps.tanggal_pengajuan DESC
                 LIMIT 10"
            );
            $stmt->execute([$query]);
        } else {
            // Cari berdasarkan nomor permohonan (format: PRM-YYYYMMDD-XXXXXX)
            $stmt = $this->db->prepare(
                "SELECT
                    ps.nomor_permohonan,
                    ps.status,
                    ps.tanggal_pengajuan,
                    ps.tanggal_persetujuan,
                    ps.nomor_surat_resmi,
                    ps.alasan_penolakan,
                    ps.catatan_admin,
                    js.nama_surat,
                    js.kode_surat,
                    CONCAT(LEFT(u.nama_lengkap, 2), REPEAT('*', GREATEST(0, LENGTH(u.nama_lengkap) - 4)),
                           RIGHT(u.nama_lengkap, 2)) AS nama_sensor
                 FROM permohonan_surat ps
                 JOIN jenis_surat js ON ps.jenis_surat_id = js.id
                 JOIN users u ON ps.user_id = u.id
                 WHERE ps.nomor_permohonan = ?
                 LIMIT 1"
            );
            $stmt->execute([$query]);
        }

        $results = $stmt->fetchAll();

        if (empty($results)) {
            sendSuccess('Tidak ada permohonan ditemukan.', [
                'found'   => false,
                'query'   => $isNIK ? 'NIK' : 'Nomor Permohonan',
                'results' => [],
            ]);
            return;
        }

        // Label status dalam bahasa Indonesia
        $statusLabels = [
            'pending'            => 'Menunggu Verifikasi Admin',
            'diverifikasi_admin' => 'Terverifikasi — Menunggu Persetujuan Kepala Desa',
            'ditolak_admin'      => 'Ditolak oleh Admin Desa',
            'disetujui_kades'    => 'Disetujui — Surat Siap Diunduh',
            'ditolak_kades'      => 'Ditolak oleh Kepala Desa',
        ];

        $statusStages = [
            'pending'            => 1,
            'diverifikasi_admin' => 2,
            'ditolak_admin'      => 0,
            'disetujui_kades'    => 3,
            'ditolak_kades'      => 0,
        ];

        foreach ($results as &$row) {
            $row['status_label'] = $statusLabels[$row['status']] ?? $row['status'];
            $row['stage']        = $statusStages[$row['status']] ?? 0;
            $row['is_selesai']   = $row['status'] === 'disetujui_kades';
            $row['is_ditolak']   = in_array($row['status'], ['ditolak_admin', 'ditolak_kades']);
        }

        sendSuccess('Data permohonan ditemukan.', [
            'found'        => true,
            'query_type'   => $isNIK ? 'NIK' : 'Nomor Permohonan',
            'jumlah'       => count($results),
            'results'      => $results,
        ]);
    }
}
