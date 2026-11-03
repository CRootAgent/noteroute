# 🖥️ MODUL A: BACKEND REST API & MULTI-LLM ROUTER
**Domain Pengembang:** Ahmad Zakky Nurfauzan (NPM: 714250028)  
**Teknologi:** Node.js, Express.js, MongoDB Atlas, Mongoose, Jest, Supertest  
**Status Akses:** 🔒 **AREA EKSKLUSIF ZAKKY** (Izat Dilarang Mengubah File di Folder Ini)

---

## Struktur Folder:
- `server.js` (Entry point aplikasi Express)
- `routes/`
  - `documents.js` (CRUD Dokumen, upload, stream download)
  - `router.js` (Routing chat, failover, token metrics)
  - `workspaces.js` (Manajemen ruang kerja)
- `services/`
  - `llmRouterService.js` (Engine perutean Gemini, Groq, DeepSeek, 9Router Bridge)
  - `documentParser.js` (Ekstraksi teks PDF, DOCX, TXT, MD)
- `config/`
  - `db.js` (Koneksi MongoDB Atlas)
- `tests/`
  - `zakky-router-ingest.test.js` (Test suite Jest TC-01 s/d TC-06, target coverage >= 80%)

Lihat spesifikasi kontrak data di `../docs/API_CONTRACT.md`.
