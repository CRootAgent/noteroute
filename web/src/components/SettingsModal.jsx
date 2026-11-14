import React, { useState, useRef } from 'react';

export default function SettingsModal({
  isOpen,
  onClose,
  initialTab = 'profile',
  user,
  onUpdateUser,
  theme,
  onSetTheme
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [name, setName] = useState(user?.name || 'Ahmad Zakky');
  const [email, setEmail] = useState(user?.email || 'user@noteroute.app');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const getInitials = (str) => {
    if (!str || typeof str !== 'string') return 'AZ';
    const words = str.trim().split(/\s+/).filter(Boolean);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return str.slice(0, 2).toUpperCase();
  };

  const getNickname = (str) => {
    if (!str) return 'Zakky';
    return str.trim().split(/\s+/)[0];
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onUpdateUser({ avatar: reader.result });
      setStatusMsg('Foto profil berhasil diperbarui.');
      setTimeout(() => setStatusMsg(''), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    onUpdateUser({ avatar: null });
    setStatusMsg('Foto profil dihapus. Kembali ke inisial nama.');
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const handleSaveProfile = () => {
    onUpdateUser({ name: name.trim(), email: email.trim() });
    setStatusMsg('Profil berhasil disimpan.');
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const handleChangePassword = () => {
    if (newPass.length < 8) {
      alert('Kata sandi baru minimal 8 karakter.');
      return;
    }
    if (newPass !== confirmPass) {
      alert('Konfirmasi kata sandi tidak cocok.');
      return;
    }
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    setStatusMsg('Kata sandi berhasil diperbarui.');
    setTimeout(() => setStatusMsg(''), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[var(--nlm-modal-overlay)] backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-4xl h-[650px] max-h-[92vh] bg-[var(--nlm-surface)] border border-[var(--nlm-border)] rounded-3xl shadow-2xl overflow-hidden flex flex-col modal-animate-in">
        
        {/* Settings Header */}
        <div className="p-4 border-b border-[var(--nlm-border)] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              <i className="fa-solid fa-sliders"></i>
            </div>
            <div>
              <h3 className="font-bold text-sm text-[var(--nlm-text-primary)]">
                Pengaturan &amp; Konfigurasi NoteRoute
              </h3>
              <span className="text-xs text-[var(--nlm-text-tertiary)]">
                Kelola akun, kunci API gratis (Providers), prioritas AI, dan sistem
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[var(--nlm-surface-hover)] text-[var(--nlm-text-tertiary)] flex items-center justify-center transition cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        {/* Settings Layout: Left Tabs + Right Content */}
        <div className="flex-1 min-h-0 flex overflow-hidden">
          
          {/* Tab Navigation */}
          <div className="w-56 border-r border-[var(--nlm-border)] p-3 space-y-1 bg-[var(--nlm-surface-variant)] text-xs font-medium shrink-0 h-full overflow-y-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-3 py-2 rounded-xl transition flex items-center space-x-2 cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-[var(--nlm-text-secondary)] hover:bg-[var(--nlm-surface-hover)]'
              }`}
            >
              <i className="fa-regular fa-user text-xs w-4"></i>
              <span>Profil Pengguna</span>
            </button>

            <button
              onClick={() => setActiveTab('appearance')}
              className={`w-full text-left px-3 py-2 rounded-xl transition flex items-center space-x-2 cursor-pointer ${
                activeTab === 'appearance'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-[var(--nlm-text-secondary)] hover:bg-[var(--nlm-surface-hover)]'
              }`}
            >
              <i className="fa-solid fa-palette text-xs w-4 text-[var(--nlm-brand)]"></i>
              <span>Tampilan &amp; Tema (Ganti Mode)</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`w-full text-left px-3 py-2 rounded-xl transition flex items-center space-x-2 cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-[var(--nlm-text-secondary)] hover:bg-[var(--nlm-surface-hover)]'
              }`}
            >
              <i className="fa-solid fa-shield-halved text-xs w-4 text-purple-500"></i>
              <span>Keamanan Akun</span>
            </button>

            <button
              onClick={() => setActiveTab('api')}
              className={`w-full text-left px-3 py-2 rounded-xl transition flex items-center space-x-2 cursor-pointer ${
                activeTab === 'api'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-[var(--nlm-text-secondary)] hover:bg-[var(--nlm-surface-hover)]'
              }`}
            >
              <i className="fa-solid fa-key text-xs w-4 text-amber-500"></i>
              <span>Mengatur Kunci API</span>
            </button>

            <button
              onClick={() => setActiveTab('routing')}
              className={`w-full text-left px-3 py-2 rounded-xl transition flex items-center space-x-2 cursor-pointer ${
                activeTab === 'routing'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-[var(--nlm-text-secondary)] hover:bg-[var(--nlm-surface-hover)]'
              }`}
            >
              <i className="fa-solid fa-arrow-down-1-9 text-xs w-4 text-emerald-500"></i>
              <span>Atur Prioritas AI</span>
            </button>
          </div>

          {/* Tab Content Area */}
          <div className="flex-1 h-full overflow-y-auto p-5 text-xs text-[var(--nlm-text-secondary)] leading-relaxed select-text">
            
            {statusMsg && (
              <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center space-x-2">
                <i className="fa-solid fa-circle-check"></i>
                <span>{statusMsg}</span>
              </div>
            )}

            {/* TAB 1: PROFIL PENGGUNA */}
            {activeTab === 'profile' && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-sm text-[var(--nlm-text-primary)]">Profil Pengguna</h4>
                  <p className="text-[11px] text-[var(--nlm-text-tertiary)]">
                    Atur identitas akun, foto profil, nama panggilan otomatis, dan kata sandi Anda.
                  </p>
                </div>

                {/* Avatar Section */}
                <div className="p-4 rounded-2xl border border-[var(--nlm-border)] bg-[var(--nlm-surface-variant)] flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <div className="w-16 h-16 rounded-full bg-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-md overflow-hidden ring-4 ring-blue-500/20 shrink-0">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{getInitials(name)}</span>
                    )}
                  </div>

                  <div className="space-y-1.5 text-center sm:text-left flex-1">
                    <div className="font-bold text-xs text-[var(--nlm-text-primary)]">
                      Foto Profil / Inisial 2 Suku Kata
                    </div>
                    <p className="text-[11px] text-[var(--nlm-text-tertiary)]">
                      Unggah foto kustom atau gunakan inisial nama otomatis ({getInitials(name)}).
                    </p>
                    <div className="flex items-center justify-center sm:justify-start space-x-2 pt-1">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold transition cursor-pointer flex items-center space-x-1"
                      >
                        <i className="fa-solid fa-camera"></i>
                        <span>Unggah Foto</span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />

                      {user?.avatar && (
                        <button
                          onClick={handleRemoveAvatar}
                          className="px-3 py-1.5 rounded-xl border border-[var(--nlm-border)] bg-[var(--nlm-surface)] hover:bg-[var(--nlm-surface-hover)] text-rose-500 text-[11px] font-semibold transition cursor-pointer flex items-center space-x-1"
                        >
                          <i className="fa-regular fa-trash-can"></i>
                          <span>Hapus Foto</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Identity Inputs */}
                <div className="p-4 rounded-2xl border border-[var(--nlm-border)] bg-[var(--nlm-surface-variant)] space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-[var(--nlm-text-tertiary)] mb-1">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-[var(--nlm-surface)] border border-[var(--nlm-border)] rounded-xl p-2.5 text-xs text-[var(--nlm-text-primary)] font-bold focus:border-blue-500 focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-[var(--nlm-text-tertiary)] mb-1">
                        Nama Panggilan (Otomatis)
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={getNickname(name)}
                        className="w-full bg-[var(--nlm-surface)] border border-[var(--nlm-border)] rounded-xl p-2.5 text-xs text-[var(--nlm-text-primary)] font-bold cursor-not-allowed opacity-80"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-[var(--nlm-text-tertiary)] mb-1">
                      Alamat Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[var(--nlm-surface)] border border-[var(--nlm-border)] rounded-xl p-2.5 text-xs text-[var(--nlm-text-primary)] font-medium focus:border-blue-500 focus:outline-none transition"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition cursor-pointer flex items-center space-x-1.5 shadow-sm"
                    >
                      <i className="fa-solid fa-floppy-disk"></i>
                      <span>Simpan Perubahan Profil</span>
                    </button>
                  </div>
                </div>

                {/* Change Password */}
                <div className="p-4 rounded-2xl border border-[var(--nlm-border)] bg-[var(--nlm-surface-variant)] space-y-3">
                  <div className="flex items-center space-x-2">
                    <i className="fa-solid fa-lock text-amber-500"></i>
                    <h5 className="font-bold text-xs text-[var(--nlm-text-primary)]">
                      Ganti Kata Sandi (Minimal 8 Karakter)
                    </h5>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <input
                      type="password"
                      value={currentPass}
                      onChange={(e) => setCurrentPass(e.target.value)}
                      placeholder="Kata Sandi Saat Ini"
                      className="w-full bg-[var(--nlm-surface)] border border-[var(--nlm-border)] rounded-xl p-2.5 text-xs text-[var(--nlm-text-primary)] focus:border-blue-500 focus:outline-none"
                    />
                    <input
                      type="password"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="Kata Sandi Baru"
                      className="w-full bg-[var(--nlm-surface)] border border-[var(--nlm-border)] rounded-xl p-2.5 text-xs text-[var(--nlm-text-primary)] focus:border-blue-500 focus:outline-none"
                    />
                    <input
                      type="password"
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      placeholder="Konfirmasi Kata Sandi"
                      className="w-full bg-[var(--nlm-surface)] border border-[var(--nlm-border)] rounded-xl p-2.5 text-xs text-[var(--nlm-text-primary)] focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={handleChangePassword}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition cursor-pointer"
                    >
                      Perbarui Kata Sandi
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: TAMPILAN & TEMA (GANTI MODE) */}
            {activeTab === 'appearance' && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-sm text-[var(--nlm-text-primary)]">
                    Tampilan &amp; Tema (Ganti Mode)
                  </h4>
                  <p className="text-[11px] text-[var(--nlm-text-tertiary)]">
                    Pilih preferensi tema antarmuka NoteRoute sesuai kenyamanan mata Anda.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  {/* Tema Terang */}
                  <div
                    onClick={() => onSetTheme('light')}
                    className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between h-36 ${
                      theme === 'light'
                        ? 'border-2 border-blue-500 bg-blue-500/10'
                        : 'border-[var(--nlm-border)] bg-[var(--nlm-surface-variant)] hover:bg-[var(--nlm-surface-hover)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-sm">
                        <i className="fa-solid fa-sun"></i>
                      </span>
                      {theme === 'light' && <i className="fa-solid fa-circle-check text-blue-500"></i>}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-[var(--nlm-text-primary)]">Tema Terang</div>
                      <div className="text-[10px] text-[var(--nlm-text-tertiary)]">Latar putih jernih</div>
                    </div>
                  </div>

                  {/* Tema Gelap */}
                  <div
                    onClick={() => onSetTheme('dark')}
                    className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between h-36 ${
                      theme === 'dark'
                        ? 'border-2 border-blue-500 bg-blue-500/10'
                        : 'border-[var(--nlm-border)] bg-[var(--nlm-surface-variant)] hover:bg-[var(--nlm-surface-hover)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center text-sm">
                        <i className="fa-solid fa-moon"></i>
                      </span>
                      {theme === 'dark' && <i className="fa-solid fa-circle-check text-blue-500"></i>}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-[var(--nlm-text-primary)]">Tema Gelap (Obsidian)</div>
                      <div className="text-[10px] text-[var(--nlm-text-tertiary)]">Hitam pekat nyaman di mata</div>
                    </div>
                  </div>

                  {/* Ikuti Sistem */}
                  <div
                    onClick={() => onSetTheme('system')}
                    className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between h-36 ${
                      theme === 'system'
                        ? 'border-2 border-blue-500 bg-blue-500/10'
                        : 'border-[var(--nlm-border)] bg-[var(--nlm-surface-variant)] hover:bg-[var(--nlm-surface-hover)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center text-sm">
                        <i className="fa-solid fa-desktop"></i>
                      </span>
                      {theme === 'system' && <i className="fa-solid fa-circle-check text-blue-500"></i>}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-[var(--nlm-text-primary)]">Ikuti Sistem OS</div>
                      <div className="text-[10px] text-[var(--nlm-text-tertiary)]">Otomatis sinkron dengan OS</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: KEAMANAN AKUN */}
            {activeTab === 'security' && (
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-[var(--nlm-text-primary)]">Keamanan Akun &amp; Sesi</h4>
                <div className="p-4 rounded-2xl border border-[var(--nlm-border)] bg-[var(--nlm-surface-variant)] space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-500 font-bold">
                    <i className="fa-solid fa-shield-halved"></i>
                    <span>Enkripsi Transport Layer Security (TLS 1.3) Aktif</span>
                  </div>
                  <p className="text-[11px] text-[var(--nlm-text-tertiary)]">
                    Semua transmisi kueri dokumen laptop dan komunikasi Android ke cloud dienkripsi at-rest dan in-transit.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 4: MENGATUR KUNCI API */}
            {activeTab === 'api' && (
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-[var(--nlm-text-primary)]">Kunci API Provider</h4>
                <p className="text-[11px] text-[var(--nlm-text-tertiary)]">
                  Kunci API disimpan secara aman di file lingkungan lokal atau Android Keystore.
                </p>

                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-2xl border border-[var(--nlm-border)] bg-[var(--nlm-surface-variant)] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-[var(--nlm-text-primary)]">Google Gemini API</div>
                      <div className="text-[10px] text-emerald-500 font-semibold">Tersambung (1.500 req/hari gratis)</div>
                    </div>
                    <span className="text-[11px] font-mono text-[var(--nlm-text-tertiary)]">AI Studio</span>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-[var(--nlm-border)] bg-[var(--nlm-surface-variant)] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-[var(--nlm-text-primary)]">Groq Cloud (Llama 3.3)</div>
                      <div className="text-[10px] text-emerald-500 font-semibold">Tersambung (300+ token/s)</div>
                    </div>
                    <span className="text-[11px] font-mono text-[var(--nlm-text-tertiary)]">Groq LPU</span>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-[var(--nlm-border)] bg-[var(--nlm-surface-variant)] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-[var(--nlm-text-primary)]">9Router Local Bridge</div>
                      <div className="text-[10px] text-blue-500 font-semibold">Port 20128 Auto-Detection</div>
                    </div>
                    <span className="text-[11px] font-mono text-[var(--nlm-text-tertiary)]">Local Daemon</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: ATUR PRIORITAS AI */}
            {activeTab === 'routing' && (
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-[var(--nlm-text-primary)]">Urutan Heuristic Failover Router</h4>
                <p className="text-[11px] text-[var(--nlm-text-tertiary)]">
                  Sistem otomatis mencoba provider berikutnya jika terjadi status 429 (Rate Limit).
                </p>

                <div className="space-y-2">
                  <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/5 flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
                      <span className="text-[var(--nlm-text-primary)]">Google Gemini 1.5 Flash (1M Konteks)</span>
                    </span>
                    <span className="text-blue-500 text-[10px]">Prioritas Utama</span>
                  </div>

                  <div className="p-3 rounded-xl border border-[var(--nlm-border)] bg-[var(--nlm-surface-variant)] flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">2</span>
                      <span className="text-[var(--nlm-text-primary)]">Groq Cloud Llama 3.3 70B (Fast Failover)</span>
                    </span>
                    <span className="text-[var(--nlm-text-tertiary)] text-[10px]">Failover 1</span>
                  </div>

                  <div className="p-3 rounded-xl border border-[var(--nlm-border)] bg-[var(--nlm-surface-variant)] flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">3</span>
                      <span className="text-[var(--nlm-text-primary)]">DeepSeek R1/V3 (Penalaran Kompleks)</span>
                    </span>
                    <span className="text-[var(--nlm-text-tertiary)] text-[10px]">Failover 2</span>
                  </div>

                  <div className="p-3 rounded-xl border border-[var(--nlm-border)] bg-[var(--nlm-surface-variant)] flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">4</span>
                      <span className="text-[var(--nlm-text-primary)]">9Router / OmniRoute Local (Port 20128)</span>
                    </span>
                    <span className="text-[var(--nlm-text-tertiary)] text-[10px]">Cadangan Offline</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
