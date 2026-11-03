/**
 * NoteRoute Web Landing Page
 * Powered by JSCroot (CRootJS) - Developed by Rolly Maulana Awangga
 * Zero-Build, Zero-Dependency ES Modules Micro-Framework
 */

import { setInner, onClick } from "https://cdn.jsdelivr.net/gh/jscroot/element@0.1.5/croot.js";
import { getJSON } from "https://cdn.jsdelivr.net/gh/jscroot/api@0.0.6/croot.js";

// Konfigurasi Repositori GitHub Proyek 2 NoteRoute
const GITHUB_REPO = "CRootAgent/noteroute";
const GITHUB_RELEASES_API = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;
const ALWAYS_DATA_API_HEALTH = "https://noteroute.alwaysdata.net/api/health";

/**
 * 1. Ambil Metadata Rilis APK Otomatis via GitHub Releases API
 * Menggunakan getJSON dari jscroot/api
 */
function loadLatestReleaseInfo() {
  getJSON(GITHUB_RELEASES_API, null, null, (response) => {
    try {
      const release = response.data;
      if (release && release.tag_name) {
        setInner("release-version", `Versi Rilis: ${release.tag_name}`);
        
        // Cari file asset APK di dalam daftar assets
        const apkAsset = release.assets && release.assets.find(asset => asset.name.endsWith(".apk"));
        if (apkAsset) {
          const sizeMB = (apkAsset.size / (1024 * 1024)).toFixed(1);
          setInner("release-size", `${sizeMB} MB (.apk)`);
          
          const releaseDate = new Date(apkAsset.updated_at || release.published_at).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          });
          setInner("release-date", `Rilis: ${releaseDate}`);
          
          // Arahkan tombol download langsung ke link unduhan APK biner
          const downloadBtn = document.getElementById("btn-download-apk");
          if (downloadBtn) {
            downloadBtn.href = apkAsset.browser_download_url;
            downloadBtn.innerHTML = `<i class="fa-solid fa-download text-lg mr-2"></i> Unduh NoteRoute (${release.tag_name})`;
          }
        }
      } else {
        // Fallback jika belum ada tag rilis resmi
        setInner("release-version", "Versi: v1.0.0 (Prarilis)");
        setInner("release-size", "APK Siap Rilis");
      }
    } catch (err) {
      console.warn("JSCroot: Menggunakan fallback metadata rilis", err);
      setInner("release-version", "Versi: v1.0.0");
    }
  });
}

/**
 * 2. Tab Switcher Panduan Interaktif Setup NoteRoute
 * Menggunakan onClick & setInner dari jscroot/element
 */
function setupGuideTabs() {
  const tabLaptop = document.getElementById("tab-btn-laptop");
  const tabApiKey = document.getElementById("tab-btn-apikey");
  const tab9Router = document.getElementById("tab-btn-9router");

  const resetTabStyles = () => {
    [tabLaptop, tabApiKey, tab9Router].forEach(btn => {
      btn.className = "px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition";
    });
  };

  const activateTab = (activeBtn) => {
    resetTabStyles();
    activeBtn.className = "px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 text-white shadow-sm transition";
  };

  // Tab 1: Setup Laptop Agent
  onClick("tab-btn-laptop", () => {
    activateTab(tabLaptop);
    setInner("guide-box", `
      <h3 class="font-bold text-slate-900 text-lg mb-3">Langkah 1: Setup Agen Sinkronisasi Dokumen di Laptop</h3>
      <p class="text-sm text-slate-600 mb-4 leading-relaxed">
        Agen laptop bertugas membaca folder materi kuliah dan menyinkronkan berkas ke cloud backend NoteRoute agar bisa diakses dari HP Android Anda.
      </p>
      <div class="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs font-mono overflow-x-auto mb-4">
        <code># 1. Masuk ke direktori server NoteRoute<br>cd noteroute/server<br><br># 2. Pasang dependensi & jalankan server Express<br>npm install<br>npm start</code>
      </div>
      <p class="text-xs text-slate-500">
        Folder dokumen Anda otomatis terindeks dan dapat ditelusuri langsung melalui layar File Explorer di HP Android.
      </p>
    `);
  });

  // Tab 2: Registrasi API Key Gratis
  onClick("tab-btn-apikey", () => {
    activateTab(tabApiKey);
    setInner("guide-box", `
      <h3 class="font-bold text-slate-900 text-lg mb-3">Langkah 2: Dapatkan API Key Gratis (Rp 0)</h3>
      <p class="text-sm text-slate-600 mb-4 leading-relaxed">
        NoteRoute memanfaatkan kuota inferensi gratis dari Google dan Groq dengan kapasitas sangat besar:
      </p>
      <div class="space-y-3 mb-4 text-xs sm:text-sm">
        <div class="p-3 rounded-xl bg-slate-100 border border-slate-200">
          <strong class="text-indigo-600">Google Gemini 1.5 Flash:</strong> Buka <a href="https://aistudio.google.com" target="_blank" class="underline font-semibold text-slate-900">aistudio.google.com</a> &bull; Buat API Key &bull; Kuota: 1.500 request/hari, 1 JUTA token context gratis!
        </div>
        <div class="p-3 rounded-xl bg-slate-100 border border-slate-200">
          <strong class="text-violet-600">Groq Cloud (Llama 3.3 70B):</strong> Buka <a href="https://console.groq.com" target="_blank" class="underline font-semibold text-slate-900">console.groq.com</a> &bull; Buat API Key gratis &bull; Kecepatan respon ultra-kilat 300+ token/detik.
        </div>
      </div>
      <p class="text-xs text-slate-500">
        Masukkan kunci API tersebut ke dalam file <code>.env</code> backend Anda atau langsung pada pengaturan aplikasi HP.
      </p>
    `);
  });

  // Tab 3: Koneksi ke 9Router / OmniRoute
  onClick("tab-btn-9router", () => {
    activateTab(tab9Router);
    setInner("guide-box", `
      <h3 class="font-bold text-slate-900 text-lg mb-3">Langkah 3: Menghubungkan ke 9Router / OmniRoute Lokal</h3>
      <p class="text-sm text-slate-600 mb-4 leading-relaxed">
        Jika Anda menjalankan daemon 9Router atau OmniRoute lokal di laptop pada port <code>20128</code>:
      </p>
      <div class="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs font-mono overflow-x-auto mb-4">
        <code># 1. Pastikan 9Router daemon berjalan di laptop<br>9router start --port 20128<br><br># 2. Endpoint OpenAI-compatible otomatis aktif di:<br>http://localhost:20128/v1/chat/completions</code>
      </div>
      <p class="text-xs text-slate-500">
        NoteRoute Core Router akan mendeteksi instance lokal ini dan menjadikannya salah satu target inferensi pada Model Switcher.
      </p>
    `);
  });
}

// Inisialisasi seluruh komponen saat DOM siap
document.addEventListener("DOMContentLoaded", () => {
  loadLatestReleaseInfo();
  setupGuideTabs();
});
