# 📱 MODUL B: NATIVE ANDROID APPLICATION (KOTLIN)
**Domain Pengembang:** Izat Ibrahimovic Irawan (NPM: 714250024)  
**Teknologi:** Android Studio, Kotlin 1.9.23, Gradle Kotlin DSL (`.gradle.kts`), MVVM, Coroutines, StateFlow, Retrofit 2, OkHttp 3, Material Design 3, WorkManager  
**Status Akses:** 🔒 **AREA EKSKLUSIF IZAT** (Zakky Dilarang Mengubah File di Folder Ini)

---

## 🚀 Fitur & Implementasi Modul B yang Selesai Dikerjakan:

### 1. 📁 Documents Explorer ("Ambil File dari Laptop" - TC-07)
- **Paket:** `com.noteroute.app.ui.explorer`
- **Komponen:** `ExplorerFragment`, `ExplorerViewModel`, `DocumentAdapter`
- **Fitur:**
  - Menampilkan daftar berkas laptop (PDF, Markdown, DOCX, TXT) dengan semantic badge warna kontras.
  - Menampilkan metadata ukuran berkas yang terformat, status sinkronisasi, dan ringkasan eksekutif.
  - Pencarian / filter realtime berdasarkan nama berkas dan isi ringkasan.
  - Pull-to-refresh (`SwipeRefreshLayout`) untuk sinkronisasi instan ke server laptop.

### 2. 💾 File Download Stream ("Unduh ke Memori HP" - TC-08)
- **Paket:** `com.noteroute.app.data.download` & `com.noteroute.app.utils.FileUtils`
- **Komponen:** `FileDownloadWorker`, `FileUtils.saveStreamToFile`
- **Fitur:**
  - Streaming download langsung dari endpoint `GET /documents/:id/download` ke penyimpanan perangkat (`Downloads`).
  - Penanganan progress bar animasi pada kartu dokumen.
  - Penanganan galat jika file tidak ditemukan (`404 FILE_NOT_FOUND`).

### 3. 💬 Grounded AI Document Chat & Multi-Model Inference (TC-09)
- **Paket:** `com.noteroute.app.ui.chat`
- **Komponen:** `ChatFragment`, `ChatViewModel`, `ChatAdapter`
- **Fitur:**
  - Antarmuka obrolan ala Google NotebookLM dengan bubble obrolan user vs AI.
  - Menampilkan badge model yang digunakan (`gemini-1.5-flash`, `llama-3.3-70b-versatile`, dll.) beserta latensi dalam milidetik.
  - Indikator berpikir (*Thinking & searching documents...*).
  - Chip *Suggested Prompts* untuk pertanyaan cepat ("Apa kesimpulan bab 3?", "Jelaskan teorema CAP", dll.).
  - Multi-turn conversation history persistence via `ChatMessageHistory`.

### 4. 📑 Citation Badges & Reference Inspector (TC-10)
- **Paket:** `com.noteroute.app.ui.components`
- **Komponen:** `CitationInspectorBottomSheet`, `item_citation_badge.xml`
- **Fitur:**
  - Setiap jawaban AI menyertakan chip sitasi interaktif (`[Slide_Bab3_Distributed_Systems.pdf : Hal 14]`).
  - Menekan chip sitasi membuka BottomSheet modal verifikasi referensi dokumen asli beserta nomor halaman dan cuplikan teks lengkap (*grounding trust*).

### 5. 🏥 Health Check & Multi-Environment Switcher (TC-11)
- **Paket:** `com.noteroute.app.ui.status`
- **Komponen:** `StatusFragment`, `StatusViewModel`, `ApiClient`
- **Fitur:**
  - Memeriksa konektivitas backend engine dan status database (`GET /health`).
  - Pemilihan Base URL fleksibel: Cloud Production LocalTunnel (`https://noteroute-zakky.loca.lt/api/`), Android Studio Emulator `10.0.2.2`, atau Custom IP WiFi LAN laptop.
  - Dilengkapi otomatis dengan header `Bypass-Tunnel-Reminder: true` di Retrofit OkHttp untuk melewati konfirmasi LocalTunnel tanpa hambatan.
  - Tampilan metrik efisiensi token dan estimasi penghematan biaya.

### 6. 🔀 Multi-LLM Switcher & Auto-Failover Shield (TC-12)
- **Paket:** `com.noteroute.app.ui.components` & `com.noteroute.app.data.model.AiModel`
- **Komponen:** `ModelSwitcherBottomSheet`, `AiModel` enum
- **Fitur:**
  - Transisi instan antara **Google Gemini 1.5 Flash**, **Groq Llama 3.3**, **DeepSeek R1**, dan **9Router Local (port 20128)**.
  - Indikator Auto-Failover Shield jika model utama terkena pembatasan kuota (*Rate Limit 429*).

### 7. 🔐 Release Keystore Signing Configuration
- Konfigurasi `signingConfigs.create("release")` di `android/app/build.gradle.kts` otomatis mendeteksi keystore baik pada pipeline GitHub Actions CI/CD (`release.keystore`) maupun lokal (`note-route-release.jks`).
- Telah dibuatkan berkas keystore `note-route-release.jks` dan konversi Base64 siap pakai di `keystore_base64.txt`.

---

## 🧪 Unit Test Suite (TC-07 s/d TC-12)
Semua skenario pengujian unit test telah diimplementasikan di `app/src/test/java/com/noteroute/app/`:
- `TC07_DocumentsExplorerTest.kt` (Parsing response dokumen, format ukuran berkas, filter keyword)
- `TC08_FileDownloadTest.kt` (Streaming download progress tracking, penanganan envelope error 404)
- `TC09_DocumentChatInferenceTest.kt` (Serialisasi ChatRequest, deserialisasi respons inferensi, riwayat chat)
- `TC10_CitationBadgesTest.kt` (Ekstraksi sitasi dokumen, format lencana sitasi, pemetaan nomor halaman)
- `TC11_HealthCheckConnectivityTest.kt` (Pemeriksaan status server healthy, koneksi DB, validasi URL)
- `TC12_KeystoreAndModelSwitcherTest.kt` (Mapping target key AI, verifikasi alias & spesifikasi keystore, logika failover)

---

## 🛠️ Cara Menjalankan Aplikasi:
1. Buka folder `noteroute/android` di **Android Studio**.
2. Biarkan Gradle melakukan sinkronisasi otomatis.
3. Jalankan ke Emulator atau HP fisik Android (API 26+).
4. Untuk pengujian unit test:
   ```bash
   ./gradlew testDebugUnitTest
   ```
5. Untuk build release bertanda tangan (Signed APK):
   ```bash
   ./gradlew assembleRelease
   ```
