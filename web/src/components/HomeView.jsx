import React, { useState } from 'react';

export default function HomeView({
  notebooks,
  onOpenNotebook,
  onCreateNotebook,
  onRenameNotebook,
  onDeleteNotebook,
  searchQuery,
  viewMode,
  user
}) {
  const [sortOrder, setSortOrder] = useState('recent'); // 'recent', 'alpha', 'sources'
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newNotebookTitle, setNewNotebookTitle] = useState('');
  const [editingNotebook, setEditingNotebook] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  // Filter notebooks by search query
  const query = (searchQuery || '').toLowerCase().trim();
  let filtered = notebooks.filter((nb) =>
    (nb.name || '').toLowerCase().includes(query)
  );

  // Sort notebooks
  if (sortOrder === 'alpha') {
    filtered.sort((a, b) =>
      (a.name || '').localeCompare(b.name || '', undefined, {
        sensitivity: 'base',
        numeric: true
      })
    );
  } else if (sortOrder === 'sources') {
    filtered.sort(
      (a, b) => (b.document_count || 0) - (a.document_count || 0)
    );
  } else {
    // recent
    filtered.sort(
      (a, b) =>
        new Date(b.updated_at || b.created_at || 0) -
        new Date(a.updated_at || a.created_at || 0)
    );
  }

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newNotebookTitle.trim()) return;
    onCreateNotebook(newNotebookTitle.trim());
    setNewNotebookTitle('');
    setIsCreateModalOpen(false);
  };

  const handleRenameSubmit = (e) => {
    e.preventDefault();
    if (!editTitle.trim() || !editingNotebook) return;
    onRenameNotebook(editingNotebook.id, editTitle.trim());
    setEditingNotebook(null);
    setEditTitle('');
  };

  const colors = ['blue', 'purple', 'emerald', 'amber', 'rose', 'indigo'];

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 select-none">
      
      {/* Welcome Banner */}
      <div className="mb-6 sm:mb-8 p-6 rounded-3xl bg-[var(--nlm-surface)] border border-[var(--nlm-border)] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Personal Knowledge Agent
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--nlm-text-primary)]">
            Selamat datang di NoteRoute{user?.name ? `, ${user.name}` : ''}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--nlm-text-secondary)]">
            Kelola berkas materi kuliah dan tanyakan konteks dokumen dengan perutean multi-LLM hemat biaya.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center space-x-2 shadow-md shadow-blue-500/20 active:scale-95 transition cursor-pointer shrink-0"
        >
          <i className="fa-solid fa-plus text-xs"></i>
          <span>Notebook baru</span>
        </button>
      </div>

      {/* Section Header: [Notebook terbaru] & Sorting */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--nlm-text-primary)]">
            Notebook terbaru
          </h1>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="p-1.5 rounded-lg hover:bg-[var(--nlm-surface-hover)] text-[var(--nlm-text-tertiary)] hover:text-[var(--nlm-text-primary)] transition flex items-center space-x-1 cursor-pointer"
              title="Urutkan notebook"
            >
              <i className="fa-solid fa-bars-staggered text-sm"></i>
            </button>

            {isSortOpen && (
              <div className="absolute left-0 mt-2 w-48 bg-[var(--nlm-surface)] border border-[var(--nlm-border)] rounded-2xl shadow-xl p-1.5 z-30 animate-dropdown">
                <button
                  onClick={() => {
                    setSortOrder('recent');
                    setIsSortOpen(false);
                  }}
                  className={`w-full px-3 py-1.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                    sortOrder === 'recent'
                      ? 'text-blue-500 bg-blue-500/10'
                      : 'text-[var(--nlm-text-secondary)] hover:bg-[var(--nlm-surface-hover)]'
                  }`}
                >
                  <span>Terakhir diedit</span>
                  {sortOrder === 'recent' && <i className="fa-solid fa-check text-[10px]"></i>}
                </button>
                <button
                  onClick={() => {
                    setSortOrder('alpha');
                    setIsSortOpen(false);
                  }}
                  className={`w-full px-3 py-1.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                    sortOrder === 'alpha'
                      ? 'text-blue-500 bg-blue-500/10'
                      : 'text-[var(--nlm-text-secondary)] hover:bg-[var(--nlm-surface-hover)]'
                  }`}
                >
                  <span>Nama (A &ndash; Z)</span>
                  {sortOrder === 'alpha' && <i className="fa-solid fa-check text-[10px]"></i>}
                </button>
                <button
                  onClick={() => {
                    setSortOrder('sources');
                    setIsSortOpen(false);
                  }}
                  className={`w-full px-3 py-1.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                    sortOrder === 'sources'
                      ? 'text-blue-500 bg-blue-500/10'
                      : 'text-[var(--nlm-text-secondary)] hover:bg-[var(--nlm-surface-hover)]'
                  }`}
                >
                  <span>Jumlah sumber terbanyak</span>
                  {sortOrder === 'sources' && <i className="fa-solid fa-check text-[10px]"></i>}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="text-xs text-[var(--nlm-text-tertiary)] font-mono">
          {notebooks.length} Notebook Terdaftar
        </div>
      </div>

      {/* Empty State */}
      {notebooks.length === 0 ? (
        <div className="text-center py-16 px-4 space-y-4 rounded-3xl border-2 border-dashed border-[var(--nlm-border)] bg-[var(--nlm-surface)]/50">
          <div className="w-16 h-16 rounded-3xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl mx-auto shadow-inner">
            <i className="fa-regular fa-folder-open"></i>
          </div>
          <div className="max-w-sm mx-auto space-y-1.5">
            <h3 className="font-bold text-base text-[var(--nlm-text-primary)]">Belum Ada Notebook</h3>
            <p className="text-xs text-[var(--nlm-text-secondary)] leading-relaxed">
              Mulai buat notebook pertama Anda untuk menganalisis dokumen dan catatan dengan perutean multi-LLM.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/25 transition inline-flex items-center space-x-2 cursor-pointer"
          >
            <i className="fa-solid fa-plus text-xs"></i>
            <span>Buat Notebook Baru</span>
          </button>
        </div>
      ) : filtered.length === 0 ? (
        /* Empty Search State */
        <div className="text-center py-16">
          <div className="w-12 h-12 rounded-2xl bg-[var(--nlm-surface-variant)] text-[var(--nlm-text-tertiary)] flex items-center justify-center text-xl mx-auto mb-3">
            <i className="fa-solid fa-folder-open"></i>
          </div>
          <h3 className="text-sm font-bold text-[var(--nlm-text-primary)]">Tidak ada notebook yang cocok</h3>
          <p className="text-xs text-[var(--nlm-text-tertiary)] mt-1">Coba kata kunci lain atau buat notebook baru.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          
          {/* Card: + Buat Baru */}
          <div
            onClick={() => setIsCreateModalOpen(true)}
            className="notebook-card p-4 rounded-3xl border-2 border-dashed border-[var(--nlm-border)] hover:border-blue-500/50 hover:bg-blue-500/5 cursor-pointer flex flex-col items-center justify-center h-44 sm:h-48 group text-center space-y-2 transition"
          >
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-base group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-plus"></i>
            </div>
            <div className="font-bold text-xs sm:text-sm text-[var(--nlm-text-primary)] group-hover:text-blue-600 dark:group-hover:text-blue-400">
              Buat notebook baru
            </div>
            <div className="text-[10px] text-[var(--nlm-text-tertiary)]">
              PDF, DOCX, Markdown
            </div>
          </div>

          {/* Notebook Cards */}
          {filtered.map((nb, idx) => {
            const color = colors[idx % colors.length];
            const isMenuOpen = activeMenuId === nb.id;

            return (
              <div
                key={nb.id}
                onClick={() => onOpenNotebook(nb)}
                className="notebook-card p-4 rounded-3xl bg-[var(--nlm-card-bg)] border border-[var(--nlm-card-border)] hover:border-[var(--nlm-card-hover-border)] cursor-pointer flex flex-col justify-between h-44 sm:h-48 group relative shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div className={`w-9 h-9 rounded-2xl bg-${color}-500/15 text-${color}-500 flex items-center justify-center text-base shadow-xs`}>
                    <i className="fa-solid fa-book-bookmark"></i>
                  </div>

                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setActiveMenuId(isMenuOpen ? null : nb.id)}
                      className="w-7 h-7 rounded-full text-[var(--nlm-text-tertiary)] hover:text-[var(--nlm-text-primary)] hover:bg-[var(--nlm-surface-hover)] flex items-center justify-center transition cursor-pointer"
                      title="Opsi lainnya"
                    >
                      <i className="fa-solid fa-ellipsis-vertical text-xs"></i>
                    </button>

                    {/* Context Menu */}
                    {isMenuOpen && (
                      <div className="absolute right-0 mt-1 w-44 bg-[var(--nlm-surface)] border border-[var(--nlm-border)] rounded-2xl shadow-xl p-1 z-30 animate-dropdown text-xs">
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            onOpenNotebook(nb);
                          }}
                          className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-[var(--nlm-surface-hover)] text-[var(--nlm-text-primary)] flex items-center space-x-2 transition cursor-pointer"
                        >
                          <i className="fa-solid fa-folder-open text-blue-500 text-[11px]"></i>
                          <span>Buka Workspace</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            setEditingNotebook(nb);
                            setEditTitle(nb.name);
                          }}
                          className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-[var(--nlm-surface-hover)] text-[var(--nlm-text-primary)] flex items-center space-x-2 transition cursor-pointer"
                        >
                          <i className="fa-solid fa-pen text-amber-500 text-[11px]"></i>
                          <span>Ubah Nama</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            if (confirm(`Hapus notebook "${nb.name}" beserta seluruh berkasnya?`)) {
                              onDeleteNotebook(nb.id);
                            }
                          }}
                          className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center space-x-2 transition cursor-pointer font-medium"
                        >
                          <i className="fa-regular fa-trash-can text-[11px]"></i>
                          <span>Hapus Notebook</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-xs sm:text-sm text-[var(--nlm-text-primary)] line-clamp-2 leading-snug group-hover:text-blue-500 transition-colors">
                    {nb.name}
                  </h3>
                  <div className="flex items-center space-x-1.5 text-[11px] text-[var(--nlm-text-tertiary)] font-medium">
                    <span>
                      {nb.updated_at
                        ? new Date(nb.updated_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short'
                          })
                        : 'Baru'}
                    </span>
                    <span>&bull;</span>
                    <span className={nb.document_count > 0 ? 'text-blue-500 dark:text-blue-400 font-semibold' : ''}>
                      {nb.document_count || 0} sumber
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="overflow-hidden rounded-2xl border border-[var(--nlm-border)] bg-[var(--nlm-surface)] shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[var(--nlm-border)] bg-[var(--nlm-surface-variant)] text-[var(--nlm-text-tertiary)] font-semibold uppercase tracking-wider">
                <tr>
                  <th scope="col" className="py-3 px-4">Nama Notebook</th>
                  <th scope="col" className="py-3 px-4 hidden sm:table-cell">Terakhir Diedit</th>
                  <th scope="col" className="py-3 px-4">Sumber</th>
                  <th scope="col" className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--nlm-border-subtle)] text-[var(--nlm-text-primary)]">
                {filtered.map((nb) => (
                  <tr
                    key={nb.id}
                    onClick={() => onOpenNotebook(nb)}
                    className="hover:bg-[var(--nlm-surface-hover)] cursor-pointer transition"
                  >
                    <td className="py-3 px-4 font-bold flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                        <i className="fa-solid fa-book-bookmark text-xs"></i>
                      </div>
                      <span className="truncate max-w-xs">{nb.name}</span>
                    </td>
                    <td className="py-3 px-4 text-[var(--nlm-text-tertiary)] hidden sm:table-cell">
                      {nb.updated_at ? new Date(nb.updated_at).toLocaleDateString('id-ID') : 'Baru'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 font-semibold text-[11px]">
                        {nb.document_count || 0} sumber
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onOpenNotebook(nb)}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold transition"
                      >
                        Buka
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: BUAT NOTEBOOK BARU */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-[var(--nlm-modal-overlay)] backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--nlm-surface)] border border-[var(--nlm-border)] rounded-3xl p-6 shadow-2xl modal-animate-in space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--nlm-border)]">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-sm">
                  <i className="fa-solid fa-plus"></i>
                </div>
                <h3 className="font-bold text-sm text-[var(--nlm-text-primary)]">Buat Notebook Baru</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-[var(--nlm-surface-hover)] text-[var(--nlm-text-tertiary)] flex items-center justify-center"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--nlm-text-secondary)] mb-1.5">
                  Judul Notebook / Materi Kuliah
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newNotebookTitle}
                  onChange={(e) => setNewNotebookTitle(e.target.value)}
                  placeholder="Contoh: Sistem Terdistribusi - Bab 3"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--nlm-surface-variant)] border border-[var(--nlm-border)] text-xs sm:text-sm text-[var(--nlm-text-primary)] focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--nlm-text-secondary)] hover:bg-[var(--nlm-surface-hover)] transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition cursor-pointer"
                >
                  Buat Notebook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UBAH NAMA NOTEBOOK */}
      {editingNotebook && (
        <div className="fixed inset-0 z-50 bg-[var(--nlm-modal-overlay)] backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--nlm-surface)] border border-[var(--nlm-border)] rounded-3xl p-6 shadow-2xl modal-animate-in space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--nlm-border)]">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-sm">
                  <i className="fa-solid fa-pen"></i>
                </div>
                <h3 className="font-bold text-sm text-[var(--nlm-text-primary)]">Ubah Nama Notebook</h3>
              </div>
              <button
                onClick={() => setEditingNotebook(null)}
                className="w-7 h-7 rounded-full hover:bg-[var(--nlm-surface-hover)] text-[var(--nlm-text-tertiary)] flex items-center justify-center"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleRenameSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--nlm-text-secondary)] mb-1.5">
                  Nama Baru
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--nlm-surface-variant)] border border-[var(--nlm-border)] text-xs sm:text-sm text-[var(--nlm-text-primary)] focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingNotebook(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--nlm-text-secondary)] hover:bg-[var(--nlm-surface-hover)] transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}
