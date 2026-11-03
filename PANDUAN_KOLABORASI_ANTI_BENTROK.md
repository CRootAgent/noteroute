# 🤝 PROTOKOL KOLABORASI ANTI-BENTROK (ZERO-COLLISION GUIDE)
**Proyek:** NoteRoute (*Cross-Device Knowledge Agent & Multi-LLM Gateway*)  
**Mata Kuliah:** Proyek 2 – *CRUD & Code Coverage* (D4 Teknik Informatika ULBI)  
**Pengembang:**
- 🛡️ **Ahmad Zakky Nurfauzan (NPM: 714250028)** – Ketua Tim (Modul A: Backend, Cloud, CI/CD, Landing Page)
- 📱 **Izat Ibrahimovic Irawan (NPM: 714250024)** – Anggota Tim (Modul B: Native Android Kotlin, Mobile Explorer, Chat UI, Keystore)

---

## 1. PRINSIP ISOLASI FOLDER MUTLAK (PHYSICAL SEPARATION)

Repositori NoteRoute menggunakan model struktur monorepo terisolasi. Setiap pengembang memiliki folder eksklusifnya masing-masing.

```
noteroute/
├── .github/
│   ├── CODEOWNERS              <-- [ZAKKY] Penjaga hak akses file otomatis
│   └── workflows/              <-- [ZAKKY] android-release.yml & backend-ci.yml
│
├── android/                    <-- 🔒 [EKSKLUSIF IZAT]
│   ├── app/
│   │   ├── build.gradle.kts
│   │   └── src/
│   │       ├── main/java/com/noteroute/app/
│   │       │   ├── ui/         (Explorer, Chat, Components)
│   │       │   ├── data/       (API, Model, DownloadWorker)
│   │       │   └── ...
│   │       └── test/java/com/noteroute/app/ (Unit Test TC-07 s/d TC-12)
│   └── settings.gradle.kts
│
├── server/                     <-- 🔒 [EKSKLUSIF ZAKKY]
│   ├── routes/                 (documents.js, router.js, workspaces.js)
│   ├── services/               (llmRouterService.js, documentParser.js)
│   ├── config/                 (db.js)
│   ├── tests/                  (zakky-router-ingest.test.js)
│   └── package.json
│
├── landing/                    <-- 🔒 [EKSKLUSIF ZAKKY]
│   ├── index.html              (Landing page, panduan setup, tombol download APK)
│   └── src/
│
├── docs/                       <-- 🤝 [KONTRAK BERSAMA - SINGLE SOURCE OF TRUTH]
│   ├── API_CONTRACT.md         (Spesifikasi Endpoint, JSON Schema & Kotlin Model)
│   └── KEYSTORE_AND_SECRETS_SPEC.md (Spesifikasi Keystore & CI/CD Secrets)
│
├── .gitignore                  <-- [BERSAMA - SUDAH DIKONFIGURASI LENGKAP]
├── .gitattributes              <-- [BERSAMA - NORMALISASI LF/CRLF ANTI-DIFF PALSU]
└── README.md                   <-- [BERSAMA]
```

### 🛑 TABEL ATURAN NO-TOUCH ZONE (HAK AKSES)

| Folder / File | Pemilik Utama | Izat Boleh Ubah? | Zakky Boleh Ubah? | Keterangan |
| :--- | :--- | :---: | :---: | :--- |
| `android/**` | **Izat** | ✅ **Bebas** | ❌ **Dilarang** | Zakky hanya boleh membaca untuk kebutuhan build script CI/CD. |
| `server/**` | **Zakky** | ❌ **Dilarang** | ✅ **Bebas** | Izat hanya mengonsumsi via REST API HTTP. |
| `landing/**` | **Zakky** | ❌ **Dilarang** | ✅ **Bebas** | Halaman promosi & unduh APK. |
| `.github/workflows/**` | **Zakky** | ❌ **Dilarang** | ✅ **Bebas** | Otomasi pengujian dan rilis build. |
| `docs/API_CONTRACT.md` | **Bersama** | ⚠️ **Harus Diskusi** | ⚠️ **Harus Diskusi** | Kontrak schema JSON. Tidak boleh diubah sepihak. |
| `docs/KEYSTORE_...md` | **Bersama** | ⚠️ **Harus Diskusi** | ⚠️ **Harus Diskusi** | Format secret signing rilis. |
| `.gitignore` & `.gitattributes` | **Bersama** | ⚠️ **Harus Diskusi** | ⚠️ **Harus Diskusi** | Sudah disetup lengkap universal. |

---

## 2. STRATEGI GIT BRANCHING & WORKFLOW KERJA

Untuk memastikan tidak terjadi tabrakan commit atau *merge conflicts*:

### 🚫 Aturan #1: DILARANG KERAS `git push origin main` Langsung!
Semua pekerjaan wajib dilakukan pada branch masing-masing. Branch `main` hanya digunakan untuk menggabungkan kode yang sudah stabil via Pull Request (PR).

### 🌿 Pembagian Branch:
1. **Branch Zakky:** `feat/zakky-backend` (atau `feat/zakky-landing`, `feat/zakky-cicd`)
2. **Branch Izat:** `feat/izat-android-core` (atau `feat/izat-ui-chat`, `feat/izat-downloader`)

---

### 💻 ALUR KERJA HARIAN ZAKKY:
```bash
# 1. Pastikan branch main selalu terupdate
git checkout main
git pull origin main

# 2. Bikin/pindah ke branch fitur Zakky
git checkout -b feat/zakky-backend
# (atau jika branch sudah ada: git checkout feat/zakky-backend)

# 3. Koding di dalam folder server/, landing/, atau .github/
# 4. Simpan perubahan ke Git
git add server/ landing/ .github/
git commit -m "feat(server): implement llm router heuristic failover TC-04"

# 5. Push ke GitHub pada branch sendiri
git push origin feat/zakky-backend

# 6. Buat Pull Request (PR) di GitHub ke branch main
```

---

### 💻 ALUR KERJA HARIAN IZAT:
```bash
# 1. Pastikan branch main selalu terupdate
git checkout main
git pull origin main

# 2. Bikin/pindah ke branch fitur Izat
git checkout -b feat/izat-android-core
# (atau jika branch sudah ada: git checkout feat/izat-android-core)

# 3. Buka Android Studio pada folder noteroute/android
# 4. Koding di dalam folder android/
# 5. Simpan perubahan ke Git
git add android/
git commit -m "feat(android): implement file explorer UI and document preview TC-07"

# 6. Push ke GitHub pada branch sendiri
git push origin feat/izat-android-core

# 7. Buat Pull Request (PR) di GitHub ke branch main
```

---

## 3. PENGEMBANGAN PARALEL & MOCKING (INDEPENDENT TESTING)

Bagaimana agar Izat tidak terhambat jika Zakky belum selesai deploy backend, dan Zakky tidak terhambat jika aplikasi Android belum jadi?

### A. Untuk Izat (Android Consumer):
1. **Gunakan Data Classes Resmi:** Buka `docs/API_CONTRACT.md`, seluruh model data Kotlin sudah tersedia di bagian 4.
2. **Mock Response Retrofit:** Buat `MockInterceptor` OkHttp atau gunakan JSON lokal di `app/src/test/resources/` untuk menguji tampilan UI File Explorer dan Chat tanpa perlu menunggu server backend online.
3. **Uji Langsung via Emulator / HP:** Begitu Zakky selesai deploy ke Alwaysdata (`https://noteroute.alwaysdata.net/api`), cukup ganti `BASE_URL` di satu file konstanta (`Constants.kt`).

### B. Untuk Zakky (Backend Provider):
1. **Uji Endpoint Mandiri:** Gunakan Jest & Supertest pada `server/tests/zakky-router-ingest.test.js` untuk menguji endpoint secara otomatis tanpa butuh antarmuka Android.
2. **Uji Manual:** Gunakan Postman, Thunder Client, atau `curl` untuk memastikan response JSON 100% cocok dengan `docs/API_CONTRACT.md`.

---

## 4. PROTOKOL PERUBAHAN KONTRAK DATA (IF CONTRACT CHANGES)

Jika di tengah jalan Zakky atau Izat merasa perlu menambahkan field baru (misalnya ingin menambahkan `category` pada dokumen):

1. **JANGAN LANGSUNG CODING!**
2. Hubungi rekan tim (WhatsApp / Discord / tatap muka).
3. Buat kesepakatan: nama field, tipe data, opsional/wajib.
4. Perbarui file `docs/API_CONTRACT.md` terlebih dahulu.
5. Baru masing-masing mengupdate kodenya di `server/` dan `android/`.

---

## 5. APA YANG HARUS DILAKUKAN JIKA MERGE CONFLICT TERJADI?

Jika Anda melihat pesan peringatan Git:
```
CONFLICT (content): Merge conflict in ...
Automatic merge failed; fix conflicts and then commit the result.
```

**Jangan Panik! Ikuti langkah tenang ini:**
1. Cek file mana yang konflik dengan perintah:
   ```bash
   git status
   ```
2. Karena folder Zakky (`server/`, `landing/`) dan folder Izat (`android/`) sudah dipisah secara fisik, file yang mungkin konflik **HANYA** file root seperti `README.md`.
3. Buka file tersebut di Visual Studio Code / Android Studio.
4. Pilih **"Accept Current Change"**, **"Accept Incoming Change"**, atau **"Accept Both Changes"**.
5. Simpan file, lalu jalankan:
   ```bash
   git add <nama-file-yang-dibereskan>
   git commit -m "chore: resolve merge conflict in README.md"
   git push
   ```

---

## 6. SINKRONISASI HARIAN MENUJU 10 NOVEMBER 2026

Setiap hari jam 09.00 / 20.00 WIB, lakukan sinkronisasi kilat 5 menit:
1. **Zakky laporkan:** "Hari ini modul backend X selesai, endpoint Y sudah aktif di Alwaysdata."
2. **Izat laporkan:** "Hari ini UI modul Z selesai, Retrofit sudah terhubung ke endpoint Y."
3. **Tarik perubahan terbaru:** Jalankan `git checkout main && git pull origin main` di laptop masing-masing sebelum mulai koding sesi baru.
