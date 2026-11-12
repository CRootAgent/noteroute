# 🖥️ MODUL A: BACKEND REST API & MULTI-LLM GATEWAY ROUTER

**Pengembang:** Ahmad Zakky Nurfauzan (NPM: **714250028**) – Ketua Tim  
**Mata Kuliah:** Proyek 2 – *CRUD & Code Coverage*  
**Dosen Pembimbing:** Rolly Maulana Awangga, S.T., M.T., CAIP.  
**Teknologi:** Node.js (v20+), Express.js, MongoDB Atlas, Mongoose, Jest, Supertest  
**Status Akses:** 🔒 **AREA EKSKLUSIF ZAKKY** (Izat Dilarang Mengubah File di Folder Ini)

---

## 📌 Ringkasan Modul A
Modul A menangani fondasi sistem NoteRoute:
1. **Document Ingestion Pipeline:** Ekstraksi teks dari berkas laptop (PDF, DOCX, TXT, Markdown) untuk grounding RAG.
2. **Multi-LLM Gateway Router:**
   - Integrasi langsung Google Gemini 1.5 Flash (Kapasitas 1 Juta token gratis).
   - Integrasi langsung Groq Cloud API (Llama 3.3 70B kilat).
   - Integrasi DeepSeek reasoning.
   - Bridge ke 9Router / OmniRoute lokal (`http://localhost:20128/v1`).
   - Algoritma **Smart Heuristic Failover** otomatis saat terkena status HTTP 429 (*Rate Limit*).
3. **Endpoint Streaming File Download:** Memungkinkan aplikasi HP mengunduh berkas fisik laptop ke penyimpanan HP.
4. **Token & Cost Efficiency Metric:** Menghitung akumulasi token dan estimasi biaya yang dihemat ($ USD & Rp IDR).
5. **Testing & Code Coverage:** 27 test cases otomatis dengan target coverage $\ge 80\%$.

---

## 🗂️ Struktur Direktori Backend

```
server/
├── config/
│   └── db.js                        # Koneksi MongoDB Atlas & Mongoose Models (Workspace, Document, AIEndpoint, etc.)
├── routes/
│   ├── workspaces.js                # CRUD Workspace
│   ├── documents.js                 # CRUD Dokumen, upload multipart, ekstraksi teks, stream download
│   └── router.js                    # Multi-LLM chat, Smart Failover, metrics, provider endpoints
├── services/
│   ├── documentParser.js            # Parser file PDF (pdf-parse), DOCX (mammoth), TXT/MD, & citation matcher
│   └── llmRouterService.js          # Gateway routing Gemini, Groq, DeepSeek, 9Router, failover 429, & cost calculator
├── tests/
│   ├── fixtures/                    # Berkas uji nyata (sample_lecture.pdf, docx, md)
│   └── zakky-router-ingest.test.js  # Jest + Supertest test suite untuk TC-01 s/d TC-06 & extended tests
├── uploads/                         # Direktori penyimpanan berkas dokumen yang diunggah
├── .env.example                     # Contoh variabel lingkungan
├── package.json                     # Konfigurasi dependensi dan script test
└── server.js                        # Entry point Express.js app
```

---

## 🚀 Panduan Menjalankan Server Lokal

### 1. Instalasi Dependensi
```bash
cd server
npm install
```

### 2. Konfigurasi Variabel Lingkungan (`.env`)
Salin file template:
```bash
cp .env.example .env
```
Sesuaikan `MONGODB_URI`, `GEMINI_API_KEY`, dan `GROQ_API_KEY`.

### 3. Jalankan Server
```bash
# Mode development (auto-reload)
npm run dev

# Mode produksi
npm start
```
Server akan aktif di: `http://localhost:3000/api`

---

## 🧪 Pengujian Otomatis & Code Coverage (TC-01 s/d TC-06)

Jalankan pengujian unit & integrasi:
```bash
npm test
```

### Tabel Skenario Pengujian (TC-01 s/d TC-06):
| Kode Uji | Komponen yang Diuji | Skenario Masukan | Ekspektasi Hasil | Status |
| :--- | :--- | :--- | :--- | :---: |
| **TC-01** | `POST /api/documents/upload` | Upload PDF materi kuliah ke workspace | Teks terekstraksi, record metadata tersimpan di MongoDB, status `201 Created`. | ✅ PASS |
| **TC-02** | `GET /api/documents/:id/download` | Request download file dari HP | Binary stream dikembalikan dengan header MIME type & Content-Disposition yang valid, status `200 OK`. | ✅ PASS |
| **TC-03** | `POST /api/router/chat` (Direct Gemini) | Pertanyaan dokumen via Gemini 1.5 Flash | Grounding context disusun, jawaban AI disertai sitasi nomor halaman, status `200 OK`. | ✅ PASS |
| **TC-04** | `POST /api/router/chat` (Smart Failover) | Provider utama disimulasikan error 429 (*Rate Limit*) | Router otomatis beralih ke Groq Llama 3.3, `fallback_triggered: true`, status `200 OK`. | ✅ PASS |
| **TC-05** | `POST /api/router/chat` (9Router Bridge) | Request chat via 9Router lokal port 20128 | Konversi payload OpenAI-compatible berhasil, respons dialirkan, status `200 OK`. | ✅ PASS |
| **TC-06** | `GET /api/router/metrics` | Permintaan kalkulasi efisiensi biaya | Total kueri, akumulasi token, estimasi penghematan ($ USD & Rp IDR), status `200 OK`. | ✅ PASS |

**Hasil Code Coverage:**
- Statements: **89.8%** (Target $\ge 80\%$ tercapai)
- Lines: **89.58%** (Target $\ge 80\%$ tercapai)
- Functions: **88.0%** (Target $\ge 80\%$ tercapai)
- Branches: **74.32%**

---

## ☁️ Panduan Deployment ke Render (Public HTTPS - 100% Free & No CC)

1. Buka dashboard Render di [dashboard.render.com](https://dashboard.render.com) (login dengan akun GitHub).
2. Klik tombol **New +** > pilih **Web Service**.
3. Hubungkan repositori GitHub `CRootAgent/noteroute`.
4. Isi konfigurasi dasar:
   - **Name:** `noteroute-backend`
   - **Region:** `Singapore` (Terdekat & latensi rendah)
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** `Free` (0.1 CPU, 512 MB RAM, $0/month tanpa kartu kredit)
5. Tambahkan **Environment Variables** (dari file `.env`):
   - `MONGODB_URI`: Connection string MongoDB Atlas kamu
   - `GEMINI_API_KEY`: Kunci API Google AI Studio kamu
   - `GROQ_API_KEY`: Kunci API Groq Cloud kamu
   - `NODE_ENV`: `production`
6. Klik **Create Web Service**. URL publik otomatis aktif dengan SSL HTTPS: `https://noteroute-backend.onrender.com`.
7. Uji kesehatan server melalui endpoint `GET /api/health`.
