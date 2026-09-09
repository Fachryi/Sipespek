<?php
/**
 * PendudukController - CRUD Data Kependudukan (Admin Only)
 * SIPESPEK - Desa Wangkar Weli
 */

class PendudukController {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    /**
     * GET /penduduk
     * List semua penduduk dengan pagination & search
     */
    public function index(): void {
        AuthMiddleware::requireRole(['admin', 'kades']);

        $page     = max(1, (int) ($_GET['page'] ?? 1));
        $perPage  = min(100, max(1, (int) ($_GET['per_page'] ?? 10)));
        $search   = sanitize($_GET['search'] ?? '');
        $offset   = ($page - 1) * $perPage;

        $where = '';
        $params = [];

        if (!empty($search)) {
            $where = 'WHERE nik LIKE ? OR nama LIKE ? OR no_kk LIKE ?';
            $searchTerm = "%{$search}%";
            $params = [$searchTerm, $searchTerm, $searchTerm];
        }

        // Count total
        $stmtCount = $this->db->prepare("SELECT COUNT(*) FROM penduduk {$where}");
        $stmtCount->execute($params);
        $total = (int) $stmtCount->fetchColumn();

        // Fetch data
        $stmt = $this->db->prepare("SELECT * FROM penduduk {$where} ORDER BY nama ASC LIMIT {$perPage} OFFSET {$offset}");
        $stmt->execute($params);
        $data = $stmt->fetchAll();

        sendSuccess('Data penduduk berhasil dimuat.', [
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
     * GET /penduduk/{id}
     * Detail satu penduduk
     */
    public function show(int $id): void {
        AuthMiddleware::requireRole(['admin', 'kades']);

        $stmt = $this->db->prepare('SELECT * FROM penduduk WHERE id = ?');
        $stmt->execute([$id]);
        $penduduk = $stmt->fetch();

        if (!$penduduk) {
            sendNotFound('Data penduduk tidak ditemukan.');
        }

        sendSuccess('Data penduduk berhasil dimuat.', $penduduk);
    }

    /**
     * POST /penduduk
     * Tambah data penduduk baru
     */
    public function store(): void {
        AuthMiddleware::requireRole('admin');

        $body = getJsonBody();
        $required = ['nik', 'no_kk', 'nama', 'tempat_lahir', 'tanggal_lahir', 'jenis_kelamin', 'alamat', 'rt_rw', 'dusun', 'agama', 'status_perkawinan', 'pekerjaan'];

        foreach ($required as $field) {
            if (empty($body[$field])) {
                sendError("Field '{$field}' wajib diisi.");
            }
        }

        // Validasi NIK unik
        $stmt = $this->db->prepare('SELECT id FROM penduduk WHERE nik = ?');
        $stmt->execute([$body['nik']]);
        if ($stmt->fetch()) {
            sendError('NIK sudah terdaftar dalam data penduduk.', null, 409);
        }

        $stmt = $this->db->prepare(
            'INSERT INTO penduduk (nik, no_kk, nama, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, rt_rw, dusun, agama, status_perkawinan, pekerjaan, no_hp)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );

        $stmt->execute([
            sanitize($body['nik']),
            sanitize($body['no_kk']),
            sanitize($body['nama']),
            sanitize($body['tempat_lahir']),
            $body['tanggal_lahir'],
            $body['jenis_kelamin'],
            sanitize($body['alamat']),
            sanitize($body['rt_rw']),
            sanitize($body['dusun']),
            sanitize($body['agama']),
            sanitize($body['status_perkawinan']),
            sanitize($body['pekerjaan']),
            sanitize($body['no_hp'] ?? ''),
        ]);

        $id = $this->db->lastInsertId();
        sendSuccess('Data penduduk berhasil ditambahkan.', ['id' => (int) $id], 201);
    }

    /**
     * PUT /penduduk/{id}
     * Update data penduduk
     */
    public function update(int $id): void {
        AuthMiddleware::requireRole('admin');

        $stmt = $this->db->prepare('SELECT id FROM penduduk WHERE id = ?');
        $stmt->execute([$id]);
        if (!$stmt->fetch()) {
            sendNotFound('Data penduduk tidak ditemukan.');
        }

        $body = getJsonBody();
        $required = ['nik', 'no_kk', 'nama', 'tempat_lahir', 'tanggal_lahir', 'jenis_kelamin', 'alamat', 'rt_rw', 'dusun', 'agama', 'status_perkawinan', 'pekerjaan'];

        foreach ($required as $field) {
            if (empty($body[$field])) {
                sendError("Field '{$field}' wajib diisi.");
            }
        }

        // Cek NIK duplikat (exclude diri sendiri)
        $stmt = $this->db->prepare('SELECT id FROM penduduk WHERE nik = ? AND id != ?');
        $stmt->execute([$body['nik'], $id]);
        if ($stmt->fetch()) {
            sendError('NIK sudah digunakan oleh penduduk lain.', null, 409);
        }

        $stmt = $this->db->prepare(
            'UPDATE penduduk SET nik=?, no_kk=?, nama=?, tempat_lahir=?, tanggal_lahir=?, jenis_kelamin=?, alamat=?, rt_rw=?, dusun=?, agama=?, status_perkawinan=?, pekerjaan=?, no_hp=? WHERE id=?'
        );

        $stmt->execute([
            sanitize($body['nik']),
            sanitize($body['no_kk']),
            sanitize($body['nama']),
            sanitize($body['tempat_lahir']),
            $body['tanggal_lahir'],
            $body['jenis_kelamin'],
            sanitize($body['alamat']),
            sanitize($body['rt_rw']),
            sanitize($body['dusun']),
            sanitize($body['agama']),
            sanitize($body['status_perkawinan']),
            sanitize($body['pekerjaan']),
            sanitize($body['no_hp'] ?? ''),
            $id,
        ]);

        sendSuccess('Data penduduk berhasil diperbarui.');
    }

    /**
     * DELETE /penduduk/{id}
     * Hapus data penduduk
     */
    public function destroy(int $id): void {
        AuthMiddleware::requireRole('admin');

        $stmt = $this->db->prepare('SELECT id FROM penduduk WHERE id = ?');
        $stmt->execute([$id]);
        if (!$stmt->fetch()) {
            sendNotFound('Data penduduk tidak ditemukan.');
        }

        $stmt = $this->db->prepare('DELETE FROM penduduk WHERE id = ?');
        $stmt->execute([$id]);

        sendSuccess('Data penduduk berhasil dihapus.');
    }
}
