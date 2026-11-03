# 📱 MODUL B: NATIVE ANDROID APPLICATION (KOTLIN)
**Domain Pengembang:** Izat Ibrahimovic Irawan (NPM: 714250024)  
**Teknologi:** Android Studio, Kotlin, Gradle Kotlin DSL (`.gradle.kts`), MVVM, Coroutines, StateFlow, Retrofit 2, OkHttp 3, Material Design 3  
**Status Akses:** 🔒 **AREA EKSKLUSIF IZAT** (Zakky Dilarang Mengubah File di Folder Ini)

---

## Panduan Inisialisasi Proyek untuk Izat:
1. Buka **Android Studio**.
2. Pilih **Open** atau **New Project**:
   - Jika membuat project baru: pilih template **Phone and Tablet -> Empty Views Activity** atau **Empty Activity**.
   - Masukkan **Name:** `NoteRoute`
   - Masukkan **Package Name:** `com.noteroute.app`
   - Masukkan **Save location:** arahkan ke folder `.../noteroute/android`
   - Masukkan **Language:** `Kotlin`
   - Masukkan **Build configuration language:** `Kotlin DSL (build.gradle.kts)`
   - Minimum SDK: `API 26 (Android 8.0)` atau `API 28 (Android 9.0)`
3. Struktur paket yang direkomendasikan:
   - `com.noteroute.app.ui.explorer` (File Explorer & Dokumen Laptop)
   - `com.noteroute.app.ui.chat` (Document Chat UI & Citation Badges)
   - `com.noteroute.app.ui.components` (Model Switcher)
   - `com.noteroute.app.data.api` (Retrofit API Service)
   - `com.noteroute.app.data.model` (Data Classes sesuai `../docs/API_CONTRACT.md`)
   - `com.noteroute.app.data.download` (`FileDownloadWorker.kt`)
4. Lihat kontrak API lengkap di `../docs/API_CONTRACT.md` dan panduan signing di `../docs/KEYSTORE_AND_SECRETS_SPEC.md`.
