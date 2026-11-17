import React, { useState, useRef, useEffect } from 'react';
import MarkdownView from './MarkdownView';

export default function ChatPanel({
  notebook,
  documents,
  messages,
  onSendMessage,
  onEditMessage,
  onRegenerateMessage,
  onClearChat,
  loading,
  selectedModel,
  onSelectModel,
  onSelectCitation,
  aiMode = 'document'
}) {
  const [inputPrompt, setInputPrompt] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editPromptText, setEditPromptText] = useState('');
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollH = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollH, 160) + 'px';
    }
  }, [inputPrompt]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!inputPrompt.trim() || loading || !notebook) return;
    onSendMessage(inputPrompt.trim(), selectedModel);
    setInputPrompt('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePromptCardClick = (promptText) => {
    setInputPrompt(promptText);
    onSendMessage(promptText, selectedModel);
  };

  const handleStartEdit = (id, currentText) => {
    setEditingId(id);
    setEditPromptText(currentText);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditPromptText('');
  };

  const handleSaveAndSendEdit = (msgId) => {
    if (!editPromptText.trim() || loading) return;
    if (onEditMessage) {
      onEditMessage(msgId, editPromptText.trim());
    } else {
      onSendMessage(editPromptText.trim(), selectedModel);
    }
    setEditingId(null);
    setEditPromptText('');
  };

  return (
    <main className="flex-1 flex flex-col bg-[var(--nlm-bg)] min-w-0 h-full overflow-hidden select-none">
      
      {/* Topbar removed as requested in User Request #3 */}

      {/* Messages Scroll Container */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 select-text"
      >
        {!notebook ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto p-6 text-[var(--nlm-text-tertiary)]">
            <div className="w-16 h-16 rounded-3xl bg-blue-500/10 text-blue-600 flex items-center justify-center text-2xl mb-4 shadow-sm">
              <i className="fa-solid fa-folder-open"></i>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-[var(--nlm-text-primary)]">
              Pilih atau Buat Notebook
            </h3>
            <p className="text-xs mt-1.5 text-[var(--nlm-text-secondary)] leading-relaxed">
              Buka notebook dari beranda atau buat notebook baru untuk mulai mengunggah dokumen dan berdiskusi dengan AI.
            </p>
          </div>
        ) : messages.length === 0 ? (
          /* Welcome Hero State */
          <div className="max-w-2xl mx-auto text-center pt-8 pb-4 space-y-4">
            <div className="w-14 h-14 rounded-3xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl mx-auto shadow-inner">
              <i className="fa-solid fa-wand-magic-sparkles"></i>
            </div>
            
            <div className="space-y-1.5">
              <h2 className="text-lg sm:text-xl font-bold text-[var(--nlm-text-primary)]">
                NoteRoute Knowledge Agent Siap
              </h2>
              <p className="text-xs sm:text-sm text-[var(--nlm-text-secondary)] max-w-lg mx-auto leading-relaxed">
                Tanyakan apa saja seputar berkas rujukan Anda. AI akan merespons dengan sitasi kutipan transparan nomor halaman dan dokumen aslinya.
              </p>
            </div>

            {/* Quick Suggestions 4-Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left max-w-xl mx-auto pt-2">
              <button
                onClick={() =>
                  handlePromptCardClick('Buatkan Panduan Belajar (Study Guide) komprehensif dari materi dokumen ini.')
                }
                className="p-3 rounded-2xl border border-[var(--nlm-border)] bg-[var(--nlm-surface)] hover:bg-[var(--nlm-surface-hover)] hover:border-blue-500/40 transition cursor-pointer group shadow-xs"
              >
                <div className="flex items-center space-x-2 text-blue-500 mb-1">
                  <i className="fa-solid fa-graduation-cap text-xs"></i>
                  <span className="font-bold text-xs text-[var(--nlm-text-primary)] group-hover:text-blue-500">
                    Panduan Belajar
                  </span>
                </div>
                <p className="text-[11px] text-[var(--nlm-text-tertiary)] leading-snug">
                  Rangkum konsep kunci dan daftar glosarium istilah penting.
                </p>
              </button>

              <button
                onClick={() =>
                  handlePromptCardClick('Buatkan Briefing Doc ringkasan eksekutif formal mengenai temuan utama dokumen ini.')
                }
                className="p-3 rounded-2xl border border-[var(--nlm-border)] bg-[var(--nlm-surface)] hover:bg-[var(--nlm-surface-hover)] hover:border-emerald-500/40 transition cursor-pointer group shadow-xs"
              >
                <div className="flex items-center space-x-2 text-emerald-500 mb-1">
                  <i className="fa-solid fa-file-contract text-xs"></i>
                  <span className="font-bold text-xs text-[var(--nlm-text-primary)] group-hover:text-emerald-500">
                    Briefing Doc
                  </span>
                </div>
                <p className="text-[11px] text-[var(--nlm-text-tertiary)] leading-snug">
                  Ringkasan eksekutif, temuan kunci, dan pertimbangan kritis.
                </p>
              </button>

              <button
                onClick={() =>
                  handlePromptCardClick('Buatkan daftar Tanya Jawab (FAQ) yang sering muncul seputar bab materi ini.')
                }
                className="p-3 rounded-2xl border border-[var(--nlm-border)] bg-[var(--nlm-surface)] hover:bg-[var(--nlm-surface-hover)] hover:border-amber-500/40 transition cursor-pointer group shadow-xs"
              >
                <div className="flex items-center space-x-2 text-amber-500 mb-1">
                  <i className="fa-solid fa-circle-question text-xs"></i>
                  <span className="font-bold text-xs text-[var(--nlm-text-primary)] group-hover:text-amber-500">
                    Tanya Jawab (FAQ)
                  </span>
                </div>
                <p className="text-[11px] text-[var(--nlm-text-tertiary)] leading-snug">
                  Pertanyaan konseptual dan pembahasan mendalam materi.
                </p>
              </button>

              <button
                onClick={() =>
                  handlePromptCardClick('Buatkan Linimasa kronologis perkembangan konsep yang dibahas dalam dokumen.')
                }
                className="p-3 rounded-2xl border border-[var(--nlm-border)] bg-[var(--nlm-surface)] hover:bg-[var(--nlm-surface-hover)] hover:border-indigo-500/40 transition cursor-pointer group shadow-xs"
              >
                <div className="flex items-center space-x-2 text-indigo-500 mb-1">
                  <i className="fa-solid fa-timeline text-xs"></i>
                  <span className="font-bold text-xs text-[var(--nlm-text-primary)] group-hover:text-indigo-500">
                    Linimasa
                  </span>
                </div>
                <p className="text-[11px] text-[var(--nlm-text-tertiary)] leading-snug">
                  Runtutan alur evolusi teori dan implementasi sistem.
                </p>
              </button>
            </div>
          </div>
        ) : (
          /* Active Chat Messages */
          <>
            {onClearChat && (
              <div className="flex items-center justify-between max-w-3xl mx-auto pb-3 border-b border-[var(--nlm-border)]/60 select-none">
                <span className="text-[11px] text-[var(--nlm-text-tertiary)] flex items-center space-x-1.5">
                  <i className="fa-solid fa-clock-rotate-left text-[10px] text-blue-500"></i>
                  <span>Riwayat Percakapan Tersimpan ({messages.length} pesan)</span>
                </span>
                <button
                  type="button"
                  onClick={onClearChat}
                  className="text-[11px] text-[var(--nlm-text-tertiary)] hover:text-rose-500 transition cursor-pointer flex items-center space-x-1 px-2.5 py-1 rounded-xl border border-[var(--nlm-border)] bg-[var(--nlm-surface)] hover:bg-[var(--nlm-surface-hover)] shadow-2xs"
                  title="Bersihkan riwayat percakapan notebook ini"
                >
                  <i className="fa-regular fa-trash-can text-[10px]"></i>
                  <span>Bersihkan Chat</span>
                </button>
              </div>
            )}
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              const isEditing = editingId === msg.id;

              return (
                <div
                  key={msg.id || index}
                  className={`flex items-start space-x-3.5 max-w-3xl mx-auto ${
                    isUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5 text-xs shadow-xs">
                    <i className="fa-solid fa-robot"></i>
                  </div>
                )}

                <div className={`space-y-1.5 max-w-2xl ${isUser ? 'items-end' : 'items-start'}`}>
                  {/* Bubble Content or Inline Edit */}
                  {isEditing ? (
                    <div className="p-3 rounded-2xl bg-[var(--nlm-surface)] border border-blue-500 shadow-md space-y-2 w-72 sm:w-96">
                      <textarea
                        value={editPromptText}
                        onChange={(e) => setEditPromptText(e.target.value)}
                        className="w-full p-2 bg-[var(--nlm-surface-variant)] text-xs text-[var(--nlm-text-primary)] rounded-xl border border-[var(--nlm-border)] focus:outline-none focus:border-blue-500 resize-none h-20"
                        placeholder="Ubah pertanyaan Anda..."
                      />
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-2.5 py-1 rounded-lg border border-[var(--nlm-border)] text-[11px] text-[var(--nlm-text-secondary)] hover:bg-[var(--nlm-surface-hover)]"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveAndSendEdit(msg.id)}
                          className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] shadow-xs"
                        >
                          Kirim Ulang
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? 'bg-blue-600 text-white rounded-tr-xs shadow-md shadow-blue-600/10'
                          : 'bg-[var(--nlm-surface)] border border-[var(--nlm-border)] text-[var(--nlm-text-primary)] rounded-tl-xs shadow-xs'
                      }`}
                    >
                      {/* Heuristic failover badge */}
                      {msg.failover && (
                        <div className="mb-2 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/20 text-amber-500 text-[11px] font-semibold flex items-center space-x-1.5">
                          <i className="fa-solid fa-shuffle text-xs"></i>
                          <span>Dialihkan otomatis via Heuristic Failover Router</span>
                        </div>
                      )}

                      {/* Message Content: User plain text or AI Markdown */}
                      {isUser ? (
                        <div className="whitespace-pre-wrap select-text">{msg.content}</div>
                      ) : (
                        <MarkdownView content={msg.content} />
                      )}

                      {/* Verified Citations Badges */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-[var(--nlm-border-subtle)] flex flex-wrap gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--nlm-text-tertiary)] block w-full mb-1">
                            Sumber Rujukan Terverifikasi:
                          </span>
                          {msg.citations.map((cite, idx) => (
                            <button
                              key={idx}
                              onClick={() => onSelectCitation && onSelectCitation(cite)}
                              className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-[11px] text-blue-600 dark:text-blue-400 transition cursor-pointer"
                              title={cite.snippet || 'Klik untuk melihat rujukan'}
                            >
                              <i className="fa-solid fa-file-shield text-xs"></i>
                              <span className="font-semibold truncate max-w-[160px]">{cite.filename || cite.source}</span>
                              {cite.page && <span>(Hal. {cite.page})</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions & Meta */}
                  <div
                    className={`flex items-center space-x-2.5 text-[10px] text-[var(--nlm-text-tertiary)] px-1 ${
                      isUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {/* User Edit Prompt Button */}
                    {isUser && !isEditing && (
                      <>
                        <button
                          onClick={() => handleStartEdit(msg.id, msg.content)}
                          className="hover:text-[var(--nlm-text-primary)] flex items-center space-x-1 transition cursor-pointer"
                          title="Edit pertanyaan ini"
                        >
                          <i className="fa-solid fa-pen text-[10px]"></i>
                          <span>Edit</span>
                        </button>
                        <span>&bull;</span>
                      </>
                    )}

                    {/* AI Provider Badge & Regenerate Button */}
                    {!isUser && (
                      <>
                        {msg.model_used && (
                          <span className="font-mono text-[var(--nlm-text-secondary)] font-medium">
                            {msg.model_used}
                          </span>
                        )}
                        <span>&bull;</span>
                        <button
                          onClick={() => onRegenerateMessage && onRegenerateMessage(msg.id)}
                          disabled={loading}
                          className="hover:text-blue-500 flex items-center space-x-1 transition cursor-pointer disabled:opacity-40"
                          title="Muat ulang jawaban AI"
                        >
                          <i className={`fa-solid fa-arrows-rotate text-[10px] ${loading ? 'fa-spin' : ''}`}></i>
                          <span>Muat Ulang</span>
                        </button>
                        <span>&bull;</span>
                      </>
                    )}

                    {/* Copy Button */}
                    <button
                      onClick={() => handleCopy(msg.id || index, msg.content)}
                      className="hover:text-[var(--nlm-text-primary)] flex items-center space-x-1 transition cursor-pointer"
                    >
                      {copiedId === (msg.id || index) ? (
                        <>
                          <i className="fa-solid fa-check text-emerald-500 text-xs"></i>
                          <span className="text-emerald-500">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <i className="fa-regular fa-copy text-xs"></i>
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-[var(--nlm-surface-variant)] border border-[var(--nlm-border)] text-[var(--nlm-text-secondary)] flex items-center justify-center shrink-0 mt-0.5 text-xs">
                    <i className="fa-solid fa-user"></i>
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-start space-x-3.5 max-w-3xl mx-auto animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-blue-600/15 border border-blue-500/20 text-blue-600 flex items-center justify-center shrink-0 text-xs">
              <i className="fa-solid fa-robot"></i>
            </div>
            <div className="p-4 rounded-3xl bg-[var(--nlm-surface)] border border-[var(--nlm-border)] rounded-tl-xs flex items-center space-x-2 text-xs text-[var(--nlm-text-secondary)]">
              <i className="fa-solid fa-circle-notch fa-spin text-blue-500"></i>
              <span>Membedah konteks dokumen &amp; memanggil AI router...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Prompt Box - Centered floating modern chatbox with Shift+Enter & Mode Aware */}
      <div className="p-3 sm:p-4 bg-[var(--nlm-surface)]/80 backdrop-blur-md shrink-0 border-t border-[var(--nlm-border)]">
        <div className="max-w-3xl mx-auto">
          {/* Active AI Mode Banner */}
          <div className="flex items-center justify-between mb-1.5 px-2">
            <div className="flex items-center space-x-1.5 text-[11px] font-medium">
              {aiMode === 'general' ? (
                <span className="inline-flex items-center space-x-1 text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                  <i className="fa-solid fa-wand-magic-sparkles text-[10px]"></i>
                  <span>Mode AI Bebas Aktif</span>
                  <span className="text-[10px] text-[var(--nlm-text-tertiary)] hidden sm:inline">&mdash; Menjawab bebas tanpa batasan dokumen</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                  <i className="fa-solid fa-file-shield text-[10px]"></i>
                  <span>Mode Dokumen Aktif</span>
                  <span className="text-[10px] text-[var(--nlm-text-tertiary)] hidden sm:inline">&mdash; Menjawab ketat berbasis dokumen rujukan</span>
                </span>
              )}
            </div>
            <span className="text-[10px] text-[var(--nlm-text-tertiary)] hidden sm:inline">
              Shift + Enter untuk baris baru
            </span>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex items-end gap-2 p-1.5 sm:p-2 pl-4 sm:pl-5 bg-[var(--nlm-surface-variant)] border border-[var(--nlm-border)] rounded-3xl shadow-sm focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500 transition-all"
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!notebook || loading}
              placeholder={
                !notebook
                  ? 'Pilih notebook terlebih dahulu'
                  : aiMode === 'general'
                  ? 'Tanyakan apa saja kepada AI, diskusikan ide, atau buat tugas...'
                  : 'Tanyakan isi dokumen rujukan, ringkasan, atau analisis materi...'
              }
              className="flex-1 bg-transparent text-xs sm:text-sm text-[var(--nlm-text-primary)] placeholder-[var(--nlm-text-tertiary)] focus:outline-none disabled:opacity-50 resize-none py-1.5 max-h-40 leading-relaxed"
            />
            <button
              type="submit"
              disabled={!inputPrompt.trim() || loading || !notebook}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center shadow-md shadow-blue-500/25 active:scale-95 transition-transform cursor-pointer shrink-0 mb-0.5"
              title="Kirim Pertanyaan (Enter)"
            >
              <i className="fa-solid fa-paper-plane text-xs"></i>
            </button>
          </form>
          <p className="text-center text-[10px] sm:text-[11px] text-[var(--nlm-text-tertiary)] mt-2">
            NoteRoute dapat membuat kesalahan. Selalu periksa kembali informasi penting dari dokumen rujukan.
          </p>
        </div>
      </div>
    </main>
  );
}
