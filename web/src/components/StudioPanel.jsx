import React, { useState } from 'react';

export default function StudioPanel({
  documents = [],
  notes = [],
  onCreateStudyTool,
  onViewNote,
  onDeleteNote,
  onCollapse,
  generatingTool = null
}) {
  const [sortOrder, setSortOrder] = useState('recent'); // 'recent', 'alpha'

  const sortedNotes = [...notes].sort((a, b) => {
    if (sortOrder === 'alpha') return (a.title || '').localeCompare(b.title || '');
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

  const tools = [
    {
      id: 'Panduan Belajar',
      title: 'Panduan Belajar',
      desc: 'Ringkasan komprehensif & glosarium',
      icon: 'fa-graduation-cap',
      color: 'text-blue-500'
    },
    {
      id: 'Briefing Doc',
      title: 'Briefing Doc',
      desc: 'Ringkasan eksekutif & temuan kunci',
      icon: 'fa-file-contract',
      color: 'text-emerald-500'
    },
    {
      id: 'Tanya Jawab (FAQ)',
      title: 'Tanya Jawab (FAQ)',
      desc: 'Daftar tanya jawab materi penting',
      icon: 'fa-circle-question',
      color: 'text-amber-500'
    },
    {
      id: 'Linimasa',
      title: 'Linimasa',
      desc: 'Urutan kronologis & alur materi',
      icon: 'fa-timeline',
      color: 'text-indigo-500'
    }
  ];

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
        
        {/* QUICK TEMPLATES BUTTONS ROW */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--nlm-text-tertiary)] px-1 mb-2">
            Panduan &amp; Generator Otomatis
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {tools.map((tool) => {
              const isCurrentGenerating = generatingTool === tool.id;
              return (
                <button
                  key={tool.id}
                  onClick={() => onCreateStudyTool(tool.id)}
                  disabled={!!generatingTool}
                  className="p-2.5 rounded-xl border border-[var(--nlm-border)] bg-[var(--nlm-surface)] hover:bg-[var(--nlm-surface-hover)] text-left transition cursor-pointer group shadow-xs disabled:opacity-50"
                  title={tool.desc}
                >
                  <div className={`${tool.color} text-xs mb-1 flex items-center justify-between`}>
                    <i className={`fa-solid ${tool.icon}`}></i>
                    {isCurrentGenerating && (
                      <i className="fa-solid fa-circle-notch fa-spin text-[10px] text-blue-500"></i>
                    )}
                  </div>
                  <div className="font-semibold text-[11px] text-[var(--nlm-text-primary)] group-hover:text-blue-500 truncate">
                    {tool.title}
                  </div>
                  <div className="text-[9px] text-[var(--nlm-text-tertiary)] truncate mt-0.5">
                    {isCurrentGenerating ? 'Membuat...' : tool.desc}
                  </div>
                </button>
              );
            })}
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
              <div className="p-4 text-center text-xs text-[var(--nlm-text-tertiary)] border border-dashed border-[var(--nlm-border)] rounded-2xl my-1">
                <i className="fa-solid fa-wand-magic-sparkles text-purple-500 text-sm mb-1.5 block"></i>
                <p className="text-[11px] font-medium text-[var(--nlm-text-secondary)]">Belum ada catatan studio</p>
                <p className="text-[10px] text-[var(--nlm-text-tertiary)] mt-0.5">
                  Klik salah satu generator di atas untuk merangkum berkas rujukan secara otomatis.
                </p>
              </div>
            ) : (
              sortedNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => onViewNote(note)}
                  className="p-2.5 rounded-xl border border-[var(--nlm-border)] bg-[var(--nlm-surface-variant)] hover:bg-[var(--nlm-surface-hover)] hover:border-purple-500/30 transition cursor-pointer flex items-center justify-between text-xs group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-[var(--nlm-text-primary)] truncate flex items-center space-x-1.5">
                      <i className="fa-regular fa-file-lines text-purple-500 text-[10px]"></i>
                      <span className="truncate">{note.title}</span>
                    </div>
                    <div className="text-[10px] text-[var(--nlm-text-tertiary)] truncate mt-1">
                      {note.content?.slice(0, 80) || 'Catatan kosong'}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNote(note.id);
                    }}
                    className="p-1 rounded text-[var(--nlm-text-tertiary)] hover:text-rose-500 opacity-0 group-hover:opacity-100 transition shrink-0 ml-1.5"
                    title="Hapus catatan studio"
                  >
                    <i className="fa-regular fa-trash-can text-xs"></i>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Studio Slim Footer */}
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
