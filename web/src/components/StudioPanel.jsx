import React, { useState } from 'react';

export default function StudioPanel({
  documents,
  notes,
  onCreateStudyTool,
  onGenerateAudio,
  onViewNote,
  onDeleteNote,
  onCollapse
}) {
  const [isAudioGenerating, setIsAudioGenerating] = useState(false);
  const [audioCreated, setAudioCreated] = useState(false);
  const [sortOrder, setSortOrder] = useState('recent'); // 'recent', 'alpha'

  const handleAudioClick = () => {
    setIsAudioGenerating(true);
    setTimeout(() => {
      setIsAudioGenerating(false);
      setAudioCreated(true);
      onGenerateAudio();
    }, 1500);
  };

  const sortedNotes = [...notes].sort((a, b) => {
    if (sortOrder === 'alpha') return (a.title || '').localeCompare(b.title || '');
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

  return (
    <aside className="w-72 border-l border-[var(--nlm-border)] bg-[var(--nlm-surface)] flex flex-col justify-between shrink-0 select-none overflow-hidden h-full z-10">
      
      {/* Studio Header */}
      <div className="p-3.5 border-b border-[var(--nlm-border-subtle)] flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <h2 className="font-bold text-sm text-[var(--nlm-text-primary)]">Studio</h2>
          <span className="text-xs text-[var(--nlm-text-tertiary)]">&bull; Alat Bantu</span>
        </div>

        {onCollapse && (
          <button
            onClick={onCollapse}
            className="w-6 h-6 rounded-md hover:bg-[var(--nlm-surface-hover)] text-[var(--nlm-text-tertiary)] hover:text-[var(--nlm-text-primary)] flex items-center justify-center transition cursor-pointer"
            title="Tutup Studio"
          >
            <i className="fa-solid fa-chevron-right text-[11px]"></i>
          </button>
        )}
      </div>

      {/* Studio Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        
        {/* AUDIO OVERVIEW COMPACT CARD */}
        <div className="p-3 rounded-2xl border border-[var(--nlm-border)] bg-[var(--nlm-surface-variant)] text-xs space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-lg bg-purple-600/10 text-purple-600 flex items-center justify-center text-xs">
                <i className="fa-solid fa-headphones"></i>
              </span>
              <span className="font-bold text-xs text-[var(--nlm-text-primary)]">Ikhtisar Audio</span>
            </div>
            <span className="text-[9px] font-bold text-purple-600 bg-purple-500/10 px-1 py-0.5 rounded">
              Deep Dive
            </span>
          </div>

          <p className="text-[11px] text-[var(--nlm-text-secondary)] leading-snug">
            Percakapan 2 host AI membedah materi kuliah Anda secara audio.
          </p>

          <button
            onClick={handleAudioClick}
            disabled={isAudioGenerating || documents.length === 0}
            className="w-full py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-[11px] flex items-center justify-center space-x-1.5 transition cursor-pointer"
          >
            {isAudioGenerating ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin text-xs"></i>
                <span>Menghasilkan Audio...</span>
              </>
            ) : audioCreated ? (
              <>
                <i className="fa-solid fa-play text-[9px]"></i>
                <span>Putar Ikhtisar Audio (5:12)</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-play text-[9px]"></i>
                <span>Buat Audio</span>
              </>
            )}
          </button>
        </div>

        {/* QUICK TEMPLATES BUTTONS ROW */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--nlm-text-tertiary)] px-1 mb-2">
            Panduan &amp; Generator
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <button
              onClick={() => onCreateStudyTool('Panduan Belajar')}
              className="p-2.5 rounded-xl border border-[var(--nlm-border)] bg-[var(--nlm-surface)] hover:bg-[var(--nlm-surface-hover)] text-left transition cursor-pointer group shadow-xs"
            >
              <div className="text-blue-600 text-xs mb-0.5">
                <i className="fa-solid fa-graduation-cap"></i>
              </div>
              <div className="font-semibold text-[11px] text-[var(--nlm-text-primary)] group-hover:text-blue-500 truncate">
                Panduan Belajar
              </div>
            </button>

            <button
              onClick={() => onCreateStudyTool('Briefing Doc')}
              className="p-2.5 rounded-xl border border-[var(--nlm-border)] bg-[var(--nlm-surface)] hover:bg-[var(--nlm-surface-hover)] text-left transition cursor-pointer group shadow-xs"
            >
              <div className="text-emerald-600 text-xs mb-0.5">
                <i className="fa-solid fa-file-contract"></i>
              </div>
              <div className="font-semibold text-[11px] text-[var(--nlm-text-primary)] group-hover:text-emerald-500 truncate">
                Briefing Doc
              </div>
            </button>

            <button
              onClick={() => onCreateStudyTool('Tanya Jawab (FAQ)')}
              className="p-2.5 rounded-xl border border-[var(--nlm-border)] bg-[var(--nlm-surface)] hover:bg-[var(--nlm-surface-hover)] text-left transition cursor-pointer group shadow-xs"
            >
              <div className="text-amber-600 text-xs mb-0.5">
                <i className="fa-solid fa-circle-question"></i>
              </div>
              <div className="font-semibold text-[11px] text-[var(--nlm-text-primary)] group-hover:text-amber-500 truncate">
                Tanya Jawab (FAQ)
              </div>
            </button>

            <button
              onClick={() => onCreateStudyTool('Linimasa')}
              className="p-2.5 rounded-xl border border-[var(--nlm-border)] bg-[var(--nlm-surface)] hover:bg-[var(--nlm-surface-hover)] text-left transition cursor-pointer group shadow-xs"
            >
              <div className="text-indigo-600 text-xs mb-0.5">
                <i className="fa-solid fa-timeline"></i>
              </div>
              <div className="font-semibold text-[11px] text-[var(--nlm-text-primary)] group-hover:text-indigo-500 truncate">
                Linimasa
              </div>
            </button>
          </div>
        </div>

        {/* CATATAN STUDIO */}
        <div className="pt-2 border-t border-[var(--nlm-border-subtle)]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--nlm-text-tertiary)] px-1 mb-1.5 flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <span>Catatan Studio</span>
              <span className="font-mono text-[9px] px-1.5 py-0.2 rounded-md bg-purple-500/10 text-purple-600 font-semibold">
                {notes.length}
              </span>
            </span>

            <button
              onClick={() => setSortOrder(sortOrder === 'recent' ? 'alpha' : 'recent')}
              className="text-[10px] text-[var(--nlm-text-tertiary)] hover:text-[var(--nlm-text-primary)] flex items-center space-x-1 cursor-pointer"
            >
              <i className="fa-solid fa-arrow-down-wide-short text-[9px]"></i>
              <span className="capitalize">{sortOrder}</span>
            </button>
          </div>

          <div className="space-y-1.5">
            {notes.length === 0 ? (
              <div className="p-3 text-center text-xs text-[var(--nlm-text-tertiary)] border border-dashed border-[var(--nlm-border)] rounded-xl my-1">
                <i className="fa-solid fa-wand-magic text-purple-500 mb-1 block"></i>
                <p className="text-[10px]">Klik salah satu generator di atas untuk membuat catatan otomatis.</p>
              </div>
            ) : (
              sortedNotes.map((note) => (
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

      {/* Studio Slim Footer: Efisiensi Biaya & Token */}
      <div className="p-3 border-t border-[var(--nlm-border)] bg-[var(--nlm-surface-variant)] text-[11px] shrink-0">
        <div className="flex items-center justify-between text-[var(--nlm-text-secondary)] font-medium">
          <span className="flex items-center space-x-1.5">
            <i className="fa-solid fa-bolt text-[10px] text-emerald-500"></i>
            <span>Efisiensi:</span>
          </span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            Hemat Rp 0 ($0.00)
          </span>
        </div>
        <div className="flex items-center justify-between mt-1 text-[10px] text-[var(--nlm-text-tertiary)]">
          <span>0 token teroptimasi</span>
          <span className="text-emerald-500 font-semibold font-mono">100% Free / Routing</span>
        </div>
      </div>
    </aside>
  );
}
