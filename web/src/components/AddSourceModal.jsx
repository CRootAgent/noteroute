import React, { useState, useRef } from 'react';

export default function AddSourceModal({ isOpen, onClose, onUpload, notebook }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processUpload(file);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await processUpload(file);
    }
  };

  const processUpload = async (file) => {
    if (!notebook?.id) {
      setError('Pilih atau buat notebook terlebih dahulu.');
      return;
    }

    setError('');
    setUploading(true);
    setUploadProgress(35);

    try {
      setUploadProgress(70);
      await onUpload(notebook.id, file);
      setUploadProgress(100);
      setTimeout(() => {
        setUploading(false);
        onClose();
      }, 400);
    } catch (err) {
      setError(err.message || 'Gagal mengunggah berkas.');
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[var(--nlm-modal-overlay)] backdrop-blur-xs flex items-center justify-center p-4 select-none modal-animate-in">
      <div className="w-full max-w-xl bg-[var(--nlm-surface)] border border-[var(--nlm-border)] rounded-3xl p-6 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--nlm-border)]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs">
              <i className="fa-solid fa-cloud-arrow-up"></i>
            </div>
            <div>
              <h3 className="font-bold text-sm text-[var(--nlm-text-primary)]">Tambahkan Sumber</h3>
              <p className="text-[11px] text-[var(--nlm-text-tertiary)]">
                Ke notebook: <strong>{notebook?.name}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-[var(--nlm-surface-hover)] text-[var(--nlm-text-tertiary)] flex items-center justify-center transition cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        {error && (
          <div className="my-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center space-x-2">
            <i className="fa-solid fa-circle-exclamation shrink-0"></i>
            <span>{error}</span>
          </div>
        )}

        {/* Dropzone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`my-4 p-8 border-2 border-dashed rounded-3xl text-center cursor-pointer transition ${
            isDragging
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-[var(--nlm-border)] hover:border-blue-500/50 hover:bg-[var(--nlm-surface-variant)]'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl mx-auto mb-3 shadow-inner">
            <i className="fa-solid fa-file-arrow-up"></i>
          </div>
          <div className="font-bold text-xs sm:text-sm text-[var(--nlm-text-primary)]">
            Tarik &amp; lepas berkas materi ke sini, atau klik untuk memilih
          </div>
          <p className="text-[11px] text-[var(--nlm-text-tertiary)] mt-1">
            Mendukung PDF kuliah, Microsoft Word (DOCX), Markdown (.md), atau Plain Text (.txt)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.md,.txt"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Upload Progress Bar */}
        {uploading && (
          <div className="p-3 rounded-2xl bg-[var(--nlm-surface-variant)] border border-[var(--nlm-border)] space-y-1.5 animate-pulse">
            <div className="flex items-center justify-between text-xs font-semibold text-[var(--nlm-text-primary)]">
              <span>Mengunggah dan mengekstrak teks dokumen...</span>
              <span className="font-mono text-blue-500">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-[var(--nlm-border)] h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 text-[11px] text-[var(--nlm-text-tertiary)]">
          <span>Batas ukuran per berkas: 10 MB</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[var(--nlm-surface-variant)] hover:bg-[var(--nlm-surface-hover)] text-[var(--nlm-text-primary)] text-xs font-semibold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
