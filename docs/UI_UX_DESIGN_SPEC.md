# 🎨 NOTE-ROUTE: UNIFIED UI/UX DESIGN SYSTEM SPECIFICATION
**Target Platform:** Web, Desktop (Electron/PWA), & Native Android (Kotlin Jetpack Compose / XML)  
**Filosofi Desain:** **Unified UX-First & Adaptive Ergonomics**  
**Interactive Prototype:** [ui-prototype.html](./ui-prototype.html) (Desktop/Workspace), [mobile.html](./mobile.html) (Responsive Web Mobile), & [android.html](./android.html) (Native Android App)

---

## 1. TUJUAN & PRINSIP UTAMA (UX-FIRST)

1. **Konsistensi Visual & Mental Model Lintas Perangkat:**
   Pengguna yang membuka NoteRoute di laptop (Web/Desktop) dan di HP Android (Mobile) tidak perlu mempelajari antarmuka baru. Posisi navigasi, warna semantik, badge kutipan (*citations*), dan logika model switcher dirancang identik.
2. **Kecepatan Akses Berkas Laptop ("Zero-Friction Retrieval"):**
   Setiap berkas dokumen laptop menampilkan ukuran, status sinkronisasi, tombol *Pratinjau Teks*, dan tombol aksi utama *"Ambil ke HP"* dengan umpan balik progress bar yang jelas.
3. **Keterpercayaan AI (Grounded Trust via Citations):**
   Setiap jawaban AI menyertakan **Citation Badges** yang dapat diklik untuk membuka cuplikan teks asli dan nomor halaman dokumen, meniru kenyamanan Google NotebookLM.
4. **Kendali Penuh Model AI (Multi-LLM Freedom):**
   Komponen *Model Switcher* selalu mudah dijangkau di bagian atas antarmuka, memungkinkan transisi instan antara Gemini 1.5 Flash, Groq Llama 3.3, DeepSeek, dan 9Router lokal.

---

## 2. ADAPTASI TAMPILAN LINTAS PLATFORM (RESPONSIVE BREAKPOINTS)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🖥️ DESKTOP / WIDE WEB (>= 1024px)                                          │
│ ┌───────────────┬─────────────────────────────────────────┬───────────────┐ │
│ │ 1. EXPLORER   │ 2. GROUNDED DOCUMENT CHAT               │ 3. CITATION   │ │
│ │ - Daftar File │ - Bubble Obrolan                        │    INSPECTOR  │ │
│ │ - Ambil ke HP │ - Citation Badges                       │ - Snippet Dok │ │
│ │ - Preview     │ - Input Bar & Suggestion Prompts        │ - Page Number │ │
│ └───────────────┴─────────────────────────────────────────┴───────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ 💻 TABLET / COMPACT WEB (768px - 1023px)                                    │
│ ┌───────────────┬─────────────────────────────────────────────────────────┐ │
│ │ 1. EXPLORER   │ 2. GROUNDED DOCUMENT CHAT                               │ │
│ │ (Dapat di-    │ (Citation Drawer muncul sebagai overlay popover samping │ │
│ │  collapse)    │  saat badge ditekan)                                    │ │
│ └───────────────┴─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────┐
│ 📱 MOBILE ANDROID (< 768px - Izat Domain) │
│ ┌───────────────────────────────────────┐ │
│ │ Topbar: Model Switcher & Status Sync  │ │
│ ├───────────────────────────────────────┤ │
│ │                                       │ │
│ │ Dynamic View:                         │ │
│ │ - Tab Chat (Default)                  │ │
│ │ - Tab File Explorer                   │ │
│ │ - Tab Sitasi (Bottom Sheet)           │ │
│ │                                       │ │
│ ├───────────────────────────────────────┤ │
│ │ Bottom Navigation Bar:                │ │
│ │ [📁 File Laptop] [💬 AI Chat] [📑 Sitasi]│ │
│ └───────────────────────────────────────┘ │
└───────────────────────────────────────────┘
```

---

## 3. SPESIFIKASI KOMPONEN UTAMA

### 🟢 A. Topbar & Model Switcher (Cross-Platform)
* **Model Switcher Pill:** Menampilkan nama model aktif, kapasitas konteks, dan indikator status dot beranimasi.
* **Smart Failover Shield:** Ikon perisai hijau yang memberi tahu pengguna bahwa failover otomatis ke Groq aktif jika model utama terkena HTTP 429.

### 🟢 B. Document Card (File Explorer)
* **Icon Badge:** Warna kontras per ekstensi (Merah: PDF, Biru: MD, Ungu: DOCX, Oranye: Kode).
* **Metadata Bar:** Ukuran berkas, jumlah halaman/baris, dan status `Tersinkron`.
* **Action Buttons:**
  - `Pratinjau Teks`: Membuka ringkasan teks tanpa aplikasi eksternal.
  - `Ambil ke HP`: Memicu unduhan streaming ke folder `Downloads` HP dengan animasi progress bar.

### 🟢 C. Grounded Chat & Citation Badges
* **Assistant Bubble:** Teks dengan struktur markdown rapi (nomor dan poin).
* **Citation Badge:** Chip interaktif berlatar transparan `bg-indigo-500/10` dengan border `border-indigo-500/30`. Saat ditekan, membuka drawer referensi asli.
* **Suggested Prompts:** Tombol cepat (pills) di bawah bubble asisten untuk memicu kueri instan tanpa harus mengetik panjang di HP.

---

## 4. CARA MENCOBA INTERACTIVE PROTOTYPE
Buka file `noteroute/docs/ui-prototype.html` di browser Anda. Anda dapat menguji:
1. Tombol simulasi **Desktop**, **Tablet**, dan **Mobile HP** di pojok kanan atas.
2. Mengganti model AI melalui dropdown Model Switcher.
3. Menekan tombol *"Ambil ke HP"* untuk melihat simulasi download manager.
4. Menekan lencana sitasi (*Citation Badge*) untuk membuka panel cuplikan dokumen asli.
5. Mengirimkan prompt chat pertanyaan dokumen.
