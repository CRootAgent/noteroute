import React, { useState } from 'react';

export default function QuickGuideModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('web');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-[var(--nlm-surface)] border border-[var(--nlm-border)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[var(--nlm-border)] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <i className="fa-solid fa-book-open text-base"></i>
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--nlm-text-primary)]">
                Panduan Penggunaan NoteRoute
              </h2>
              <p className="text-xs text-[var(--nlm-text-tertiary)]">
                Tutorial ringkas memaksimalkan NoteRoute pada Versi Web dan Android
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[var(--nlm-surface-hover)] text-[var(--nlm-text-tertiary)] hover:text-[var(--nlm-text-primary)] flex items-center justify-center transition cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-5 pt-4 shrink-0">
          <div className="flex p-1 rounded-2xl bg-[var(--nlm-surface-variant)] border border-[var(--nlm-border)]">
            <button
              onClick={() => setActiveTab('web')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition cursor-pointer ${
                activeTab === 'web'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-[var(--nlm-text-secondary)] hover:text-[var(--nlm-text-primary)]'
              }`}
            >
              <i className="fa-solid fa-laptop text-xs"></i>
              <span>Cara Penggunaan Versi Web</span>
            </button>
            <button
              onClick={() => setActiveTab('android')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition cursor-pointer ${
                activeTab === 'android'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-[var(--nlm-text-secondary)] hover:text-[var(--nlm-text-primary)]'
              }`}
            >
              <i className="fa-brands fa-android text-xs"></i>
              <span>Cara Penggunaan Versi Android</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'web' ? (
            <div className="space-y-3.5">
              {/* Step 1 */}
              <div className="p-4 rounded-2xl bg-[var(--nlm-surface-variant)] border border-[var(--nlm-border)] flex items-start space-x-3.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
                  1
                </div>
                <div className="space-y-1 min-w-0">
                  <h3 className="text-xs font-bold text-[var(--nlm-text-primary)]">
                    Masuk ke Akun atau Buat Akun Baru
                  </h3>
                  <p className="text-xs text-[var(--nlm-text-secondary)] leading-relaxed">
                    Klik tombol <strong>Masuk / Daftar</strong> di pojok kanan atas. Gunakan alamat email Anda dan sandi minimal 8 karakter (kombinasi kapital, kecil, angka, dan simbol) untuk keamanan akun.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-2xl bg-[var(--nlm-surface-variant)] border border-[var(--nlm-border)] flex items-start space-x-3.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="space-y-1 min-w-0">
                  <h3 className="text-xs font-bold text-[var(--nlm-text-primary)]">
                    Buat Notebook &amp; Unggah Materi Rujukan
                  </h3>
                  <p className="text-xs text-[var(--nlm-text-secondary)] leading-relaxed">
                    Pada Beranda Notebook, klik <strong>+ Buat baru</strong>. Di dalam workspace, gunakan panel kiri untuk mengunggah dokumen kuliah (PDF, Word DOCX, TXT, Markdown). Teks akan otomatis diindeks.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-2xl bg-[var(--nlm-surface-variant)] border border-[var(--nlm-border)] flex items-start space-x-3.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
                  3
                </div>
                <div className="space-y-1 min-w-0">
                  <h3 className="text-xs font-bold text-[var(--nlm-text-primary)]">
                    Tanya Jawab Multi-LLM dengan Sitasi Akurat
                  </h3>
                  <p className="text-xs text-[var(--nlm-text-secondary)] leading-relaxed">
                    Ajukan pertanyaan di panel tengah. Pilih target AI: <strong>Gemini 1.5 Flash</strong>, <strong>Groq Llama 3.3 70B</strong>, <strong>DeepSeek R1/V3</strong>, atau <strong>9Router Local</strong>. Jawaban dilengkapi nomor halaman kutipan transparan.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-2xl bg-[var(--nlm-surface-variant)] border border-[var(--nlm-border)] flex items-start space-x-3.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
                  4
                </div>
                <div className="space-y-1 min-w-0">
                  <h3 className="text-xs font-bold text-[var(--nlm-text-primary)]">
                    Manfaatkan Studio &amp; Ikhtisar Audio (Deep Dive)
                  </h3>
                  <p className="text-xs text-[var(--nlm-text-secondary)] leading-relaxed">
                    Gunakan panel kanan Studio untuk menghasilkan <em>Panduan Belajar</em>, <em>Briefing Doc</em>, <em>FAQ</em>, serta mendengarkan ulasan materi perkuliahan dalam format <strong>Ikhtisar Audio</strong>.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              {/* Android Step 1 */}
              <div className="p-4 rounded-2xl bg-[var(--nlm-surface-variant)] border border-[var(--nlm-border)] flex items-start space-x-3.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                  1
                </div>
                <div className="space-y-1 min-w-0">
                  <h3 className="text-xs font-bold text-[var(--nlm-text-primary)]">
                    Unduh dan Pasang Berkas APK Resmi
                  </h3>
                  <p className="text-xs text-[var(--nlm-text-secondary)] leading-relaxed">
                    Unduh berkas <strong>NoteRoute-v1.0.0.apk</strong> melalui tautan di bawah. Buka berkas di smartphone Android dan aktifkan izin pemasangan aplikasi dari sumber ini bila diminta.
                  </p>
                </div>
              </div>

              {/* Android Step 2 */}
              <div className="p-4 rounded-2xl bg-[var(--nlm-surface-variant)] border border-[var(--nlm-border)] flex items-start space-x-3.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="space-y-1 min-w-0">
                  <h3 className="text-xs font-bold text-[var(--nlm-text-primary)]">
                    Masuk Menggunakan Akun NoteRoute Anda
                  </h3>
                  <p className="text-xs text-[var(--nlm-text-secondary)] leading-relaxed">
                    Buka aplikasi di HP dan masuk dengan akun yang sama dengan versi web. Seluruh notebook, catatan, dan dokumen rujukan Anda akan langsung tersinkronisasi.
                  </p>
                </div>
              </div>

              {/* Android Step 3 */}
              <div className="p-4 rounded-2xl bg-[var(--nlm-surface-variant)] border border-[var(--nlm-border)] flex items-start space-x-3.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                  3
                </div>
                <div className="space-y-1 min-w-0">
                  <h3 className="text-xs font-bold text-[var(--nlm-text-primary)]">
                    Baca Materi Kuliah Secara Offline
                  </h3>
                  <p className="text-xs text-[var(--nlm-text-secondary)] leading-relaxed">
                    Dokumen yang telah diunduh tersimpan aman dalam cache lokal perangkat. Anda dapat membaca slide kuliah kapan saja di perjalanan tanpa menghabiskan kuota internet.
                  </p>
                </div>
              </div>

              {/* Android Step 4 */}
              <div className="p-4 rounded-2xl bg-[var(--nlm-surface-variant)] border border-[var(--nlm-border)] flex items-start space-x-3.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                  4
                </div>
                <div className="space-y-1 min-w-0">
                  <h3 className="text-xs font-bold text-[var(--nlm-text-primary)]">
                    Keamanan Hardware &amp; Streaming Berkas
                  </h3>
                  <p className="text-xs text-[var(--nlm-text-secondary)] leading-relaxed">
                    Kunci API disimpan secara hardware-backed menggunakan Android Keystore. Transfer dokumen dari laptop ke smartphone berjalan cepat dengan protokol streaming lokal.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--nlm-border)] bg-[var(--nlm-surface-variant)] flex items-center justify-between shrink-0">
          <a
            href="https://crootagent.github.io/noteroute.home/#panduan"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:underline flex items-center space-x-1"
          >
            <span>Buka portal dokumentasi lengkap</span>
            <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
          </a>
          <div className="flex items-center space-x-2">
            <a
              href="https://github.com/CRootAgent/noteroute/releases/latest"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center space-x-1.5 transition shadow-sm"
            >
              <i className="fa-solid fa-download text-xs"></i>
              <span>Unduh APK Android</span>
            </a>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-[var(--nlm-surface)] border border-[var(--nlm-border)] hover:bg-[var(--nlm-surface-hover)] text-xs font-semibold text-[var(--nlm-text-primary)] transition cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
