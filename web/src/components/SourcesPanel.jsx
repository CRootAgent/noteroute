import React, { useState } from 'react';
import { getDownloadUrl } from '../services/api';

export default function SourcesPanel({
  notebook,
  documents,
  notes,
  onOpenAddSource,
  onOpenCreateNote,
  onDeleteDocument,
  onDeleteNote,
  onPreviewDocument,
  onViewNote,
  selectedDocIds,
  onToggleSelectDoc,
  onToggleSelectAll,
  onCollapse
}) {
  const [docSort, setDocSort] = useState('name'); // 'name', 'date', 'size'
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [markedForDeletion, setMarkedForDeletion] = useState([]);

  // Sort documents
  const sortedDocs = [...documents].sort((a, b) => {
    if (docSort === 'name') return (a.filename || '').localeCompare(b.filename || '');
    if (docSort === 'size') return (b.file_size || 0) - (a.file_size || 0);
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

  const getFileIcon = (mimeType, filename) => {
    if (mimeType?.includes('pdf') || filename?.endsWith('.pdf')) {
      return <i className="fa-solid fa-file-pdf text-rose-500"></i>;
    }
    if (filename?.endsWith('.md') || filename?.endsWith('.txt')) {
      return <i className="fa-solid fa-file-lines text-indigo-500"></i>;
    }
    return <i className="fa-solid fa-file-word text-blue-500"></i>;
  };

  const allSelected = documents.length > 0 && selectedDocIds.length === documents.length;

  const toggleMarkDelete = (id) => {
    setMarkedForDeletion((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleExecuteDelete = async () => {
    if (markedForDeletion.length === 0) return;
    if (confirm(`Hapus ${markedForDeletion.length} berkas yang dipilih?`)) {
      for (const id of markedForDeletion) {
        await onDeleteDocument(id);
      }
      setMarkedForDeletion([]);
      setIsDeleteMode(false);
    }
  };

  // Calculate approximate context capacity used
  const totalBytes = documents.reduce((acc, d) => acc + (d.file_size || 0), 0);
  const capacityPercent = Math.min(100, Math.max(1, (totalBytes / (5 * 1024 * 1024)) * 100)).toFixed(1);

  return (
    <aside className="w-80 border-r border-[var(--nlm-border)] bg-[var(--nlm-surface)] flex flex-col justify-between shrink-0 select-none overflow-hidden h-full z-10">
      
      {/* Sources Header */}
      <div className="p-3.5 border-b border-[var(--nlm-border-subtle)] shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <h2 className="font-bold text-sm text-[var(--nlm-text-primary)]">Sumber</h2>
            <span className="text-xs text-[var(--nlm-text-tertiary)]">
              ({selectedDocIds.length} terpilih)
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-1.5 text-xs text-[var(--nlm-text-secondary)] cursor-pointer">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleSelectAll}
                className="w-3.5 h-3.5 rounded accent-blue-600 cursor-pointer"
              />
              <span className="text-[11px]">Semua</span>
            </label>

            {onCollapse && (
              <button
                onClick={onCollapse}
                className="w-6 h-6 rounded-md hover:bg-[var(--nlm-surface-hover)] text-[var(--nlm-text-tertiary)] hover:text-[var(--nlm-text-primary)] flex items-center justify-center transition cursor-pointer"
                title="Tutup Panel Sumber"
              >
                <i className="fa-solid fa-chevron-left text-[11px]"></i>
              </button>
            )}
          </div>
        </div>

        {/* PAIRED BUTTONS: [ + Tambahkan sumber ] & [ + Buat catatan ] */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onOpenAddSource}
            className="py-2 px-2 rounded-xl border border-[var(--nlm-border)] hover:border-blue-500 hover:bg-[var(--nlm-surface-variant)] text-xs font-semibold text-[var(--nlm-text-primary)] hover:text-blue-500 flex items-center justify-center space-x-1.5 transition cursor-pointer"
          >
            <i className="fa-solid fa-plus text-[10px] text-blue-600"></i>
            <span className="truncate">Tambahkan sumber</span>
          </button>

          <button
            onClick={onOpenCreateNote}
            className="py-2 px-2 rounded-xl border border-[var(--nlm-border)] hover:border-indigo-500 hover:bg-[var(--nlm-surface-variant)] text-xs font-semibold text-[var(--nlm-text-primary)] hover:text-indigo-500 flex items-center justify-center space-x-1.5 transition cursor-pointer"
          >
            <i className="fa-solid fa-pen-to-square text-[10px] text-indigo-500"></i>
            <span className="truncate">Buat catatan</span>
          </button>
        </div>
      </div>

      {/* Sources & Notes Scrollable List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        
        {/* SECTION A: SUMBER DOKUMEN */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--nlm-text-tertiary)] px-1 mb-2 flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <span>Sumber Berkas</span>
              <span className="font-mono text-[9px] px-1.5 py-0.2 rounded-md bg-blue-500/10 text-blue-600 font-semibold">
                {documents.length} Berkas
              </span>
            </span>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setDocSort(docSort === 'name' ? 'date' : docSort === 'date' ? 'size' : 'name')}
                className="px-1.5 py-0.5 rounded hover:bg-[var(--nlm-surface-hover)] text-[10px] text-[var(--nlm-text-tertiary)] hover:text-[var(--nlm-text-primary)] transition flex items-center space-x-0.5 cursor-pointer"
                title="Urutkan Sumber"
              >
                <i className="fa-solid fa-arrow-down-a-z text-[9px]"></i>
                <span className="capitalize">{docSort}</span>
              </button>

              <button
                onClick={() => setIsDeleteMode(!isDeleteMode)}
                className={`px-1.5 py-0.5 rounded text-[10px] transition flex items-center space-x-0.5 cursor-pointer ${
                  isDeleteMode
                    ? 'bg-rose-500 text-white'
                    : 'hover:bg-rose-500/10 text-[var(--nlm-text-tertiary)] hover:text-rose-500'
                }`}
                title="Pilih & Hapus Berkas Sumber"
              >
                <i className="fa-regular fa-trash-can text-[9px]"></i>
                <span>Hapus</span>
              </button>
            </div>
          </div>

          {/* Delete Action Bar */}
          {isDeleteMode && (
            <div className="p-2 mb-2 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between text-xs">
              <span className="text-[11px] font-semibold text-rose-500">
                {markedForDeletion.length} dipilih
              </span>
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={handleExecuteDelete}
                  disabled={markedForDeletion.length === 0}
                  className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-[10px] font-bold shadow-xs transition cursor-pointer"
                >
                  Hapus
                </button>
                <button
                  onClick={() => {
                    setIsDeleteMode(false);
                    setMarkedForDeletion([]);
                  }}
                  className="px-2 py-1 rounded-lg bg-[var(--nlm-surface)] hover:bg-[var(--nlm-surface-hover)] text-[var(--nlm-text-secondary)] text-[10px] font-medium border border-[var(--nlm-border)] transition cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          {/* Documents Container */}
          <div className="space-y-1.5">
            {documents.length === 0 ? (
              <div className="p-4 text-center text-xs text-[var(--nlm-text-tertiary)] border border-dashed border-[var(--nlm-border)] rounded-2xl my-2">
                <i className="fa-solid fa-cloud-arrow-up text-base text-blue-500 mb-1.5 block"></i>
                <p className="font-medium text-[var(--nlm-text-secondary)]">Belum ada sumber</p>
                <p className="text-[10px] mt-0.5">Unggah berkas PDF, DOCX, atau Markdown.</p>
              </div>
            ) : (
              sortedDocs.map((doc) => {
                const isSelected = selectedDocIds.includes(doc.id);
                const isMarked = markedForDeletion.includes(doc.id);

                return (
                  <div
                    key={doc.id}
                    className="p-2.5 rounded-xl border border-[var(--nlm-border)] bg-[var(--nlm-surface-variant)] hover:bg-[var(--nlm-surface-hover)] transition flex items-center justify-between text-xs group relative"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                      {isDeleteMode ? (
                        <input
                          type="checkbox"
                          checked={isMarked}
                          onChange={() => toggleMarkDelete(doc.id)}
                          className="w-3.5 h-3.5 rounded accent-rose-600 cursor-pointer shrink-0"
                        />
                      ) : (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelectDoc(doc.id)}
                          className="w-3.5 h-3.5 rounded accent-blue-600 cursor-pointer shrink-0"
                        />
                      )}

                      <span className="text-sm shrink-0">
                        {getFileIcon(doc.mime_type, doc.filename)}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div
                          className="font-medium text-xs text-[var(--nlm-text-primary)] truncate"
                          title={doc.filename}
                        >
                          {doc.filename}
                        </div>
                        <div className="text-[10px] text-[var(--nlm-text-tertiary)] font-mono flex items-center space-x-1.5">
                          <span>
                            {doc.file_size_formatted ||
                              `${((doc.file_size || 0) / 1024).toFixed(1)} KB`}
                          </span>
                          <span>&bull;</span>
                          <span className="text-emerald-500 font-sans">Terindeks</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Document Actions on Hover */}
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition shrink-0 ml-1">
                      <button
                        onClick={() => onPreviewDocument(doc)}
                        className="p-1 rounded text-[var(--nlm-text-tertiary)] hover:text-blue-500 transition cursor-pointer"
                        title="Lihat Teks Ekstraksi"
                      >
                        <i className="fa-regular fa-eye text-xs"></i>
                      </button>
                      <a
                        href={getDownloadUrl(doc.id)}
                        download
                        className="p-1 rounded text-[var(--nlm-text-tertiary)] hover:text-emerald-500 transition cursor-pointer"
                        title="Ambil ke HP / Unduh Berkas"
                      >
                        <i className="fa-solid fa-download text-xs"></i>
                      </a>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus berkas "${doc.filename}"?`)) {
                            onDeleteDocument(doc.id);
                          }
                        }}
                        className="p-1 rounded text-[var(--nlm-text-tertiary)] hover:text-rose-500 transition cursor-pointer"
                        title="Hapus Berkas"
                      >
                        <i className="fa-regular fa-trash-can text-xs"></i>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* SECTION B: CATATAN SAYA */}
        <div className="pt-2 border-t border-[var(--nlm-border-subtle)]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--nlm-text-tertiary)] px-1 mb-2 flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <span>Catatan Saya</span>
              <span className="font-mono text-[9px] px-1.5 py-0.2 rounded-md bg-indigo-500/10 text-indigo-600 font-semibold">
                {notes.length} Catatan
              </span>
            </span>

            <button
              onClick={onOpenCreateNote}
              className="text-[10px] text-blue-500 hover:underline cursor-pointer"
            >
              + Buat
            </button>
          </div>

          <div className="space-y-1.5">
            {notes.length === 0 ? (
              <div className="p-3 text-center text-xs text-[var(--nlm-text-tertiary)] border border-dashed border-[var(--nlm-border)] rounded-xl">
                <i className="fa-regular fa-note-sticky text-amber-500 mb-1 block"></i>
                <p className="text-[10px]">Belum ada catatan pribadi.</p>
              </div>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => onViewNote(note)}
                  className="p-2.5 rounded-xl border border-[var(--nlm-border)] bg-[var(--nlm-surface-variant)] hover:bg-[var(--nlm-surface-hover)] transition cursor-pointer flex items-center justify-between text-xs group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-[var(--nlm-text-primary)] truncate">
                      {note.title}
                    </div>
                    <div className="text-[10px] text-[var(--nlm-text-tertiary)] truncate mt-0.5">
                      {note.content}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNote(note.id);
                    }}
                    className="p-1 rounded text-[var(--nlm-text-tertiary)] hover:text-rose-500 opacity-0 group-hover:opacity-100 transition shrink-0 ml-1"
                  >
                    <i className="fa-regular fa-trash-can text-xs"></i>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Capacity Indicator Footer */}
      <div className="p-3 border-t border-[var(--nlm-border)] bg-[var(--nlm-surface-variant)] text-[11px] shrink-0">
        <div className="flex items-center justify-between text-[var(--nlm-text-secondary)] font-medium mb-1.5">
          <span>Kapasitas Sumber</span>
          <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">
            {capacityPercent}%
          </span>
        </div>
        <div className="w-full bg-[var(--nlm-border)] h-1.5 rounded-full overflow-hidden mb-1">
          <div
            className="bg-blue-600 h-full transition-all duration-300"
            style={{ width: `${capacityPercent}%` }}
          ></div>
        </div>
        <div className="text-[10px] text-[var(--nlm-text-tertiary)] truncate">
          {((totalBytes || 0) / 1024).toFixed(1)} KB / 5 MB batas sesi lokal
        </div>
      </div>
    </aside>
  );
}
