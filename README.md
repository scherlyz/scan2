# Projek Praktik Komputasi Awan - Modul Presensi QR Dinamis (Versi A)

[cite_start]Proyek ini adalah implementasi sistem presensi menggunakan QRCode dinamis berbasis Google Apps Script (GAS) dan Google Sheets[cite: 7, 85]. 

## 🔗 Base URL
Semua request API ditujukan ke URL berikut:
`https://script.google.com/macros/s/AKfycbzBM2tZu5jvx-ie2OiIvCCvGpiycos9npwRZ117Guy8mKn4n4QUhF88_7QNHbANF1_u/exec` 

*(Catatan: Gunakan parameter `?path=...` untuk mengakses endpoint spesifik, contoh: `?path=presence/qr/generate`)*.

## 🗄️ Struktur Database (Google Sheets)
Backend menyimpan data presensi pada sheet bernama `cloud1`. Urutan kolom **wajib** dipertahankan sebagai berikut agar API tidak error:
* A: `presence_id`
* B: `user_id`
* C: `course_id`
* D: `session_id`
* E: `qr_token`
* F: `device_id`
* G: `status`
* H: `last_ts`

## 🚀 Cara Menjalankan Demo (End-to-End)

[cite_start]Berikut adalah alur pengujian demo sesuai dengan spesifikasi proyek:

1. [cite_start]**Generate QR Token (Peran Dosen):** [cite: 87]
   * Lakukan HTTP `POST` ke endpoint `?path=presence/qr/generate` dengan payload `course_id` dan `session_id`.
   * Sistem akan mengembalikan `qr_token` yang berlaku selama 2 menit (disimpan sementara di CacheService).
   * [cite_start]*Dalam skenario nyata, token ini di-generate menjadi gambar QR Code dan ditampilkan di proyektor kelas[cite: 88].*

2. [cite_start]**Scan & Check-in (Peran Mahasiswa):** [cite: 89, 90]
   * Buka file UI HTML Frontend (Aplikasi Presensi QR Mahasiswa).
   * Masukkan NIM ke dalam kolom input.
   * [cite_start]Klik **"Mulai Scan"** dan arahkan kamera ke QR Code yang berisi `qr_token`[cite: 89].
   * [cite_start]Aplikasi frontend akan secara otomatis memanggil endpoint `POST ?path=presence/checkin` dan mengirimkan identitas beserta token ke server[cite: 90].
   * [cite_start]Jika sukses, layar mahasiswa akan menampilkan status **"✅ Check-in Berhasil"** beserta ID Presensi[cite: 103].

3. [cite_start]**Verifikasi Status (Peran Dosen/Sistem):** [cite: 93]
   * Dosen dapat memanggil endpoint `GET ?path=presence/status` dengan menyertakan parameter `user_id`, `course_id`, dan `session_id`.
   * [cite_start]Server akan membaca Google Sheets dan mengembalikan JSON berisi informasi mahasiswa dengan `status: "checked_in"`[cite: 104].

## 📄 Contoh Request & Response JSON

[cite_start]Sesuai dengan API Contract Simple v1, request dan response menggunakan format JSON[cite: 55]. [cite_start]Timestamp wajib menggunakan format ISO-8601[cite: 57].

**1. Generate QR Token**
* [cite_start]**POST** `?path=presence/qr/generate` [cite: 107]
* [cite_start]**Request:** `{"course_id": "cloud-101", "session_id": "sesi-02", "ts": "2026-02-18T10:00:00Z"}` [cite: 109, 110, 111, 112]
* **Response:** `{"ok": true, "data": {"qr_token": "TKN-8F2A19ab", "expires_at": "2026-02-18T10:02:00.000Z"}}`

**2. Check-in**
* [cite_start]**POST** `?path=presence/checkin` [cite: 125]
* [cite_start]**Request:** `{"user_id": "12345678", "device_id": "dev-001", "course_id": "cloud-101", "session_id": "sesi-02", "qr_token": "TKN-8F2A19ab", "ts": "2026-02-18T10:01:10Z"}` [cite: 128, 129, 130, 131, 132, 133, 134]
* [cite_start]**Response:** `{"ok": true, "data": {"presence_id": "PR-0001", "status": "checked_in"}}` [cite: 138, 139, 140, 141]

**3. Cek Status**
* [cite_start]**GET** `?path=presence/status&user_id=12345678&course_id=cloud-101&session_id=sesi-02` [cite: 146]
* [cite_start]**Response:** `{"ok": true, "data": {"user_id": "12345678", "course_id": "cloud-101", "session_id": "sesi-02", "status": "checked_in", "last_ts": "2026-02-18T10:01:10Z"}}` [cite: 149, 150, 151, 152, 153, 154, 155]