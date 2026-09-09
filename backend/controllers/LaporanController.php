<?php
/**
 * LaporanController - Statistik & Rekap Pelayanan Surat
 * SIPESPEK - Desa Wangkar Weli
 */

class LaporanController {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    /**
     * GET /laporan/statistik
     * Dashboard stat cards
     */
    public function statistik(): void {
        AuthMiddleware::requireRole(['admin', 'kades']);

        // Total permohonan
        $stmtTotal = $this->db->query('SELECT COUNT(*) FROM permohonan_surat');
        $total = (int) $stmtTotal->fetchColumn();

        // Per status
        $stmtStatus = $this->db->query(
            "SELECT status, COUNT(*) as jumlah FROM permohonan_surat GROUP BY status"
        );
        $statusRows  = $stmtStatus->fetchAll();
        $statusMap   = [];
        foreach ($statusRows as $row) {
            $statusMap[$row['status']] = (int) $row['jumlah'];
        }

        // Per jenis surat
        $stmtJenis = $this->db->query(
            "SELECT js.nama_surat, js.kode_surat, COUNT(ps.id) as jumlah
             FROM jenis_surat js
             LEFT JOIN permohonan_surat ps ON js.id = ps.jenis_surat_id
             GROUP BY js.id"
        );
        $perJenis = $stmtJenis->fetchAll();

        // Total penduduk
        $stmtPenduduk = $this->db->query('SELECT COUNT(*) FROM penduduk');
        $totalPenduduk = (int) $stmtPenduduk->fetchColumn();

        // Total warga terdaftar
        $stmtWarga = $this->db->query('SELECT COUNT(*) FROM users WHERE role = "warga"');
        $totalWarga = (int) $stmtWarga->fetchColumn();

        // Permohonan bulan ini
        $stmtBulanIni = $this->db->query(
            "SELECT COUNT(*) FROM permohonan_surat WHERE MONTH(tanggal_pengajuan) = MONTH(NOW()) AND YEAR(tanggal_pengajuan) = YEAR(NOW())"
        );
        $permohonanBulanIni = (int) $stmtBulanIni->fetchColumn();

        sendSuccess('Statistik berhasil dimuat.', [
            'total_permohonan'       => $total,
            'permohonan_bulan_ini'   => $permohonanBulanIni,
            'total_penduduk'         => $totalPenduduk,
            'total_warga_terdaftar'  => $totalWarga,
            'per_status'             => [
                'pending'            => $statusMap['pending'] ?? 0,
                'diverifikasi_admin' => $statusMap['diverifikasi_admin'] ?? 0,
                'ditolak_admin'      => $statusMap['ditolak_admin'] ?? 0,
                'disetujui_kades'    => $statusMap['disetujui_kades'] ?? 0,
                'ditolak_kades'      => $statusMap['ditolak_kades'] ?? 0,
            ],
            'per_jenis_surat'        => $perJenis,
        ]);
    }

    /**
     * GET /laporan/rekap
     * Rekap permohonan berdasarkan periode dan jenis surat
     * Query params: tanggal_mulai, tanggal_akhir, jenis_surat_id
     */
    public function rekap(): void {
        AuthMiddleware::requireRole(['admin', 'kades']);

        $tanggalMulai  = $_GET['tanggal_mulai']  ?? date('Y-m-01');
        $tanggalAkhir  = $_GET['tanggal_akhir']  ?? date('Y-m-t');
        $jenisSuratId  = (int) ($_GET['jenis_surat_id'] ?? 0);

        $where  = 'WHERE DATE(ps.tanggal_pengajuan) BETWEEN ? AND ?';
        $params = [$tanggalMulai, $tanggalAkhir];

        if ($jenisSuratId > 0) {
            $where  .= ' AND ps.jenis_surat_id = ?';
            $params[] = $jenisSuratId;
        }

        $stmt = $this->db->prepare(
            "SELECT ps.*, js.nama_surat, js.kode_surat,
                    u.nama_lengkap, u.nik
             FROM permohonan_surat ps
             JOIN jenis_surat js ON ps.jenis_surat_id = js.id
             JOIN users u ON ps.user_id = u.id
             {$where}
             ORDER BY ps.tanggal_pengajuan DESC"
        );
        $stmt->execute($params);
        $data = $stmt->fetchAll();

        // Ringkasan
        $summary = [
            'total'            => count($data),
            'disetujui'        => count(array_filter($data, fn($r) => $r['status'] === 'disetujui_kades')),
            'ditolak'          => count(array_filter($data, fn($r) => in_array($r['status'], ['ditolak_admin', 'ditolak_kades']))),
            'pending'          => count(array_filter($data, fn($r) => $r['status'] === 'pending')),
            'dalam_proses'     => count(array_filter($data, fn($r) => $r['status'] === 'diverifikasi_admin')),
        ];

        // Rekap per jenis surat
        $perJenis = [];
        foreach ($data as $row) {
            $key = $row['kode_surat'];
            if (!isset($perJenis[$key])) {
                $perJenis[$key] = ['kode' => $key, 'nama' => $row['nama_surat'], 'jumlah' => 0, 'disetujui' => 0];
            }
            $perJenis[$key]['jumlah']++;
            if ($row['status'] === 'disetujui_kades') {
                $perJenis[$key]['disetujui']++;
            }
        }

        sendSuccess('Laporan rekap berhasil dimuat.', [
            'filter' => [
                'tanggal_mulai' => $tanggalMulai,
                'tanggal_akhir' => $tanggalAkhir,
            ],
            'summary'   => $summary,
            'per_jenis' => array_values($perJenis),
            'data'      => $data,
        ]);
    }

    /**
     * GET /laporan/chart
     * Data chart tren permohonan per bulan (12 bulan terakhir)
     */
    public function chart(): void {
        AuthMiddleware::requireRole(['admin', 'kades']);

        $stmt = $this->db->query(
            "SELECT DATE_FORMAT(tanggal_pengajuan, '%Y-%m') as bulan,
                    COUNT(*) as total,
                    SUM(status = 'disetujui_kades') as disetujui,
                    SUM(status IN ('ditolak_admin','ditolak_kades')) as ditolak
             FROM permohonan_surat
             WHERE tanggal_pengajuan >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
             GROUP BY bulan
             ORDER BY bulan ASC"
        );
        $data = $stmt->fetchAll();

        sendSuccess('Data chart berhasil dimuat.', $data);
    }
}
