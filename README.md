# NoteRoute 🚀
> **Cross-Device Knowledge Agent & Multi-LLM Gateway Router**  
> Proyek 2 – *CRUD & Code Coverage* | D4 Teknik Informatika, Universitas Logistik dan Bisnis Internasional (ULBI)

---

## 👥 Tim Pengembang (Kelompok 12)
- **Ahmad Zakky Nurfauzan** (NPM: 714250028) – Ketua Tim  
  *Modul A: Backend Core Engine, Multi-LLM Router, Cloud Infra (MongoDB Atlas, Alwaysdata, GCP), CI/CD Actions, Web Landing Page*
- **Izat Ibrahimovic Irawan** (NPM: 714250024) – Anggota Tim  
  *Modul B: Native Android Application (Kotlin), Mobile File Explorer & Downloader, Document Chat UI (NotebookLM-Style), Keystore Signing*

**Dosen Pembimbing:** Rolly Maulana Awangga, S.T., M.T., CAIP.  
**Target Deadline Rilis:** 10 November 2026 (v1.0.0)

---

## 📂 Struktur Repositori Terisolasi (Anti-Bentrok)
```
noteroute/
├── android/            # 📱 Modul B: Native Android Kotlin Client (Eksklusif Izat)
├── server/             # 🖥️ Modul A: Express.js REST API & AI Router (Eksklusif Zakky)
├── landing/            # 🌐 Modul A: Web Landing Page & User Guide (Eksklusif Zakky)
├── docs/               # 📜 Kontrak API, Data Schema, & Keystore Spec (Single Source of Truth)
│   ├── API_CONTRACT.md
│   └── KEYSTORE_AND_SECRETS_SPEC.md
├── .github/            # ⚙️ Workflows CI/CD (Android Auto-Release & Backend Test) & CODEOWNERS
└── PANDUAN_KOLABORASI_ANTI_BENTROK.md # 🤝 Panduan Kolaborasi & Git Workflow
```

---

## 📖 Panduan Kolaborasi & Kontrak
- Silakan baca panduan anti-bentrok selengkapnya di [PANDUAN_KOLABORASI_ANTI_BENTROK.md](./PANDUAN_KOLABORASI_ANTI_BENTROK.md).
- Spesifikasi REST API & Schema Model Kotlin di [docs/API_CONTRACT.md](./docs/API_CONTRACT.md).
- Format signing keystore dan GitHub Actions Secrets di [docs/KEYSTORE_AND_SECRETS_SPEC.md](./docs/KEYSTORE_AND_SECRETS_SPEC.md).
