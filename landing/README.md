# 🌐 MODUL A: WEB LANDING PAGE & USER GUIDE (POWERED BY CROOTJS / JSCROOT)
**Domain Pengembang:** Ahmad Zakky Nurfauzan (NPM: 714250028)  
**Teknologi:** HTML5, Tailwind CSS, JavaScript ES Modules (ES6+), **JSCroot / CRootJS** (Karya Pak Rolly Maulana Awangga)  
**Status Akses:** 🔒 **AREA EKSKLUSIF ZAKKY** (Izat Dilarang Mengubah File di Folder Ini)

---

## 🌟 Implementasi CRootJS (JSCroot):
Landing Page NoteRoute mengadopsi prinsip *zero-build* dan *zero-dependency* menggunakan micro-framework **JSCroot / CRootJS**:
1. **`jscroot/api` (Dynamic Release Sync):**
   - Menghubungi GitHub Releases API (`CRootAgent/noteroute`) secara dinamis.
   - Mendeteksi tag versi terbaru, ukuran binary `.apk`, dan tanggal rilis.
   - Mengarahkan tombol CTA secara dinamis ke URL unduhan binary `app-release.apk` terbaru tanpa perlu hardcoded.
2. **`jscroot/element` (DOM Manipulation & Event Listeners):**
   - Mengontrol interaktivitas tab panduan instalasi (Laptop Agent, API Key Gemini/Groq, 9Router Bridge) menggunakan fungsi `onClick` dan `setInner`.

---

## Struktur File:
- `index.html` (Struktur landing page responsif, hero section, CTA, dan live stats)
- `js/main.js` (Logika interaktif JSCroot via CDN jsDelivr)
- `README.md` (Dokumentasi modul)
