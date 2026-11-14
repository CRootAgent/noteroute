import React, { useState } from 'react';
import { apiLogin, apiRegister } from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = 'signin' }) {
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showSignUpConfirmPassword, setShowSignUpConfirmPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Strict Password Validation Rule: >= 8 chars, uppercase, lowercase, number, symbol
  const validatePassword = (pwd) => {
    if (!pwd || pwd.length < 8) {
      return 'Kata sandi wajib minimal 8 karakter.';
    }
    if (!/[A-Z]/.test(pwd)) {
      return 'Kata sandi wajib memuat minimal 1 huruf kapital (A-Z).';
    }
    if (!/[a-z]/.test(pwd)) {
      return 'Kata sandi wajib memuat minimal 1 huruf kecil (a-z).';
    }
    if (!/[0-9]/.test(pwd)) {
      return 'Kata sandi wajib memuat minimal 1 angka (0-9).';
    }
    if (!/[^A-Za-z0-9]/.test(pwd)) {
      return 'Kata sandi wajib memuat minimal 1 simbol khusus (!@#$%^&* dll).';
    }
    return null;
  };

  const getRegisteredUsers = () => {
    try {
      const data = localStorage.getItem('noteroute_registered_users');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  const saveRegisteredUser = (userData) => {
    try {
      const users = getRegisteredUsers();
      const existingIdx = users.findIndex(
        (u) => u.email.toLowerCase() === userData.email.toLowerCase()
      );
      if (existingIdx >= 0) {
        users[existingIdx] = userData;
      } else {
        users.push(userData);
      }
      localStorage.setItem('noteroute_registered_users', JSON.stringify(users));
    } catch (e) {
      console.warn('Gagal menyimpan user:', e);
    }
  };

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!signInEmail.trim() || !signInPassword) {
      setErrorMsg('Email dan kata sandi wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      let loggedInUser = null;

      // 1. Try real backend login
      try {
        const res = await apiLogin(signInEmail.trim().toLowerCase(), signInPassword);
        if (res && res.user) {
          loggedInUser = res.user;
        }
      } catch (err) {
        // Fallback check against local registered users
      }

      if (!loggedInUser) {
        const registered = getRegisteredUsers();
        const found = registered.find(
          (u) =>
            u.email.toLowerCase() === signInEmail.trim().toLowerCase() &&
            u.password === signInPassword
        );
        if (found) {
          loggedInUser = {
            id: found.id,
            name: found.name,
            email: found.email,
            avatar: found.avatar || null
          };
        }
      }

      // Reject random unregistered login
      if (!loggedInUser) {
        setErrorMsg(
          'Akses Ditolak: Email belum terdaftar atau kata sandi tidak cocok. Silakan daftar akun baru terlebih dahulu.'
        );
        setLoading(false);
        return;
      }

      // Retrieve saved custom avatar if exists
      const savedAvatar = localStorage.getItem('noteroute_avatar_' + loggedInUser.email);
      if (savedAvatar) {
        loggedInUser.avatar = savedAvatar;
      }

      onAuthSuccess(loggedInUser);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Gagal masuk ke sistem.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!signUpName.trim()) {
      setErrorMsg('Nama lengkap wajib diisi.');
      return;
    }
    if (!signUpEmail.trim() || !signUpEmail.includes('@')) {
      setErrorMsg('Alamat email valid wajib diisi.');
      return;
    }
    const pwdErr = validatePassword(signUpPassword);
    if (pwdErr) {
      setErrorMsg(pwdErr);
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setLoading(true);
    try {
      // 1. Try backend registration
      try {
        await apiRegister(signUpName.trim(), signUpEmail.trim().toLowerCase(), signUpPassword);
      } catch (err) {
        // Fallback local save
      }

      const newUser = {
        id: 'u_' + Date.now(),
        name: signUpName.trim(),
        email: signUpEmail.trim().toLowerCase(),
        password: signUpPassword,
        avatar: null
      };
      saveRegisteredUser(newUser);

      setSuccessMsg('Pendaftaran berhasil! Silakan masuk dengan akun baru Anda.');
      setIsSignUp(false);
      setSignInEmail(signUpEmail.trim().toLowerCase());
      setSignInPassword('');
      setSignUpPassword('');
      setSignUpConfirmPassword('');
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat pendaftaran.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[var(--nlm-modal-overlay)] backdrop-blur-xs flex items-center justify-center p-4 select-none modal-animate-in">
      <div
        className={`auth-slider-box ${
          isSignUp ? 'right-panel-active' : ''
        } border border-[var(--nlm-border)] relative`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-8 h-8 rounded-full bg-[var(--nlm-surface-variant)] hover:bg-[var(--nlm-surface-hover)] text-[var(--nlm-text-tertiary)] hover:text-[var(--nlm-text-primary)] flex items-center justify-center transition cursor-pointer"
        >
          <i className="fa-solid fa-xmark text-sm"></i>
        </button>

        {/* 1. SIGN IN PANEL (LEFT) */}
        <div className="sign-in-panel form-panel p-6 sm:p-10 flex flex-col justify-center">
          <div className="space-y-1 mb-5">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--nlm-text-primary)]">
              Selamat Datang Kembali
            </h2>
            <p className="text-xs text-[var(--nlm-text-tertiary)]">
              Masuk ke NoteRoute untuk mengakses ruang kerja &amp; catatan rujukan Anda.
            </p>
          </div>

          {errorMsg && !isSignUp && (
            <div className="mb-4 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center space-x-2">
              <i className="fa-solid fa-circle-exclamation text-xs shrink-0"></i>
              <span className="leading-snug">{errorMsg}</span>
            </div>
          )}

          {successMsg && !isSignUp && (
            <div className="mb-4 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center space-x-2">
              <i className="fa-solid fa-circle-check text-xs shrink-0"></i>
              <span className="leading-snug">{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSignInSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[var(--nlm-text-secondary)] mb-1">
                Alamat Email
              </label>
              <div className="relative">
                <i className="fa-regular fa-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--nlm-text-tertiary)]"></i>
                <input
                  type="email"
                  required
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[var(--nlm-surface-variant)] border border-[var(--nlm-border)] text-xs sm:text-sm text-[var(--nlm-text-primary)] focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--nlm-text-secondary)] mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <i className="fa-solid fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--nlm-text-tertiary)]"></i>
                <input
                  type={showSignInPassword ? 'text' : 'password'}
                  required
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-[var(--nlm-surface-variant)] border border-[var(--nlm-border)] text-xs sm:text-sm text-[var(--nlm-text-primary)] focus:outline-none focus:border-blue-500 transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowSignInPassword(!showSignInPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--nlm-text-tertiary)] hover:text-[var(--nlm-text-primary)]"
                >
                  <i className={showSignInPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm transition shadow-md shadow-blue-500/20 cursor-pointer"
            >
              {loading ? 'Memvalidasi Kredensial...' : 'Masuk ke Akun'}
            </button>
          </form>

          {/* Mobile Switcher */}
          <div className="mt-4 pt-3 border-t border-[var(--nlm-border-subtle)] text-center md:hidden">
            <span className="text-xs text-[var(--nlm-text-tertiary)]">Belum punya akun?</span>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setErrorMsg('');
              }}
              className="ml-1 text-xs font-bold text-blue-500 hover:underline"
            >
              Daftar akun baru
            </button>
          </div>
        </div>

        {/* 2. SIGN UP PANEL (RIGHT FORM) */}
        <div className="sign-up-panel form-panel p-6 sm:p-10 flex flex-col justify-center">
          <div className="space-y-1 mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--nlm-text-primary)]">
              Mulai dengan NoteRoute
            </h2>
            <p className="text-xs text-[var(--nlm-text-tertiary)]">
              Daftar gratis untuk menyinkronkan dokumen laptop dan AI di Android.
            </p>
          </div>

          {errorMsg && isSignUp && (
            <div className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center space-x-2">
              <i className="fa-solid fa-circle-exclamation text-xs shrink-0"></i>
              <span className="leading-snug">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSignUpSubmit} className="space-y-2.5">
            <div>
              <label className="block text-xs font-semibold text-[var(--nlm-text-secondary)] mb-1">
                Nama Lengkap
              </label>
              <div className="relative">
                <i className="fa-regular fa-user absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--nlm-text-tertiary)]"></i>
                <input
                  type="text"
                  required
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  placeholder="Contoh: Ahmad Zakky"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[var(--nlm-surface-variant)] border border-[var(--nlm-border)] text-xs text-[var(--nlm-text-primary)] focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--nlm-text-secondary)] mb-1">
                Alamat Email
              </label>
              <div className="relative">
                <i className="fa-regular fa-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--nlm-text-tertiary)]"></i>
                <input
                  type="email"
                  required
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[var(--nlm-surface-variant)] border border-[var(--nlm-border)] text-xs text-[var(--nlm-text-primary)] focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--nlm-text-secondary)] mb-1">
                Kata Sandi (Wajib 8+ Karakter: Kapital, Kecil, Angka, Simbol)
              </label>
              <div className="relative">
                <i className="fa-solid fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--nlm-text-tertiary)]"></i>
                <input
                  type={showSignUpPassword ? 'text' : 'password'}
                  required
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2 rounded-xl bg-[var(--nlm-surface-variant)] border border-[var(--nlm-border)] text-xs text-[var(--nlm-text-primary)] focus:outline-none focus:border-blue-500 transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--nlm-text-tertiary)]"
                >
                  <i className={showSignUpPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'}></i>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--nlm-text-secondary)] mb-1">
                Konfirmasi Kata Sandi
              </label>
              <div className="relative">
                <i className="fa-solid fa-shield-halved absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--nlm-text-tertiary)]"></i>
                <input
                  type={showSignUpConfirmPassword ? 'text' : 'password'}
                  required
                  value={signUpConfirmPassword}
                  onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2 rounded-xl bg-[var(--nlm-surface-variant)] border border-[var(--nlm-border)] text-xs text-[var(--nlm-text-primary)] focus:outline-none focus:border-blue-500 transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowSignUpConfirmPassword(!showSignUpConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--nlm-text-tertiary)]"
                >
                  <i className={showSignUpConfirmPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs transition shadow-md shadow-blue-500/20 cursor-pointer"
            >
              {loading ? 'Mendaftarkan Akun...' : 'Buat Akun Sekarang'}
            </button>
          </form>

          {/* Mobile Switcher */}
          <div className="mt-3 pt-2 border-t border-[var(--nlm-border-subtle)] text-center md:hidden">
            <span className="text-xs text-[var(--nlm-text-tertiary)]">Sudah punya akun?</span>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setErrorMsg('');
              }}
              className="ml-1 text-xs font-bold text-blue-500 hover:underline"
            >
              Masuk di sini
            </button>
          </div>
        </div>

        {/* 3. OVERLAY SLIDER CONTAINER (DESKTOP GRADIENT SLIDER) */}
        <div className="overlay-slider-container">
          <div className="overlay-slider">
            
            {/* OVERLAY LEFT CONTENT (VISIBLE WHEN SIGN UP IS ACTIVE) */}
            <div className="overlay-content overlay-left-content space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-2xl mx-auto shadow-inner">
                <i className="fa-solid fa-arrow-right-to-bracket text-white"></i>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Sudah Memiliki Akun?</h2>
              <p className="text-xs text-blue-100 leading-relaxed max-w-xs">
                Silakan masuk dengan kredensial terdaftar Anda untuk melanjutkan eksplorasi dokumen.
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setErrorMsg('');
                }}
                className="px-6 py-2.5 rounded-full border-2 border-white/80 hover:border-white hover:bg-white/10 text-white font-semibold text-xs tracking-wider transition cursor-pointer shadow-md"
              >
                Masuk Sekarang
              </button>
            </div>

            {/* OVERLAY RIGHT CONTENT (VISIBLE WHEN SIGN IN IS ACTIVE) */}
            <div className="overlay-content overlay-right-content space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-2xl mx-auto shadow-inner">
                <i className="fa-solid fa-book-bookmark text-white"></i>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Selamat Datang di NoteRoute!</h2>
              <p className="text-xs text-blue-100 leading-relaxed max-w-xs">
                Belum memiliki akun? Daftarkan diri Anda secara gratis untuk mulai menghubungkan dokumen dan analisis AI.
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setErrorMsg('');
                }}
                className="px-6 py-2.5 rounded-full border-2 border-white/80 hover:border-white hover:bg-white/10 text-white font-semibold text-xs tracking-wider transition cursor-pointer shadow-md"
              >
                Daftar Akun Baru
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
