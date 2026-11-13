import React, { useState } from 'react';
import { 
  FolderPlus, 
  BookOpen, 
  Trash2, 
  ChevronRight, 
  Loader2, 
  Layers
} from 'lucide-react';

export default function WorkspaceSidebar({ 
  workspaces, 
  activeWorkspace, 
  onSelectWorkspace, 
  onCreateWorkspace, 
  onDeleteWorkspace, 
  loading 
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await onCreateWorkspace(name, description);
      setName('');
      setDescription('');
      setShowCreateModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <aside className="w-64 sm:w-72 border-r border-slate-800 bg-slate-900/40 flex flex-col shrink-0 select-none">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>Ruang Kerja</span>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="p-1 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white transition cursor-pointer"
          title="Tambah Ruang Kerja Baru"
        >
          <FolderPlus className="w-4 h-4" />
        </button>
      </div>

      {/* Workspace List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {loading ? (
          <div className="flex items-center justify-center p-8 text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : workspaces.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500">
            Belum ada ruang kerja. Klik tombol + untuk membuat baru.
          </div>
        ) : (
          workspaces.map((ws) => {
            const isActive = activeWorkspace?.id === ws.id;
            return (
              <div
                key={ws.id}
                onClick={() => onSelectWorkspace(ws)}
                className={`group flex items-center justify-between p-3 rounded-2xl cursor-pointer transition ${
                  isActive 
                    ? 'bg-indigo-600/15 border border-indigo-500/30 text-white' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isActive ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-800 text-slate-400'
                  }`}>
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold truncate leading-tight">{ws.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {ws.document_count || 0} berkas
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Hapus ruang kerja "${ws.name}"?`)) {
                        onDeleteWorkspace(ws.id);
                      }
                    }}
                    className="p-1 text-slate-500 hover:text-rose-400 rounded transition"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Buat Ruang Kerja Baru */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-3">Buat Ruang Kerja Baru</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Nama Notebook</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Skripsi Bab 1 & 2"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Deskripsi Singkat</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Catatan & slide rujukan"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-1"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Simpan</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}
