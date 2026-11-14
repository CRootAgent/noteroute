import React, { useState, useEffect, useRef } from 'react';

export default function Navbar({
  currentView,
  onNavigateHome,
  activeNotebook,
  onRenameNotebook,
  user,
  aiMode,
  onToggleAiMode,
  theme,
  onOpenSettings,
  onOpenAuth,
  onLogout,
  onOpenQuickGuide,
  searchQuery,
  onSearchChange,
  viewMode,
  onToggleViewMode,
  onToggleLeftSidebar,
  onToggleRightSidebar
}) {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isAppsDropdownOpen, setIsAppsDropdownOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');

  const profileDropdownRef = useRef(null);
  const appsDropdownRef = useRef(null);
  const titleInputRef = useRef(null);

  useEffect(() => {
    if (activeNotebook) {
      setTitleInput(activeNotebook.name || '');
    }
  }, [activeNotebook]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setIsProfileDropdownOpen(false);
      }
      if (appsDropdownRef.current && !appsDropdownRef.current.contains(e.target)) {
        setIsAppsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return 'AZ';
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleStartRename = () => {
    setIsEditingTitle(true);
    setTimeout(() => titleInputRef.current?.focus(), 50);
  };

  const handleSaveRename = () => {
    setIsEditingTitle(false);
    if (titleInput.trim() && titleInput !== activeNotebook?.name) {
      onRenameNotebook(titleInput.trim());
    } else {
      setTitleInput(activeNotebook?.name || '');
    }
  };

  const handleKeyDownRename = (e) => {
    if (e.key === 'Enter') {
      handleSaveRename();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
      setTitleInput(activeNotebook?.name || '');
    }
  };

  return (
    <header className="h-14 sm:h-16 border-b border-[var(--nlm-border)] bg-[var(--nlm-surface)]/95 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between sticky top-0 z-40 shrink-0 select-none transition-colors duration-200">
      
      {/* LEFT: Logo Brand & Optional Project Title */}
      <div className="flex items-center space-x-2.5 sm:space-x-3.5 min-w-0">
        <button
          onClick={onNavigateHome}
          className="flex items-center space-x-2.5 group shrink-0 cursor-pointer text-left"
          title="Beranda NoteRoute"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white flex items-center justify-center text-sm sm:text-base shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <i className="fa-solid fa-book-bookmark"></i>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5 leading-none">
              <span className="text-sm sm:text-lg font-bold tracking-tight text-[var(--nlm-text-primary)]">
                NoteRoute
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 font-mono font-semibold">
                2.0
              </span>
            </div>
            {currentView === 'home' && (
              <span className="text-[10px] text-[var(--nlm-text-tertiary)] -mt-0.5 hidden sm:block">
                Multi-LLM Grounded Notebook
              </span>
            )}
          </div>
        </button>

        {/* WORKSPACE VIEW: Editable Project Title */}
        {currentView === 'workspace' && activeNotebook && (
          <div className="flex items-center space-x-1.5 min-w-0 pl-2 border-l border-[var(--nlm-border)]">
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleSaveRename}
                onKeyDown={handleKeyDownRename}
                className="bg-[var(--nlm-surface-variant)] border border-[var(--nlm-brand)] rounded-lg px-2 py-0.5 text-xs sm:text-sm font-semibold text-[var(--nlm-text-primary)] focus:outline-none"
              />
            ) : (
              <span
                onClick={handleStartRename}
                className="font-semibold text-xs sm:text-sm text-[var(--nlm-text-primary)] tracking-tight cursor-pointer hover:underline decoration-dotted truncate max-w-[120px] xs:max-w-[180px] sm:max-w-xs md:max-w-md"
                title="Klik untuk mengubah nama proyek"
              >
                {activeNotebook.name}
              </span>
            )}
            <button
              onClick={handleStartRename}
              className="text-[var(--nlm-text-tertiary)] hover:text-[var(--nlm-brand)] text-xs p-1 shrink-0 cursor-pointer"
              title="Ubah Nama Proyek"
            >
              <i className="fa-solid fa-pen text-[10px]"></i>
            </button>
          </div>
        )}
      </div>

      {/* RIGHT: Actions, Toggles, and Profile */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        
        {/* HOMEPAGE VIEW: Search Input Pill */}
        {currentView === 'home' && (
          <div className="relative w-32 sm:w-64 lg:w-80">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--nlm-text-tertiary)]"></i>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Telusuri notebook"
              className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm rounded-full bg-[var(--nlm-search-bg)] border border-[var(--nlm-search-border)] text-[var(--nlm-text-primary)] placeholder-[var(--nlm-text-tertiary)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--nlm-text-tertiary)] hover:text-[var(--nlm-text-primary)]"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>
        )}

        {/* HOMEPAGE VIEW: Grid vs List Switcher */}
        {currentView === 'home' && (
          <div className="hidden sm:flex items-center p-0.5 rounded-full bg-[var(--nlm-surface-variant)] border border-[var(--nlm-border)]">
            <button
              onClick={() => onToggleViewMode('grid')}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[var(--nlm-surface)] text-[var(--nlm-text-primary)] shadow-xs font-bold'
                  : 'text-[var(--nlm-text-tertiary)] hover:text-[var(--nlm-text-primary)]'
              }`}
              title="Tampilan Grid"
            >
              <i className="fa-solid fa-table-cells-large text-[11px]"></i>
            </button>
            <button
              onClick={() => onToggleViewMode('list')}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[var(--nlm-surface)] text-[var(--nlm-text-primary)] shadow-xs font-bold'
                  : 'text-[var(--nlm-text-tertiary)] hover:text-[var(--nlm-text-primary)]'
              }`}
              title="Tampilan Daftar"
            >
              <i className="fa-solid fa-list text-[11px]"></i>
            </button>
          </div>
        )}

        {/* WORKSPACE VIEW: Quick Sidebar Toggles for Tablet/Mobile */}
        {currentView === 'workspace' && (
          <>
            <button
              onClick={onToggleLeftSidebar}
              className="lg:hidden px-2 py-1 rounded-lg border border-[var(--nlm-border)] bg-[var(--nlm-surface-variant)] hover:bg-[var(--nlm-surface-hover)] text-xs text-[var(--nlm-text-secondary)] flex items-center space-x-1 transition cursor-pointer"
              title="Buka Sumber"
            >
              <i className="fa-solid fa-folder-open text-amber-500 text-xs"></i>
              <span className="hidden xs:inline text-[11px] font-semibold">Sumber</span>
            </button>

            <button
              onClick={onToggleRightSidebar}
              className="lg:hidden px-2 py-1 rounded-lg border border-[var(--nlm-border)] bg-[var(--nlm-surface-variant)] hover:bg-[var(--nlm-surface-hover)] text-xs text-[var(--nlm-text-secondary)] flex items-center space-x-1 transition cursor-pointer"
              title="Buka Studio"
            >
              <i className="fa-solid fa-headphones text-purple-600 text-xs"></i>
              <span className="hidden xs:inline text-[11px] font-semibold">Studio</span>
            </button>

            {/* AI Mode Toggle (Dokumen RAG vs AI Bebas) */}
            <div className="flex items-center p-0.5 rounded-full bg-[var(--nlm-surface-variant)] border border-[var(--nlm-border)] text-xs">
              <button
                onClick={() => onToggleAiMode('document')}
                className={`px-2.5 sm:px-3 py-1 rounded-full font-semibold transition flex items-center space-x-1 sm:space-x-1.5 cursor-pointer ${
                  aiMode === 'document'
                    ? 'bg-[var(--nlm-brand)] text-white shadow-xs'
                    : 'text-[var(--nlm-text-tertiary)] hover:text-[var(--nlm-text-primary)]'
                }`}
                title="Mode Dokumen (RAG)"
              >
                <i className="fa-solid fa-file-shield text-[10px]"></i>
                <span className="hidden sm:inline text-[11px]">Dokumen</span>
              </button>
              <button
                onClick={() => onToggleAiMode('general')}
                className={`px-2.5 sm:px-3 py-1 rounded-full font-medium transition flex items-center space-x-1 sm:space-x-1.5 cursor-pointer ${
                  aiMode === 'general'
                    ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                    : 'text-[var(--nlm-text-tertiary)] hover:text-[var(--nlm-text-primary)]'
                }`}
                title="Mode AI Bebas"
              >
                <i className="fa-solid fa-globe text-[10px]"></i>
                <span className="hidden sm:inline text-[11px]">AI Bebas</span>
              </button>
            </div>
          </>
        )}

        {/* 9-Dots NoteRoute App Launcher */}
        <div className="relative" ref={appsDropdownRef}>
          <button
            onClick={() => setIsAppsDropdownOpen(!isAppsDropdownOpen)}
            className="w-8 h-8 rounded-full hover:bg-[var(--nlm-surface-hover)] text-[var(--nlm-text-secondary)] hover:text-[var(--nlm-text-primary)] flex items-center justify-center transition cursor-pointer"
            title="Aplikasi & Layanan NoteRoute"
          >
            <i className="fa-solid fa-grip text-sm"></i>
          </button>

          {isAppsDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[var(--nlm-surface)] border border-[var(--nlm-border)] rounded-2xl shadow-2xl p-3 z-50 animate-dropdown">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--nlm-text-tertiary)] px-2 mb-2 flex items-center justify-between">
                <span>Ekosistem NoteRoute</span>
                <span className="text-[10px] text-blue-500 font-normal">Multi-Platform</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                {/* 1. Beranda -> Membuka noteroute.home */}
                <a
                  href="https://crootagent.github.io/noteroute.home/"
                  className="p-2 rounded-xl hover:bg-[var(--nlm-surface-hover)] flex flex-col items-center space-y-1.5 transition group cursor-pointer"
                  title="Buka Portal Beranda NoteRoute"
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center text-base group-hover:scale-110 transition-transform">
                    <i className="fa-solid fa-compass"></i>
                  </div>
                  <span className="text-[10px] font-medium text-[var(--nlm-text-primary)]">Beranda</span>
                </a>

                {/* 2. Workspace -> Ruang Kerja Web */}
                <button
                  onClick={() => {
                    onNavigateHome();
                    setIsAppsDropdownOpen(false);
                  }}
                  className="p-2 rounded-xl hover:bg-[var(--nlm-surface-hover)] flex flex-col items-center space-y-1.5 transition group cursor-pointer"
                  title="Kembali ke Ruang Kerja Notebook"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center text-base group-hover:scale-110 transition-transform">
                    <i className="fa-solid fa-book-bookmark"></i>
                  </div>
                  <span className="text-[10px] font-medium text-[var(--nlm-text-primary)]">Workspace</span>
                </button>

                {/* 3. Android -> Ekosistem Android */}
                <a
                  href="https://crootagent.github.io/noteroute.home/#panduan"
                  className="p-2 rounded-xl hover:bg-[var(--nlm-surface-hover)] flex flex-col items-center space-y-1.5 transition group cursor-pointer"
                  title="Unduh & Pasang APK Android"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-base group-hover:scale-110 transition-transform">
                    <i className="fa-brands fa-android"></i>
                  </div>
                  <span className="text-[10px] font-medium text-[var(--nlm-text-primary)]">Android</span>
                </a>

                {/* 4. Panduan -> Modal Tutorial Cepat */}
                <button
                  onClick={() => {
                    setIsAppsDropdownOpen(false);
                    if (onOpenQuickGuide) onOpenQuickGuide();
                  }}
                  className="p-2 rounded-xl hover:bg-[var(--nlm-surface-hover)] flex flex-col items-center space-y-1.5 transition group cursor-pointer"
                  title="Buka Panduan & Tutorial"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center text-base group-hover:scale-110 transition-transform">
                    <i className="fa-solid fa-book-open"></i>
                  </div>
                  <span className="text-[10px] font-medium text-[var(--nlm-text-primary)]">Panduan</span>
                </button>
              </div>

              <div className="mt-2.5 pt-2 border-t border-[var(--nlm-border-subtle)]">
                <a
                  href="https://crootagent.github.io/noteroute.home/#panduan"
                  className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center space-x-2 text-xs shadow-xs transition"
                >
                  <i className="fa-brands fa-android text-sm"></i>
                  <span>Unduh APK Android (v1.0.0)</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar & Menu */}
        <div className="relative" ref={profileDropdownRef}>
          {user ? (
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs overflow-hidden ring-2 ring-blue-500/30 hover:scale-105 transition cursor-pointer select-none"
              title="Menu Profil Pengguna"
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span>{getInitials(user.name)}</span>
              )}
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm shadow-blue-500/20 transition cursor-pointer"
            >
              <i className="fa-solid fa-arrow-right-to-bracket text-xs"></i>
              <span>Masuk / Daftar</span>
            </button>
          )}

          {/* Profile Dropdown Menu */}
          {user && isProfileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-[var(--nlm-surface)] border border-[var(--nlm-border)] rounded-2xl shadow-xl p-2 z-50 animate-dropdown">
              <div className="p-2.5 border-b border-[var(--nlm-border-subtle)] flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0 overflow-hidden ring-2 ring-blue-500/20">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{getInitials(user.name)}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-[var(--nlm-text-primary)] truncate">
                    {user.name}
                  </div>
                  <div className="text-[11px] text-[var(--nlm-text-tertiary)] truncate">
                    {user.email}
                  </div>
                  <div className="text-[10px] text-emerald-500 font-semibold mt-0.5 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>MongoDB Atlas &bull; Aktif</span>
                  </div>
                </div>
              </div>

              <div className="py-1 text-xs text-[var(--nlm-text-secondary)]">
                <button
                  onClick={() => {
                    onOpenSettings('profile');
                    setIsProfileDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-[var(--nlm-surface-variant)] flex items-center space-x-2.5 transition cursor-pointer"
                >
                  <i className="fa-regular fa-user text-[11px] w-4 text-[var(--nlm-text-tertiary)]"></i>
                  <span>Profil Pengguna</span>
                </button>
                <button
                  onClick={() => {
                    onOpenSettings('appearance');
                    setIsProfileDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-[var(--nlm-surface-variant)] flex items-center space-x-2.5 transition cursor-pointer"
                >
                  <i className="fa-solid fa-palette text-[11px] w-4 text-[var(--nlm-brand)]"></i>
                  <span>Tampilan &amp; Tema (Ganti Mode)</span>
                </button>
                <button
                  onClick={() => {
                    onOpenSettings('security');
                    setIsProfileDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-[var(--nlm-surface-variant)] flex items-center space-x-2.5 transition cursor-pointer"
                >
                  <i className="fa-solid fa-shield-halved text-[11px] w-4 text-purple-500"></i>
                  <span>Keamanan Akun</span>
                </button>
                <button
                  onClick={() => {
                    onOpenSettings('api');
                    setIsProfileDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-[var(--nlm-surface-variant)] flex items-center space-x-2.5 transition cursor-pointer"
                >
                  <i className="fa-solid fa-key text-[11px] w-4 text-amber-500"></i>
                  <span>Mengatur Kunci API (Providers)</span>
                </button>
                <button
                  onClick={() => {
                    onOpenSettings('routing');
                    setIsProfileDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-[var(--nlm-surface-variant)] flex items-center space-x-2.5 transition cursor-pointer"
                >
                  <i className="fa-solid fa-arrow-down-1-9 text-[11px] w-4 text-emerald-500"></i>
                  <span>Atur Prioritas AI (Routing)</span>
                </button>
              </div>

              <div className="pt-1 border-t border-[var(--nlm-border-subtle)] space-y-0.5">
                <button
                  onClick={() => {
                    onOpenAuth();
                    setIsProfileDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-[var(--nlm-surface-variant)] text-xs text-[var(--nlm-text-secondary)] flex items-center space-x-2.5 transition cursor-pointer"
                >
                  <i className="fa-solid fa-user-plus text-[11px] w-4 text-blue-500"></i>
                  <span>Ganti / Masuk Akun Lain</span>
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    setIsProfileDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center space-x-2.5 transition cursor-pointer"
                >
                  <i className="fa-solid fa-arrow-right-from-bracket text-[11px] w-4"></i>
                  <span>Keluar Akun</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
