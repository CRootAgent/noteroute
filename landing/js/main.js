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
          const heroBtn = document.getElementById("btn-download-apk-hero");
          if (heroBtn) {
            heroBtn.href = apkAsset.browser_download_url;
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
  const tabCloud = document.getElementById("tab-btn-cloud");

  if (!tabLaptop || !tabApiKey || !tab9Router) return;

  const resetTabStyles = () => {
    [tabLaptop, tabApiKey, tab9Router, tabCloud].forEach(btn => {
      if (btn) btn.className = "px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition cursor-pointer";
    });
  };

  const activateTab = (activeBtn) => {
    resetTabStyles();
    activeBtn.className = "px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 text-white shadow-xs transition cursor-pointer";
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
      <h3 class="font-bold text-[var(--nlm-text-primary)] text-lg mb-3">Langkah 3: Menghubungkan ke 9Router / OmniRoute Lokal</h3>
      <p class="text-sm text-[var(--nlm-text-secondary)] mb-4 leading-relaxed">
        Jika Anda menjalankan daemon 9Router atau OmniRoute lokal di laptop pada port <code>20128</code>:
      </p>
      <div class="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs font-mono overflow-x-auto mb-4 border border-slate-800">
        <code># 1. Pastikan 9Router daemon berjalan di laptop<br>9router start --port 20128<br><br># 2. Endpoint OpenAI-compatible otomatis aktif di:<br>http://localhost:20128/v1/chat/completions</code>
      </div>
      <p class="text-xs text-[var(--nlm-text-tertiary)] flex items-center space-x-2">
        <i class="fa-solid fa-circle-check text-emerald-500"></i>
        <span>NoteRoute Core Router akan mendeteksi instance lokal ini dan menjadikannya salah satu target inferensi hemat biaya.</span>
      </p>
    `);
  });

  // Tab 4: Panduan Pembuatan Akun Cloud (GCP, Alwaysdata & MongoDB)
  if (tabCloud) {
    onClick("tab-btn-cloud", () => {
      activateTab(tabCloud);
      setInner("guide-box", `
        <h3 class="font-bold text-[var(--nlm-text-primary)] text-lg mb-3">Langkah 4: Tata Cara Pembuatan Akun Cloud (GCP, Alwaysdata & MongoDB)</h3>
        <p class="text-sm text-[var(--nlm-text-secondary)] mb-4 leading-relaxed">
          Ikuti tiga langkah mudah berikut untuk mengonfigurasi layanan cloud resmi NoteRoute:
        </p>
        <div class="space-y-3.5 mb-4 text-xs sm:text-sm">
          <!-- GCP / Google AI Studio -->
          <div class="p-3.5 rounded-2xl bg-[var(--nlm-surface-variant)] border border-[var(--nlm-border)] space-y-1.5">
            <div class="flex items-center space-x-2">
              <span class="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-[11px]">1. Google Cloud Platform (GCP) / AI Studio</span>
            </div>
            <p class="text-xs text-[var(--nlm-text-secondary)] leading-relaxed">
              Buka <a href="https://aistudio.google.com" target="_blank" class="text-blue-600 dark:text-blue-400 font-semibold underline">aistudio.google.com</a> &bull; Masuk dengan akun Google Anda &bull; Klik <em>"Get API Key"</em> &bull; Buat kunci pada project GCP default Anda. Kuota: <strong>1.500 request/hari gratis</strong> dengan 1 Juta token context window untuk membaca dokumen PDF kuliah.
            </p>
          </div>

          <!-- Alwaysdata -->
          <div class="p-3.5 rounded-2xl bg-[var(--nlm-surface-variant)] border border-[var(--nlm-border)] space-y-1.5">
            <div class="flex items-center space-x-2">
              <span class="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">2. Alwaysdata (Hosting Cloud Backend)</span>
            </div>
            <p class="text-xs text-[var(--nlm-text-secondary)] leading-relaxed">
              Daftar akun gratis di <a href="https://admin.alwaysdata.com" target="_blank" class="text-emerald-600 dark:text-emerald-400 font-semibold underline">admin.alwaysdata.com</a> &bull; Buka menu <em>Web &gt; Sites</em> &bull; Tambahkan situs baru bertipe <strong>Node.js (v20.x)</strong> &bull; Masukkan repositori <code>CRootAgent/noteroute</code> &bull; Hubungkan domain publik HTTPS: <code>https://noteroute.alwaysdata.net/api</code>.
            </p>
          </div>

          <!-- MongoDB Atlas -->
          <div class="p-3.5 rounded-2xl bg-[var(--nlm-surface-variant)] border border-[var(--nlm-border)] space-y-1.5">
            <div class="flex items-center space-x-2">
              <span class="px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold text-[11px]">3. MongoDB Atlas (Cloud Database)</span>
            </div>
            <p class="text-xs text-[var(--nlm-text-secondary)] leading-relaxed">
              Daftar di <a href="https://www.mongodb.com/atlas" target="_blank" class="text-teal-600 dark:text-teal-400 font-semibold underline">mongodb.com/atlas</a> &bull; Buat cluster gratis <strong>M0 Shared</strong> &bull; Buat Database User &amp; Password &bull; Whitelist IP Address ke <code>0.0.0.0/0</code> &bull; Salin Connection String <code>mongodb+srv://...</code> ke dalam berkas <code>.env</code> server NoteRoute.
            </p>
          </div>
        </div>
        <p class="text-xs text-[var(--nlm-text-tertiary)] flex items-center space-x-2">
          <i class="fa-solid fa-circle-check text-emerald-500"></i>
          <span>Setelah ketiga kredensial terpasang, backend cloud Alwaysdata akan otomatis tersambung ke MongoDB Atlas dan API Gemini.</span>
        </p>
      `);
    });
  }
}

// Inisialisasi komponen rilis saat DOM siap
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    loadLatestReleaseInfo();
  });
} else {
  loadLatestReleaseInfo();
}
