import React from 'react';
import { 
  Sparkles, 
  Server, 
  Database, 
  User, 
  LogOut, 
  LogIn, 
  Layers,
  Download
} from 'lucide-react';

export default function Navbar({ 
  user, 
  onOpenAuth, 
  onLogout, 
  serverHealth, 
  activeView, 
  setActiveView 
}) {
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30 shrink-0">
      {/* Brand & Mode Switcher */}
      <div className="flex items-center space-x-4">
        <a href="/" className="flex items-center space-x-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-sky-500 text-white flex items-center justify-center font-bold text-base shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight text-white group-hover:text-indigo-400 transition-colors">
              Note<span className="text-indigo-400">Route</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono -mt-1">Knowledge Agent</span>
          </div>
        </a>

        {/* Status Chip */}
        <div className="hidden md:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs">
          <span className={`w-2 h-2 rounded-full ${serverHealth?.status === 'healthy' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span className="text-slate-300 font-medium text-[11px]">
            {serverHealth?.database === 'connected' ? 'MongoDB Atlas Aktif' : 'Engine Standalone'}
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Direct Link to APK Download */}
        <a 
          href="https://github.com/CRootAgent/noteroute/releases/latest/download/app-release.apk"
          target="_blank"
          rel="noreferrer"
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          title="Unduh APK Resmi Android"
        >
          <Download className="w-3.5 h-3.5 text-indigo-400" />
          <span>Unduh APK</span>
        </a>

        {/* User Profile / Auth Button */}
        {user ? (
          <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center text-xs font-bold font-mono">
              {getInitials(user.name)}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-200 leading-tight">{user.name}</span>
              <span className="text-[10px] text-slate-400 font-mono leading-tight">{user.email}</span>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
              title="Keluar Akun"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Masuk / Daftar</span>
          </button>
        )}
      </div>
    </header>
  );
}
