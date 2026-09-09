<?php
/**
 * CetakSuratController - Generate PDF Surat Pengantar
 * SIPESPEK - Desa Wangkar Weli
 */

use Dompdf\Dompdf;
use Dompdf\Options;

class CetakSuratController {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    /**
     * GET /cetak/{id}
     * Generate dan stream PDF Surat Pengantar Kependudukan
     */
    public function cetak(int $id): void {
        $authUser = AuthMiddleware::authenticate();

        // Ambil detail permohonan beserta info penduduk
        $stmt = $this->db->prepare(
            "SELECT ps.*, js.nama_surat, js.kode_surat,
                    u.nama_lengkap, u.nik as user_nik, u.no_hp, u.alamat as user_alamat,
                    p.tempat_lahir, p.tanggal_lahir, p.jenis_kelamin,
                    p.rt_rw, p.dusun, p.no_kk, p.agama, p.status_perkawinan, p.pekerjaan,
                    p.alamat as alamat_penduduk
             FROM permohonan_surat ps
             JOIN jenis_surat js ON ps.jenis_surat_id = js.id
             JOIN users u ON ps.user_id = u.id
             LEFT JOIN penduduk p ON u.nik = p.nik
             WHERE ps.id = ? AND ps.status = 'disetujui_kades'"
        );
        $stmt->execute([$id]);
        $data = $stmt->fetch();

        if (!$data) {
            sendError('Surat tidak ditemukan atau belum mendapat persetujuan akhir.', null, 404);
        }

        // Warga hanya bisa cetak milik sendiri
        if ($authUser->role === 'warga' && (int) $data['user_id'] !== $authUser->id) {
            sendForbidden('Anda tidak memiliki akses untuk mencetak surat ini.');
        }

        $html = $this->buildSuratHtml($data);

        $options = new Options();
        $options->set('isHtml5ParserEnabled', true);
        $options->set('isPhpEnabled', false);
        $options->set('defaultFont', 'Times New Roman');
        $options->set('isFontSubsettingEnabled', true);

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html, 'UTF-8');
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        $filename = 'Surat_' . $data['kode_surat'] . '_' . str_replace('/', '-', $data['nomor_surat_resmi']) . '.pdf';

        $dompdf->stream($filename, ['Attachment' => false]);
        exit;
    }

    /**
     * Build HTML template surat pengantar
     */
    private function buildSuratHtml(array $data): string {
        $tglLahir = !empty($data['tanggal_lahir'])
            ? date('d F Y', strtotime($data['tanggal_lahir']))
            : '-';

        $tglPersetujuan = !empty($data['tanggal_persetujuan'])
            ? date('d F Y', strtotime($data['tanggal_persetujuan']))
            : date('d F Y');

        $tglSurat = date('d F Y');

        $jenisKelamin = $data['jenis_kelamin'] === 'L' ? 'Laki-laki' : 'Perempuan';

        $alamat = $data['alamat_penduduk'] ?? $data['user_alamat'] ?? '-';

        $nomorSurat = htmlspecialchars($data['nomor_surat_resmi'] ?? '-');
        $namaSurat  = htmlspecialchars($data['nama_surat']);
        $namaPemohon = htmlspecialchars(strtoupper($data['nama_lengkap']));
        $nik        = htmlspecialchars($data['user_nik'] ?? '-');
        $noKk       = htmlspecialchars($data['no_kk'] ?? '-');
        $ttl        = htmlspecialchars(($data['tempat_lahir'] ?? '-') . ', ' . $tglLahir);
        $agama      = htmlspecialchars($data['agama'] ?? '-');
        $pekerjaan  = htmlspecialchars($data['pekerjaan'] ?? '-');
        $statusPernikahan = htmlspecialchars($data['status_perkawinan'] ?? '-');
        $rtRw       = htmlspecialchars($data['rt_rw'] ?? '-');
        $dusun      = htmlspecialchars($data['dusun'] ?? '-');
        $keperluan  = htmlspecialchars($data['keperluan'] ?? $namaSurat);

        return <<<HTML
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8"/>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            color: #000;
            background: #fff;
            padding: 0;
            margin: 0;
        }
        .page {
            width: 100%;
            padding: 1.5cm 2cm 2cm 2.5cm;
        }
        /* === KOP SURAT === */
        .kop {
            display: flex;
            flex-direction: row;
            align-items: center;
            border-bottom: 4px solid #000;
            padding-bottom: 8px;
            margin-bottom: 16px;
        }
        .kop-logo {
            width: 80px;
            margin-right: 16px;
        }
        .kop-logo img { width: 80px; height: 80px; }
        .kop-text { flex: 1; text-align: center; }
        .kop-text .pemerintah { font-size: 11pt; }
        .kop-text .desa { font-size: 18pt; font-weight: bold; text-transform: uppercase; }
        .kop-text .kecamatan { font-size: 11pt; }
        .kop-text .alamat { font-size: 9pt; margin-top: 2px; }
        /* === JUDUL SURAT === */
        .judul {
            text-align: center;
            margin: 20px 0 4px 0;
        }
        .judul h2 {
            font-size: 14pt;
            font-weight: bold;
            text-decoration: underline;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .nomor-surat {
            text-align: center;
            font-size: 11pt;
            margin-bottom: 20px;
        }
        /* === PEMBUKA === */
        .pembuka { margin-bottom: 12px; line-height: 1.8; }
        /* === DATA TABEL === */
        .data-tabel {
            width: 100%;
            margin: 12px 0 16px 0;
        }
        .data-tabel tr td {
            padding: 3px 6px;
            vertical-align: top;
            font-size: 11.5pt;
        }
        .data-tabel tr td:first-child { width: 40%; }
        .data-tabel tr td:nth-child(2) { width: 5%; text-align: center; }
        .data-tabel tr td:last-child { width: 55%; }
        /* === PENUTUP === */
        .penutup { line-height: 1.8; margin-bottom: 20px; }
        /* === TANDA TANGAN === */
        .ttd-section {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            margin-top: 30px;
        }
        .ttd-box { text-align: center; width: 40%; }
        .ttd-box .jabatan { font-size: 11pt; margin-bottom: 60px; }
        .ttd-box .nama { font-weight: bold; text-decoration: underline; font-size: 11pt; }
        .ttd-box .nip { font-size: 10pt; }
        .stempel-placeholder {
            width: 80px; height: 80px;
            border: 2px dashed #999;
            margin: 0 auto 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 8pt;
            color: #999;
        }
        /* === FOOTER === */
        .footer {
            margin-top: 24px;
            border-top: 1px solid #000;
            padding-top: 6px;
            font-size: 9pt;
            color: #444;
            text-align: center;
        }
    </style>
</head>
<body>
<div class="page">
    <!-- KOP SURAT -->
    <table class="kop" style="width:100%; border-collapse:collapse; border-bottom: 4px solid #000; margin-bottom:16px;">
        <tr>
            <td style="width:90px; text-align:center; vertical-align:middle; padding-right:10px;">
                <!-- Logo placeholder -->
                <div style="width:75px; height:75px; border:1px solid #ccc; display:inline-block; line-height:75px; text-align:center; font-size:8pt; color:#888;">LOGO<br>DESA</div>
            </td>
            <td style="text-align:center; vertical-align:middle;">
                <div style="font-size:11pt;">PEMERINTAH KABUPATEN MINAHASA UTARA</div>
                <div style="font-size:11pt;">KECAMATAN WORI</div>
                <div style="font-size:20pt; font-weight:bold; text-transform:uppercase; letter-spacing:1px;">DESA WANGKAR WELI</div>
                <div style="font-size:9pt; margin-top:2px;">Jl. Desa Wangkar Weli, Kecamatan Wori, Kab. Minahasa Utara, Sulawesi Utara</div>
                <div style="font-size:9pt;">Telp. (0431) XXXXXX | Email: desa.wangkarweli@gmail.com</div>
            </td>
        </tr>
    </table>

    <!-- JUDUL SURAT -->
    <div class="judul">
        <h2>{$namaSurat}</h2>
    </div>
    <div class="nomor-surat">Nomor: {$nomorSurat}</div>

    <!-- PEMBUKA -->
    <div class="pembuka">
        Yang bertanda tangan di bawah ini, Kepala Desa Wangkar Weli, Kecamatan Wori, Kabupaten Minahasa Utara, Provinsi Sulawesi Utara, dengan ini menerangkan bahwa:
    </div>

    <!-- DATA PEMOHON -->
    <table class="data-tabel">
        <tr><td>Nama Lengkap</td><td>:</td><td><strong>{$namaPemohon}</strong></td></tr>
        <tr><td>NIK</td><td>:</td><td>{$nik}</td></tr>
        <tr><td>No. Kartu Keluarga</td><td>:</td><td>{$noKk}</td></tr>
        <tr><td>Tempat, Tanggal Lahir</td><td>:</td><td>{$ttl}</td></tr>
        <tr><td>Jenis Kelamin</td><td>:</td><td>{$jenisKelamin}</td></tr>
        <tr><td>Agama</td><td>:</td><td>{$agama}</td></tr>
        <tr><td>Pekerjaan</td><td>:</td><td>{$pekerjaan}</td></tr>
        <tr><td>Status Perkawinan</td><td>:</td><td>{$statusPernikahan}</td></tr>
        <tr><td>RT/RW</td><td>:</td><td>{$rtRw}</td></tr>
        <tr><td>Dusun</td><td>:</td><td>{$dusun}</td></tr>
        <tr><td>Alamat</td><td>:</td><td>{$alamat}</td></tr>
    </table>

    <!-- PENUTUP -->
    <div class="penutup">
        Adalah benar penduduk Desa Wangkar Weli dan telah terdaftar dalam administrasi kependudukan kami. Surat keterangan ini diberikan kepada yang bersangkutan untuk keperluan <strong>{$keperluan}</strong> dan dipergunakan sebagaimana mestinya.
        <br/><br/>
        Demikian surat keterangan ini dibuat dengan sebenar-benarnya untuk dapat dipergunakan sebagaimana mestinya.
    </div>

    <!-- TANGGAL DAN TANDA TANGAN -->
    <div style="margin-top:20px;">
        <table style="width:100%;">
            <tr>
                <td style="width:50%;"></td>
                <td style="width:50%; text-align:center;">
                    Wangkar Weli, {$tglSurat}
                    <br/><br/>
                    <div style="font-weight:bold;">KEPALA DESA WANGKAR WELI</div>
                    <br/><br/><br/><br/>
                    <div style="font-weight:bold; text-decoration:underline; font-size:12pt;">KEPALA DESA WANGKAR WELI</div>
                    <div style="font-size:10pt;">NIP. -</div>
                </td>
            </tr>
        </table>
    </div>

    <!-- FOOTER -->
    <div class="footer">
        Dokumen ini diterbitkan secara resmi oleh Sistem Informasi Desa Wangkar Weli (SIPESPEK) | Dicetak pada: {$tglPersetujuan}
    </div>
</div>
</body>
</html>
HTML;
    }
}
