import React, { useState } from 'react';

export default function CreateNoteModal({ isOpen, onClose, onSaveNote }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onSaveNote({
      id: 'note_' + Date.now(),
      title: title.trim(),
      content: content.trim(),
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      created_at: new Date().toISOString()
    });
    setTitle('');
    setContent('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[var(--nlm-modal-overlay)] backdrop-blur-xs flex items-center justify-center p-4 select-none modal-animate-in">
      <div className="w-full max-w-lg bg-[var(--nlm-surface)] border border-[var(--nlm-border)] rounded-3xl p-6 shadow-2xl relative">
        
        <div className="flex items-center justify-between pb-3 border-b border-[var(--nlm-border)]">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-xs">
              <i className="fa-solid fa-pen-to-square"></i>
            </div>
            <h3 className="font-bold text-sm text-[var(--nlm-text-primary)]">Buat Catatan Pribadi</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-[var(--nlm-surface-hover)] text-[var(--nlm-text-tertiary)] flex items-center justify-center transition cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 my-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--nlm-text-secondary)] mb-1">
              Judul Catatan
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Rangkuman Bab 3 - Distributed Systems"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--nlm-surface-variant)] border border-[var(--nlm-border)] text-xs sm:text-sm text-[var(--nlm-text-primary)] focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--nlm-text-secondary)] mb-1">
              Isi Catatan / Ringkasan
            </label>
            <textarea
              required
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tuliskan poin penting, catatan kuliah, atau kutipan penting..."
              className="w-full p-3.5 rounded-xl bg-[var(--nlm-surface-variant)] border border-[var(--nlm-border)] text-xs sm:text-sm text-[var(--nlm-text-primary)] focus:outline-none focus:border-blue-500 transition leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[var(--nlm-border-subtle)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--nlm-text-secondary)] hover:bg-[var(--nlm-surface-hover)] transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition cursor-pointer"
            >
              Simpan Catatan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
