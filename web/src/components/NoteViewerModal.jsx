import React, { useState } from 'react';

export default function NoteViewerModal({ isOpen, onClose, item, type = 'document' }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !item) return null;

  const title = item.filename || item.title || 'Pratinjau Teks';
  const content = item.extracted_text || item.content || item.snippet || item.preview_text || 'Tidak ada teks yang dapat ditampilkan.';
  const subtitle = item.file_size_formatted || item.date || (item.page ? `Halaman ${item.page}` : 'Tersinkron');

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[var(--nlm-modal-overlay)] backdrop-blur-xs flex items-center justify-center p-4 select-none modal-animate-in">
      <div className="w-full max-w-2xl bg-[var(--nlm-surface)] border border-[var(--nlm-border)] rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--nlm-border)] shrink-0">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center text-xs shrink-0">
              <i className={type === 'document' ? 'fa-solid fa-file-lines' : 'fa-regular fa-note-sticky'}></i>
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-[var(--nlm-text-primary)] truncate max-w-md">
                {title}
              </h3>
              <p className="text-[11px] text-[var(--nlm-text-tertiary)]">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-[var(--nlm-surface-hover)] text-[var(--nlm-text-tertiary)] flex items-center justify-center transition cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        {/* Content Box */}
        <div className="flex-1 overflow-y-auto my-4 p-4 rounded-2xl bg-[var(--nlm-surface-variant)] border border-[var(--nlm-border)] text-xs sm:text-sm text-[var(--nlm-text-primary)] leading-relaxed select-text whitespace-pre-wrap font-mono">
          {content}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--nlm-border-subtle)] shrink-0 text-xs">
          <button
            onClick={handleCopy}
            className="px-3.5 py-1.5 rounded-xl border border-[var(--nlm-border)] hover:bg-[var(--nlm-surface-hover)] text-[var(--nlm-text-secondary)] font-medium flex items-center space-x-1.5 transition cursor-pointer"
          >
            {copied ? (
              <>
                <i className="fa-solid fa-check text-emerald-500"></i>
                <span className="text-emerald-500 font-semibold">Tersalin</span>
              </>
            ) : (
              <>
                <i className="fa-regular fa-copy"></i>
                <span>Salin Teks</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
