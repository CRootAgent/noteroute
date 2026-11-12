# NoteRoute 🚀
> **Cross-Device Knowledge Agent & Multi-LLM Gateway Router (Aplikasi Utama)**  
> Proyek 2 – *CRUD & Code Coverage* | D4 Teknik Informatika, Universitas Logistik dan Bisnis Internasional (ULBI)

---

## 👥 Tim Pengembang (Kelompok 12)
- **Ahmad Zakky Nurfauzan** (NPM: 714250028) – Ketua Tim  
  *Modul A: Backend Core Engine, Multi-LLM Router, MongoDB Atlas, Render Cloud, React 18 Web Application, CI/CD Actions*
- **Izat Ibrahimovic Irawan** (NPM: 714250024) – Anggota Tim  
  *Modul B: Native Android Application (Kotlin), Mobile File Explorer & Downloader, Document Chat UI (NotebookLM-Style), Keystore Signing*

**Dosen Pembimbing:** Rolly Maulana Awangga, S.T., M.T., CAIP.  
**Target Deadline Rilis:** 10 November 2026 (v1.0.0)

---

## 🌐 Ekosistem Repositori
1. **`noteroute` (Repo Ini - Aplikasi Utama)**:
   - Backend Express.js REST API & Multi-LLM Gateway Router (`server/`)
   - Frontend Modern React 18 + Vite + Tailwind CSS SPA (`web/`, disajikan langsung di `/`)
   - Aplikasi Android Native Kotlin (`android/`)
   - Deployment Cloud Render (`render.yaml`) & GitHub Actions Auto-Tag Release (`.github/workflows/`)
2. **[`noteroute.home`](https://github.com/CRootAgent/noteroute.home) (Landing Page & Portal Resmi)**:
   - Portal publik & dokumentasi panduan setup (GCP, Render, MongoDB Atlas)
   - Akses live web app dan tombol unduh langsung APK resmi dari GitHub Releases.
   - Hosted di GitHub Pages: [crootagent.github.io/noteroute.home](https://crootagent.github.io/noteroute.home/)

---

## 📂 Struktur Repositori Aplikasi Utama
```
noteroute/
├── web/                # 🌐 Modul A: Modern React 18 + Vite Web App (SPA di /)
├── server/             # 🖥️ Modul A: Express.js REST API, MongoDB Mongoose, AI Router, 35 Tests (87%+ Coverage)
├── android/            # 📱 Modul B: Native Android Kotlin Client (NotebookLM-style, Auto-Release)
├── render.yaml         # ☁️ Konfigurasi Cloud Web Service Render (Free Tier, Singapore)
├── docs/               # 📜 Kontrak API, Data Schema, UI/UX Spec, & Keystore Spec
│   ├── API_CONTRACT.md
│   ├── UI_UX_DESIGN_SPEC.md
│   └── KEYSTORE_AND_SECRETS_SPEC.md
├── .github/            # ⚙️ GitHub Actions Workflow (Auto Tag & Release APK/AAB)
└── PANDUAN_KOLABORASI_ANTI_BENTROK.md # 🤝 Panduan Kolaborasi Git Tim
```

---

## 🚀 Panduan Menjalankan Aplikasi Utama

### 1. Menjalankan Backend & Web App (Fullstack)
```bash
# 1. Masuk ke direktori web dan build React SPA
cd web
npm install
npm run build

# 2. Masuk ke direktori server dan jalankan Express
cd ../server
npm install
npm start
```
Buka browser pada `http://localhost:3000` untuk membuka aplikasi web NoteRoute.

### 2. Menjalankan Unit Test & Code Coverage
```bash
cd server
npm test -- --coverage
```
Hasil: **35 passing tests, >85% Code Coverage**.

### 3. Build & Run Android App (Kotlin)
Buka folder `android/` di Android Studio, lalu jalankan emulator atau sambungkan perangkat fisik untuk menjalankan aplikasi native Kotlin.
Workflows GitHub Actions akan otomatis merilis file `.apk` dan `.aab` ke GitHub Releases setiap kali push atau rilis dibuat.
