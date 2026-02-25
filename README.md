# Projek Praktik Cloud Computing - Modul Presensi QR Dinamis (Versi A)

Proyek ini adalah implementasi sistem presensi menggunakan QRCode dinamis berbasis Google Apps Script (GAS) dan Google Sheets. 

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

Berikut adalah alur pengujian demo sesuai dengan spesifikasi proyek:

1. **Generate QR Token (Peran Dosen):**
   * Lakukan HTTP `POST` ke endpoint `?path=presence/qr/generate` dengan payload `course_id` dan `session_id`.
   * Sistem akan mengembalikan `qr_token` yang berlaku selama 2 menit (disimpan sementara di CacheService).
   * *Dalam skenario nyata, token ini di-generate menjadi gambar QR Code dan ditampilkan di proyektor kelas.*

2. **Scan & Check-in (Peran Mahasiswa):**
   * Buka file UI HTML Frontend (Aplikasi Presensi QR Mahasiswa).
   * Masukkan NIM ke dalam kolom input.
   * Klik **"Mulai Scan"** dan arahkan kamera ke QR Code yang berisi `qr_token`.
   * Aplikasi frontend akan secara otomatis memanggil endpoint `POST ?path=presence/checkin` dan mengirimkan identitas beserta token ke server.
   * Jika sukses, layar mahasiswa akan menampilkan status **"✅ Check-in Berhasil"** beserta ID Presensi.

3. **Verifikasi Status (Peran Dosen/Sistem):**
   * Dosen dapat memanggil endpoint `GET ?path=presence/status` dengan menyertakan parameter `user_id`, `course_id`, dan `session_id`.
   * Server akan membaca Google Sheets dan mengembalikan JSON berisi informasi mahasiswa dengan `status: "checked_in"`.

## 📄 Contoh Request & Response JSON

Sesuai dengan API Contract Simple v1, request dan response menggunakan format JSON. Timestamp wajib menggunakan format ISO-8601.

**1. Generate QR Token**
* **POST** `?path=presence/qr/generate`
* **Request:** `{"course_id": "cloud-101", "session_id": "sesi-02", "ts": "2026-02-18T10:00:00Z"}`
* **Response:** `{"ok": true, "data": {"qr_token": "TKN-8F2A19ab", "expires_at": "2026-02-18T10:02:00.000Z"}}`

**2. Check-in**
* **POST** `?path=presence/checkin`
* **Request:** `{"user_id": "12345678", "device_id": "dev-001", "course_id": "cloud-101", "session_id": "sesi-02", "qr_token": "TKN-8F2A19ab", "ts": "2026-02-18T10:01:10Z"}`
* **Response:** `{"ok": true, "data": {"presence_id": "PR-0001", "status": "checked_in"}}`

**3. Cek Status**
* **GET** `?path=presence/status&user_id=12345678&course_id=cloud-101&session_id=sesi-02`
* **Response:** `{"ok": true, "data": {"user_id": "12345678", "course_id": "cloud-101", "session_id": "sesi-02", "status": "checked_in", "last_ts": "2026-02-18T10:01:10Z"}}`