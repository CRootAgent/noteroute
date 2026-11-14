import React, { useState, useEffect, useRef } from 'react';
import ImageCropperModal from './ImageCropperModal';

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

  // Image Cropper States
  const [cropperOpen, setCropperOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState(null);
  const fileInputRef = useRef(null);

  // Synchronize activeTab whenever modal opens or initialTab prop changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setName(user?.name || 'Ahmad Zakky');
      setEmail(user?.email || 'user@noteroute.app');
      setStatusMsg('');
    }
  }, [initialTab, isOpen, user]);

  // Active Sessions State (Tab 3: Keamanan Akun)
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('noteroute_user_sessions');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'sess_android_1',
        device: 'Samsung Galaxy / Android Device',
        app: 'NoteRoute Mobile APK v1.0.0',
        location: 'Bandung, Jawa Barat, ID',
        ip: '182.253.14.72',
        lastActive: 'Hari ini, 20:15 WIB',
        isCurrent: false
      },
      {
        id: 'sess_tab_1',
        device: 'Apple iPad / Tablet',
        app: 'NoteRoute Web Safari',
        location: 'Jakarta, Indonesia',
        ip: '114.122.20.91',
        lastActive: 'Kemarin, 14:30 WIB',
        isCurrent: false
      }
    ];
  });

  const saveSessions = (updated) => {
    setSessions(updated);
    try {
      localStorage.setItem('noteroute_user_sessions', JSON.stringify(updated));
    } catch (e) {
      console.warn('Gagal menyimpan sesi:', e);
    }
  };

  const handleRevokeSession = (sessionId) => {
    const updated = sessions.filter((s) => s.id !== sessionId);
    saveSessions(updated);
    setStatusMsg('Sesi perangkat berhasil dicabut.');
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const handleRevokeAllOtherSessions = () => {
    if (confirm('Cabut akses untuk semua perangkat lain? Anda akan tetap masuk di perangkat ini.')) {
      saveSessions([]);
      setStatusMsg('Semua sesi perangkat lain berhasil dicabut.');
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  // Detect current client device info
  const detectDeviceInfo = () => {
    if (typeof navigator === 'undefined') {
      return { browser: 'Web Browser', os: 'Desktop OS' };
    }
    const ua = navigator.userAgent;
    let browser = 'Web Browser';
    if (ua.includes('Firefox')) browser = 'Mozilla Firefox';
    else if (ua.includes('SamsungBrowser')) browser = 'Samsung Internet';
    else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
    else if (ua.includes('Edge') || ua.includes('Edg')) browser = 'Microsoft Edge';
    else if (ua.includes('Chrome')) browser = 'Google Chrome';
    else if (ua.includes('Safari')) browser = 'Apple Safari';

    let os = 'Desktop';
    if (ua.includes('Macintosh') || ua.includes('Mac OS')) os = 'macOS';
    else if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Android')) os = 'Android OS';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS / iPadOS';
    else if (ua.includes('Linux')) os = 'Linux';

    return { browser, os };
  };

  const currentDevice = detectDeviceInfo();

  // API Keys & Providers State (Tab 4: Mengatur Kunci API)
  const [apiKeys, setApiKeys] = useState(() => {
    try {
      const saved = localStorage.getItem('noteroute_api_keys');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [customApis, setCustomApis] = useState(() => {
    try {
      const saved = localStorage.getItem('noteroute_custom_apis');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [expandedTutorial, setExpandedTutorial] = useState(null);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customBaseUrl, setCustomBaseUrl] = useState('');
  const [customModelId, setCustomModelId] = useState('');
  const [customApiKey, setCustomApiKey] = useState('');

  const handleApiKeyChange = (provider, value) => {
    const updated = { ...apiKeys, [provider]: value };
    setApiKeys(updated);
    try {
      localStorage.setItem('noteroute_api_keys', JSON.stringify(updated));
    } catch (e) {
      console.warn('Gagal menyimpan API key:', e);
    }
  };

  const handleAddCustomApi = (e) => {
    e.preventDefault();
    if (!customName.trim() || !customBaseUrl.trim()) {
      alert('Nama Provider dan Base URL wajib diisi.');
      return;
    }
    const newApi = {
      id: 'custom_' + Date.now(),
      name: customName.trim(),
      baseUrl: customBaseUrl.trim(),
      modelId: customModelId.trim() || 'default-model',
      apiKey: customApiKey.trim()
    };
    const updated = [...customApis, newApi];
    setCustomApis(updated);
    try {
      localStorage.setItem('noteroute_custom_apis', JSON.stringify(updated));
    } catch (e) {
      console.warn('Gagal menyimpan API kustom:', e);
    }
    setCustomName('');
    setCustomBaseUrl('');
    setCustomModelId('');
    setCustomApiKey('');
    setShowAddCustom(false);
    setStatusMsg(`API Kustom "${newApi.name}" berhasil ditambahkan.`);
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const handleDeleteCustomApi = (id) => {
    const updated = customApis.filter((a) => a.id !== id);
    setCustomApis(updated);
    try {
      localStorage.setItem('noteroute_custom_apis', JSON.stringify(updated));
    } catch (e) {
      console.warn('Gagal memperbarui API kustom:', e);
    }
  };

  // AI Priorities State (Tab 5: Atur Prioritas AI - Drag & Drop / Buttons)
  const defaultPriorities = [
    {
      id: 'gemini',
      name: 'Google Gemini 1.5 Flash (1M Konteks)',
      desc: 'Prioritas Utama: RAG dokumen cepat, kuota 1.500 req/hari gratis',
      tag: 'Prioritas Utama',
      color: 'bg-blue-600'
    },
    {
      id: 'groq',
      name: 'Groq Cloud Llama 3.3 70B (Fast Failover)',
      desc: 'Failover 1: Kecepatan tinggi (~300 token/dtk) saat Gemini rate limited',
      tag: 'Failover 1',
      color: 'bg-indigo-600'
    },
    {
      id: 'deepseek',
      name: 'DeepSeek R1/V3 (Penalaran & Analisis)',
      desc: 'Failover 2: Penalaran analitis mendalam pada dokumen kompleks',
      tag: 'Failover 2',
      color: 'bg-emerald-600'
    },
    {
      id: 'router9',
      name: '9Router / OmniRoute Local (Port 20128)',
      desc: 'Cadangan Offline: Model lokal Ollama / LM Studio tanpa kuota internet',
      tag: 'Cadangan Offline',
      color: 'bg-purple-600'
    }
  ];

  const [routerPriorities, setRouterPriorities] = useState(() => {
    try {
      const saved = localStorage.getItem('noteroute_router_priority');
      if (saved) return JSON.parse(saved);
    } catch {}
    return defaultPriorities;
  });

  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const handleDragStart = (e, index) => {
    dragItem.current = index;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (e, index) => {
    dragOverItem.current = index;
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (dragItem.current === null || dragOverItem.current === null) return;
    const copyList = [...routerPriorities];
    const draggedContent = copyList[dragItem.current];
    copyList.splice(dragItem.current, 1);
    copyList.splice(dragOverItem.current, 0, draggedContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setRouterPriorities(copyList);
    try {
      localStorage.setItem('noteroute_router_priority', JSON.stringify(copyList));
    } catch (err) {
      console.warn('Gagal menyimpan urutan prioritas:', err);
    }
    setStatusMsg('Urutan prioritas AI berhasil diperbarui.');
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const copyList = [...routerPriorities];
    const temp = copyList[index - 1];
    copyList[index - 1] = copyList[index];
    copyList[index] = temp;
    setRouterPriorities(copyList);
    try {
      localStorage.setItem('noteroute_router_priority', JSON.stringify(copyList));
    } catch (err) {
      console.warn('Gagal menyimpan urutan prioritas:', err);
    }
  };

  const handleMoveDown = (index) => {
    if (index === routerPriorities.length - 1) return;
    const copyList = [...routerPriorities];
    const temp = copyList[index + 1];
    copyList[index + 1] = copyList[index];
    copyList[index] = temp;
    setRouterPriorities(copyList);
    try {
      localStorage.setItem('noteroute_router_priority', JSON.stringify(copyList));
    } catch (err) {
      console.warn('Gagal menyimpan urutan prioritas:', err);
    }
  };

  const handleResetPriority = () => {
    setRouterPriorities(defaultPriorities);
    try {
      localStorage.setItem('noteroute_router_priority', JSON.stringify(defaultPriorities));
    } catch {}
    setStatusMsg('Urutan prioritas AI dikembalikan ke setelan bawaan.');
    setTimeout(() => setStatusMsg(''), 3000);
  };

  if (!isOpen) return null;

  const getInitials = (str) => {
    if (!str || typeof str !== 'string') return 'AZ';
    const words = str.trim().split(/\s+/).filter(Boolean);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return str.slice(0, 2).toUpperCase();
  };

  const getNickname = (str) => {
    if (!str) return 'Pengguna';
    return str.trim().split(/\s+/)[0];
  };

  const handleAvatarFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImageSrc(reader.result);
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input to allow re-uploading same file
  };

  const handleSaveCroppedAvatar = (croppedDataUrl) => {
    onUpdateUser({ avatar: croppedDataUrl });
    setStatusMsg('Foto profil berhasil disesuaikan dan diperbarui.');
    setTimeout(() => setStatusMsg(''), 3000);
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
                Kelola profil, tampilan, keamanan sesi, kunci API provider, dan prioritas router AI
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
              <span>Tampilan &amp; Tema</span>
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
              <span>Keamanan Akun &amp; Sesi</span>
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
              <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center space-x-2 animate-fadeIn">
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
                    Atur foto profil dengan editor pemotong visual, nama lengkap, dan kata sandi Anda.
                  </p>
                </div>

                {/* Avatar Section with Visual Cropper Support */}
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
                      Foto Profil / Inisial 2 Suku Kata ({getInitials(name)})
                    </div>
                    <p className="text-[11px] text-[var(--nlm-text-tertiary)]">
                      Unggah foto baru untuk membuka editor visual (rasio lingkaran/persegi, zoom, rotasi &amp; posisi geser).
                    </p>
                    <div className="flex items-center justify-center sm:justify-start space-x-2 pt-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold transition cursor-pointer flex items-center space-x-1 shadow-xs"
                      >
                        <i className="fa-solid fa-camera"></i>
                        <span>Unggah &amp; Edit Foto</span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFileSelected}
                        className="hidden"
                      />

                      {user?.avatar && (
                        <button
                          type="button"
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
                        placeholder="Contoh: Ahmad Zakky"
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
                      placeholder="nama@email.com"
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

            {/* TAB 2: TAMPILAN & TEMA */}
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

            {/* TAB 3: KEAMANAN AKUN & SESI PERANGKAT */}
            {activeTab === 'security' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-[var(--nlm-text-primary)]">
                      Keamanan Akun &amp; Sesi Perangkat
                    </h4>
                    <p className="text-[11px] text-[var(--nlm-text-tertiary)]">
                      Pantau seluruh sesi masuk akun Anda di berbagai perangkat secara transparan.
                    </p>
                  </div>
                  {sessions.length > 0 && (
                    <button
                      onClick={handleRevokeAllOtherSessions}
                      className="px-3 py-1.5 rounded-xl border border-rose-500/30 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold text-[11px] transition cursor-pointer"
                    >
                      Cabut Semua Sesi Lain
                    </button>
                  )}
                </div>

                {/* Sesi Saat Ini (Current Detected Session) */}
                <div className="p-4 rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 relative">
                        <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75"></span>
                      </div>
                      <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
                        Sesi Saat Ini &bull; Aktif Sekarang
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-semibold">
                      Perangkat Ini
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                    <div>
                      <div className="font-bold text-[var(--nlm-text-primary)]">
                        {currentDevice.browser} ({currentDevice.os})
                      </div>
                      <div className="text-[11px] text-[var(--nlm-text-tertiary)]">
                        NoteRoute Web Workspace
                      </div>
                    </div>
                    <div className="sm:text-right text-[11px] text-[var(--nlm-text-tertiary)]">
                      <div>Lokasi: Indonesia (Terhubung Langsung)</div>
                      <div className="text-emerald-600 dark:text-emerald-400 font-medium">
                        Enkripsi TLS 1.3 Aktif
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sesi di Perangkat Lain */}
                <div>
                  <h5 className="font-bold text-xs text-[var(--nlm-text-primary)] mb-2">
                    Sesi Perangkat Lain ({sessions.length})
                  </h5>

                  {sessions.length === 0 ? (
                    <div className="p-4 rounded-2xl border border-[var(--nlm-border)] bg-[var(--nlm-surface-variant)] text-center text-xs text-[var(--nlm-text-tertiary)]">
                      Tidak ada sesi lain yang aktif. Akun Anda hanya terbuka di perangkat ini.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {sessions.map((sess) => (
                        <div
                          key={sess.id}
                          className="p-3.5 rounded-2xl border border-[var(--nlm-border)] bg-[var(--nlm-surface-variant)] flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center text-base">
                              <i className={sess.device.includes('Android') ? 'fa-brands fa-android' : 'fa-solid fa-tablet-screen-button'}></i>
                            </div>
                            <div>
                              <div className="font-bold text-xs text-[var(--nlm-text-primary)]">
                                {sess.device}
                              </div>
                              <div className="text-[10px] text-[var(--nlm-text-tertiary)]">
                                {sess.app} &bull; {sess.location} (IP: {sess.ip})
                              </div>
                              <div className="text-[10px] text-amber-500 font-medium mt-0.5">
                                {sess.lastActive}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleRevokeSession(sess.id)}
                            className="px-3 py-1.5 rounded-xl border border-[var(--nlm-border)] hover:bg-rose-500/10 hover:border-rose-500/30 text-rose-500 text-[11px] font-semibold transition cursor-pointer"
                          >
                            Cabut Akses
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: MENGATUR KUNCI API & TUTORIAL */}
            {activeTab === 'api' && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-sm text-[var(--nlm-text-primary)]">
                    Kunci API Provider &amp; Model AI
                  </h4>
                  <p className="text-[11px] text-[var(--nlm-text-tertiary)]">
                    Gunakan kuota gratis dari masing-masing penyedia atau tambahkan API model kustom Anda.
                  </p>
                </div>

                {/* Banner Rujukan Sumber API Gratis */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 border border-blue-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-blue-600 dark:text-blue-400 flex items-center space-x-1.5">
                      <i className="fa-solid fa-lightbulb"></i>
                      <span>Katalog Referensi API AI Gratis:</span>
                    </span>
                    <span className="text-[10px] text-[var(--nlm-text-tertiary)]">Sumber Resmi GitHub</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <a
                      href="https://github.com/mnfst/awesome-free-llm-apis"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-[var(--nlm-surface)] hover:bg-blue-500/15 border border-[var(--nlm-border)] text-blue-600 dark:text-blue-400 font-semibold text-[11px] flex items-center space-x-1.5 transition"
                    >
                      <i className="fa-brands fa-github"></i>
                      <span>awesome-free-llm-apis</span>
                      <i className="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
                    </a>
                    <a
                      href="https://github.com/OuterSpacee/free-ai-apis"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-[var(--nlm-surface)] hover:bg-indigo-500/15 border border-[var(--nlm-border)] text-indigo-600 dark:text-indigo-400 font-semibold text-[11px] flex items-center space-x-1.5 transition"
                    >
                      <i className="fa-brands fa-github"></i>
                      <span>free-ai-apis</span>
                      <i className="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
                    </a>
                  </div>
                </div>

                {/* Daftar Provider Bawaan */}
                <div className="space-y-3">
                  {/* 1. Google Gemini */}
                  <div className="p-3.5 rounded-2xl border border-[var(--nlm-border)] bg-[var(--nlm-surface-variant)] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-600 flex items-center justify-center font-bold text-xs">
                          G
                        </div>
                        <div>
                          <div className="font-bold text-xs text-[var(--nlm-text-primary)]">
                            Google Gemini API (1.5 Flash &amp; Pro)
                          </div>
                          <div className="text-[10px] text-emerald-500 font-semibold">
                            Kuota Gratis: 15 req/menit &bull; 1.500 req/hari
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setExpandedTutorial(expandedTutorial === 'gemini' ? null : 'gemini')}
                        className="text-[11px] text-blue-500 hover:underline flex items-center space-x-1"
                      >
                        <i className="fa-solid fa-circle-question"></i>
                        <span>Cara Mendapatkan Kunci</span>
                      </button>
                    </div>

                    <input
                      type="password"
                      value={apiKeys.gemini || ''}
                      onChange={(e) => handleApiKeyChange('gemini', e.target.value)}
                      placeholder="Tempel kunci Gemini (AIzaSy...)"
                      className="w-full bg-[var(--nlm-surface)] border border-[var(--nlm-border)] rounded-xl p-2 text-xs text-[var(--nlm-text-primary)] font-mono focus:border-blue-500 focus:outline-none"
                    />

                    {expandedTutorial === 'gemini' && (
                      <div className="p-3 rounded-xl bg-[var(--nlm-surface)] border border-blue-500/20 text-[11px] text-[var(--nlm-text-secondary)] space-y-1 animate-fadeIn">
                        <div className="font-bold text-blue-500">Langkah Mendapatkan API Gemini Gratis:</div>
                        <ol className="list-decimal list-inside space-y-0.5">
                          <li>Buka <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="text-blue-500 underline">aistudio.google.com</a> dan masuk dengan akun Google.</li>
                          <li>Klik tombol <strong>Get API key</strong> di bilah navigasi kiri.</li>
                          <li>Pilih <strong>Create API key in new project</strong>.</li>
                          <li>Salin string token yang dihasilkan dan tempelkan di kolom input di atas.</li>
                        </ol>
                      </div>
                    )}
                  </div>

                  {/* 2. Groq Cloud */}
                  <div className="p-3.5 rounded-2xl border border-[var(--nlm-border)] bg-[var(--nlm-surface-variant)] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-lg bg-orange-500/15 text-orange-600 flex items-center justify-center font-bold text-xs">
                          Gr
                        </div>
                        <div>
                          <div className="font-bold text-xs text-[var(--nlm-text-primary)]">
                            Groq Cloud API (Llama 3.3 70B &amp; Mixtral)
                          </div>
                          <div className="text-[10px] text-emerald-500 font-semibold">
                            Kuota Gratis: Sangat Cepat (~300 t/s) &bull; Free Rate Limit
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setExpandedTutorial(expandedTutorial === 'groq' ? null : 'groq')}
                        className="text-[11px] text-blue-500 hover:underline flex items-center space-x-1"
                      >
                        <i className="fa-solid fa-circle-question"></i>
                        <span>Cara Mendapatkan Kunci</span>
                      </button>
                    </div>

                    <input
                      type="password"
                      value={apiKeys.groq || ''}
                      onChange={(e) => handleApiKeyChange('groq', e.target.value)}
                      placeholder="Tempel kunci Groq (gsk_...)"
                      className="w-full bg-[var(--nlm-surface)] border border-[var(--nlm-border)] rounded-xl p-2 text-xs text-[var(--nlm-text-primary)] font-mono focus:border-blue-500 focus:outline-none"
                    />

                    {expandedTutorial === 'groq' && (
                      <div className="p-3 rounded-xl bg-[var(--nlm-surface)] border border-orange-500/20 text-[11px] text-[var(--nlm-text-secondary)] space-y-1 animate-fadeIn">
                        <div className="font-bold text-orange-500">Langkah Mendapatkan Kunci Groq:</div>
                        <ol className="list-decimal list-inside space-y-0.5">
                          <li>Buka <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-blue-500 underline">console.groq.com/keys</a>.</li>
                          <li>Masuk via GitHub atau Google.</li>
                          <li>Klik tombol <strong>Create API Key</strong>, beri nama "NoteRoute".</li>
                          <li>Salin kunci yang berawalan <code>gsk_</code> dan tempelkan di atas.</li>
                        </ol>
                      </div>
                    )}
                  </div>

                  {/* 3. DeepSeek */}
                  <div className="p-3.5 rounded-2xl border border-[var(--nlm-border)] bg-[var(--nlm-surface-variant)] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-600 flex items-center justify-center font-bold text-xs">
                          DS
                        </div>
                        <div>
                          <div className="font-bold text-xs text-[var(--nlm-text-primary)]">
                            DeepSeek API (DeepSeek V3 / R1 Reasoning)
                          </div>
                          <div className="text-[10px] text-blue-500 font-semibold">
                            Kompabilitas OpenAI Endpoint
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setExpandedTutorial(expandedTutorial === 'deepseek' ? null : 'deepseek')}
                        className="text-[11px] text-blue-500 hover:underline flex items-center space-x-1"
                      >
                        <i className="fa-solid fa-circle-question"></i>
                        <span>Cara Mendapatkan Kunci</span>
                      </button>
                    </div>

                    <input
                      type="password"
                      value={apiKeys.deepseek || ''}
                      onChange={(e) => handleApiKeyChange('deepseek', e.target.value)}
                      placeholder="Tempel kunci DeepSeek (sk-...)"
                      className="w-full bg-[var(--nlm-surface)] border border-[var(--nlm-border)] rounded-xl p-2 text-xs text-[var(--nlm-text-primary)] font-mono focus:border-blue-500 focus:outline-none"
                    />

                    {expandedTutorial === 'deepseek' && (
                      <div className="p-3 rounded-xl bg-[var(--nlm-surface)] border border-indigo-500/20 text-[11px] text-[var(--nlm-text-secondary)] space-y-1 animate-fadeIn">
                        <div className="font-bold text-indigo-500">Langkah Mendapatkan Kunci DeepSeek:</div>
                        <ol className="list-decimal list-inside space-y-0.5">
                          <li>Akses <a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noreferrer" className="text-blue-500 underline">platform.deepseek.com/api_keys</a>.</li>
                          <li>Daftar akun untuk klaim token gratis pertama.</li>
                          <li>Klik <strong>Create API Key</strong> dan salin hasilnya.</li>
                        </ol>
                      </div>
                    )}
                  </div>

                  {/* 4. OpenRouter */}
                  <div className="p-3.5 rounded-2xl border border-[var(--nlm-border)] bg-[var(--nlm-surface-variant)] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-lg bg-purple-500/15 text-purple-600 flex items-center justify-center font-bold text-xs">
                          OR
                        </div>
                        <div>
                          <div className="font-bold text-xs text-[var(--nlm-text-primary)]">
                            OpenRouter API (Koleksi Model Gratis :free)
                          </div>
                          <div className="text-[10px] text-purple-500 font-semibold">
                            Akses Llama 3.3, Mistral, dan DeepSeek R1 gratis
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setExpandedTutorial(expandedTutorial === 'openrouter' ? null : 'openrouter')}
                        className="text-[11px] text-blue-500 hover:underline flex items-center space-x-1"
                      >
                        <i className="fa-solid fa-circle-question"></i>
                        <span>Cara Mendapatkan Kunci</span>
                      </button>
                    </div>

                    <input
                      type="password"
                      value={apiKeys.openrouter || ''}
                      onChange={(e) => handleApiKeyChange('openrouter', e.target.value)}
                      placeholder="Tempel kunci OpenRouter (sk-or-v1-...)"
                      className="w-full bg-[var(--nlm-surface)] border border-[var(--nlm-border)] rounded-xl p-2 text-xs text-[var(--nlm-text-primary)] font-mono focus:border-blue-500 focus:outline-none"
                    />

                    {expandedTutorial === 'openrouter' && (
                      <div className="p-3 rounded-xl bg-[var(--nlm-surface)] border border-purple-500/20 text-[11px] text-[var(--nlm-text-secondary)] space-y-1 animate-fadeIn">
                        <div className="font-bold text-purple-500">Langkah Mendapatkan Kunci OpenRouter:</div>
                        <ol className="list-decimal list-inside space-y-0.5">
                          <li>Kunjungi <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="text-blue-500 underline">openrouter.ai/keys</a>.</li>
                          <li>Masuk dengan Google atau GitHub.</li>
                          <li>Klik <strong>Create Key</strong> dan salin kunci <code>sk-or-...</code>.</li>
                        </ol>
                      </div>
                    )}
                  </div>
                </div>

                {/* API Kustom Section */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-bold text-xs text-[var(--nlm-text-primary)]">
                      API Kustom Pengguna ({customApis.length})
                    </h5>
                    <button
                      type="button"
                      onClick={() => setShowAddCustom(!showAddCustom)}
                      className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] flex items-center space-x-1.5 transition cursor-pointer shadow-xs"
                    >
                      <i className="fa-solid fa-plus text-[10px]"></i>
                      <span>Tambah API Kustom</span>
                    </button>
                  </div>

                  {showAddCustom && (
                    <form onSubmit={handleAddCustomApi} className="p-4 rounded-2xl border border-blue-500/30 bg-[var(--nlm-surface-variant)] space-y-3 mb-3 animate-fadeIn">
                      <div className="font-bold text-xs text-blue-500">Konfigurasi API Kustom Baru:</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] text-[var(--nlm-text-tertiary)] mb-1">Nama Provider</label>
                          <input
                            type="text"
                            required
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value)}
                            placeholder="Contoh: Together AI, Ollama Local"
                            className="w-full bg-[var(--nlm-surface)] border border-[var(--nlm-border)] rounded-xl p-2 text-xs text-[var(--nlm-text-primary)] focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-[var(--nlm-text-tertiary)] mb-1">Base URL (OpenAI-Compatible)</label>
                          <input
                            type="text"
                            required
                            value={customBaseUrl}
                            onChange={(e) => setCustomBaseUrl(e.target.value)}
                            placeholder="https://api.example.com/v1"
                            className="w-full bg-[var(--nlm-surface)] border border-[var(--nlm-border)] rounded-xl p-2 text-xs text-[var(--nlm-text-primary)] font-mono focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] text-[var(--nlm-text-tertiary)] mb-1">Model ID</label>
                          <input
                            type="text"
                            value={customModelId}
                            onChange={(e) => setCustomModelId(e.target.value)}
                            placeholder="Contoh: llama3:latest"
                            className="w-full bg-[var(--nlm-surface)] border border-[var(--nlm-border)] rounded-xl p-2 text-xs text-[var(--nlm-text-primary)] font-mono focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-[var(--nlm-text-tertiary)] mb-1">API Key (Opsional untuk lokal)</label>
                          <input
                            type="password"
                            value={customApiKey}
                            onChange={(e) => setCustomApiKey(e.target.value)}
                            placeholder="Bearer Token Kustom"
                            className="w-full bg-[var(--nlm-surface)] border border-[var(--nlm-border)] rounded-xl p-2 text-xs text-[var(--nlm-text-primary)] font-mono focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowAddCustom(false)}
                          className="px-3 py-1.5 rounded-xl border border-[var(--nlm-border)] text-xs text-[var(--nlm-text-tertiary)] hover:bg-[var(--nlm-surface)]"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
                        >
                          Simpan API Kustom
                        </button>
                      </div>
                    </form>
                  )}

                  {customApis.length === 0 ? (
                    <div className="p-3 rounded-xl border border-[var(--nlm-border)] bg-[var(--nlm-surface-variant)] text-center text-[11px] text-[var(--nlm-text-tertiary)]">
                      Belum ada API kustom ditambahkan. Klik tombol di atas untuk menambah endpoint mandiri.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {customApis.map((api) => (
                        <div
                          key={api.id}
                          className="p-3 rounded-xl border border-[var(--nlm-border)] bg-[var(--nlm-surface-variant)] flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-xs text-[var(--nlm-text-primary)]">{api.name}</div>
                            <div className="text-[10px] text-[var(--nlm-text-tertiary)] font-mono">
                              {api.baseUrl} &bull; Model: {api.modelId}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomApi(api.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 text-xs transition cursor-pointer"
                            title="Hapus API Kustom"
                          >
                            <i className="fa-regular fa-trash-can"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: ATUR PRIORITAS AI (DRAG & DROP + TOMBOL REORDER) */}
            {activeTab === 'routing' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-[var(--nlm-text-primary)]">
                      Urutan Prioritas Router &amp; Failover AI
                    </h4>
                    <p className="text-[11px] text-[var(--nlm-text-tertiary)]">
                      Tarik &amp; lepas (drag and drop) kartu atau gunakan tombol panah (↑ / ↓) untuk mengatur urutan eksekusi.
                    </p>
                  </div>
                  <button
                    onClick={handleResetPriority}
                    className="px-3 py-1.5 rounded-xl border border-[var(--nlm-border)] hover:bg-[var(--nlm-surface-hover)] text-xs font-semibold text-[var(--nlm-text-tertiary)] hover:text-[var(--nlm-text-primary)] transition cursor-pointer"
                  >
                    Reset Urutan
                  </button>
                </div>

                <div className="space-y-2.5">
                  {routerPriorities.map((item, index) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragEnter={(e) => handleDragEnter(e, index)}
                      onDragEnd={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                      className={`p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between cursor-grab active:cursor-grabbing select-none ${
                        index === 0
                          ? 'border-blue-500/40 bg-blue-500/5 shadow-xs'
                          : 'border-[var(--nlm-border)] bg-[var(--nlm-surface-variant)] hover:border-blue-500/30'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        {/* Drag Handle & Index Badge */}
                        <div className="flex items-center space-x-2 shrink-0">
                          <i className="fa-solid fa-grip-vertical text-slate-400 text-xs cursor-grab"></i>
                          <div className={`w-6 h-6 rounded-full ${item.color || 'bg-slate-700'} text-white font-bold text-xs flex items-center justify-center shadow-xs`}>
                            {index + 1}
                          </div>
                        </div>

                        {/* Provider Detail */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-xs text-[var(--nlm-text-primary)] truncate">
                              {item.name}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded-md font-semibold bg-blue-500/15 text-blue-500">
                              {index === 0 ? 'Prioritas 1 (Utama)' : `Failover ${index}`}
                            </span>
                          </div>
                          <p className="text-[10px] text-[var(--nlm-text-tertiary)] truncate mt-0.5">
                            {item.desc}
                          </p>
                        </div>
                      </div>

                      {/* Move Up & Move Down Action Buttons */}
                      <div className="flex items-center space-x-1 shrink-0 ml-2">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveUp(index)}
                          className="w-7 h-7 rounded-lg border border-[var(--nlm-border)] bg-[var(--nlm-surface)] hover:bg-[var(--nlm-surface-hover)] disabled:opacity-30 disabled:cursor-not-allowed text-[var(--nlm-text-secondary)] flex items-center justify-center text-xs transition cursor-pointer"
                          title="Pindahkan ke Atas"
                        >
                          <i className="fa-solid fa-arrow-up text-[10px]"></i>
                        </button>
                        <button
                          type="button"
                          disabled={index === routerPriorities.length - 1}
                          onClick={() => handleMoveDown(index)}
                          className="w-7 h-7 rounded-lg border border-[var(--nlm-border)] bg-[var(--nlm-surface)] hover:bg-[var(--nlm-surface-hover)] disabled:opacity-30 disabled:cursor-not-allowed text-[var(--nlm-text-secondary)] flex items-center justify-center text-xs transition cursor-pointer"
                          title="Pindahkan ke Bawah"
                        >
                          <i className="fa-solid fa-arrow-down text-[10px]"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[11px] flex items-center space-x-2">
                  <i className="fa-solid fa-circle-info shrink-0"></i>
                  <span>
                    Heuristic Multi-LLM Router NoteRoute otomatis mengirim pertanyaan ke model urutan 1, dan akan otomatis beralih ke urutan berikutnya jika terjadi status kuota habis (429 Rate Limited).
                  </span>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Embedded Visual Photo Cropper Modal */}
      <ImageCropperModal
        isOpen={cropperOpen}
        imageSrc={selectedImageSrc}
        onClose={() => setCropperOpen(false)}
        onSave={handleSaveCroppedAvatar}
      />
    </div>
  );
}
