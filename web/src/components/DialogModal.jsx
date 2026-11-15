import React from 'react';

export default function DialogModal({
  isOpen,
  onClose,
  title = 'Konfirmasi',
  message,
  type = 'info', // 'danger' | 'warning' | 'info' | 'success'
  confirmText = 'OK',
  cancelText = 'Batal',
  onConfirm
}) {
  if (!isOpen) return null;

  const isConfirmation = Boolean(onConfirm);

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return (
          <div className="w-11 h-11 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center text-lg shadow-sm">
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
        );
      case 'warning':
        return (
          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center text-lg shadow-sm">
            <i className="fa-solid fa-circle-exclamation"></i>
          </div>
        );
      case 'success':
        return (
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-lg shadow-sm">
            <i className="fa-solid fa-circle-check"></i>
          </div>
        );
      default:
        return (
          <div className="w-11 h-11 rounded-2xl bg-blue-500/15 text-blue-500 flex items-center justify-center text-lg shadow-sm">
            <i className="fa-solid fa-circle-info"></i>
          </div>
        );
    }
  };

  const getConfirmButtonClass = () => {
    if (type === 'danger') {
      return 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20';
    }
    return 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none animate-fadeIn">
      <div 
        className="w-full max-w-md bg-[var(--nlm-surface)] border border-[var(--nlm-border)] rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start space-x-3.5">
          {getIcon()}
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="text-sm sm:text-base font-bold text-[var(--nlm-text-primary)] leading-tight">
              {title}
            </h3>
            <div className="text-xs text-[var(--nlm-text-secondary)] mt-1.5 leading-relaxed whitespace-pre-line">
              {message}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2.5 pt-2 border-t border-[var(--nlm-border-subtle)]">
          {isConfirmation && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[var(--nlm-border)] bg-[var(--nlm-surface-variant)] hover:bg-[var(--nlm-surface-hover)] text-xs font-semibold text-[var(--nlm-text-secondary)] hover:text-[var(--nlm-text-primary)] transition cursor-pointer"
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer shadow-md ${getConfirmButtonClass()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
