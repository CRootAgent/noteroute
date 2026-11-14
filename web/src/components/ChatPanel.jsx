import React, { useState, useRef, useEffect } from 'react';

const MODELS = [
  { id: 'gemini', name: 'Gemini 1.5 Flash', badge: '1M Context Free', provider: 'Google AI' },
  { id: 'groq', name: 'Llama 3.3 70B', badge: '300+ t/s Ultra-Fast', provider: 'Groq Cloud' },
  { id: 'deepseek', name: 'DeepSeek R1/V3', badge: 'Penalaran Hemat', provider: 'DeepSeek' },
  { id: '9router_local', name: '9Router Local', badge: 'Port 20128', provider: 'OmniRoute/Local' },
];

export default function ChatPanel({
  notebook,
  documents,
  messages,
  onSendMessage,
  loading,
  selectedModel,
  onSelectModel,
  onSelectCitation
}) {
  const [inputPrompt, setInputPrompt] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputPrompt.trim() || loading || !notebook) return;
    onSendMessage(inputPrompt.trim(), selectedModel);
    setInputPrompt('');
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

  return (
    <main className="flex-1 flex flex-col bg-[var(--nlm-bg)] min-w-0 h-full overflow-hidden select-none">
      
      {/* Top Header: Model Switcher & Document Context */}
      <div className="h-14 border-b border-[var(--nlm-border)] bg-[var(--nlm-surface)]/95 px-4 sm:px-6 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center space-x-2">
          <i className="fa-solid fa-microchip text-blue-500 text-xs"></i>
          <span className="text-xs font-bold text-[var(--nlm-text-secondary)]">Target AI:</span>
          
          <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
            {MODELS.map((m) => {
              const active = selectedModel === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => onSelectModel(m.id)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition cursor-pointer flex items-center space-x-1 ${
                    active
                      ? 'bg-[var(--nlm-brand)] text-white shadow-xs'
                      : 'bg-[var(--nlm-surface-variant)] text-[var(--nlm-text-tertiary)] hover:text-[var(--nlm-text-primary)] hover:bg-[var(--nlm-surface-hover)]'
                  }`}
                >
                  <span>{m.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="text-[11px] font-mono text-[var(--nlm-text-tertiary)] hidden md:block">
          {documents.length} Dokumen Rujukan Aktif
        </div>
      </div>

      {/* Messages Scroll Container */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 select-text"
      >
        {!notebook ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto p-6 text-[var(--nlm-text-tertiary)]">
            <i className="fa-solid fa-folder-open text-3xl mb-3 text-blue-500/40"></i>
            <h3 className="text-sm font-bold text-[var(--nlm-text-primary)]">Pilih Notebook</h3>
            <p className="text-xs mt-1 text-[var(--nlm-text-secondary)]">
              Buka notebook dari beranda untuk mulai bertanya seputar dokumen Anda.
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
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-3.5 max-w-3xl mx-auto ${
                  isUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5 text-xs shadow-xs">
                    <i className="fa-solid fa-robot"></i>
                  </div>
                )}

                <div className={`space-y-2 max-w-2xl ${isUser ? 'items-end' : 'items-start'}`}>
                  {/* Bubble Content */}
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

                    <div className="whitespace-pre-wrap select-text">{msg.content}</div>

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
                            <span className="font-semibold truncate max-w-[160px]">{cite.filename}</span>
                            {cite.page && <span>(Hal. {cite.page})</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions & Meta */}
                  <div
                    className={`flex items-center space-x-2 text-[10px] text-[var(--nlm-text-tertiary)] px-1 ${
                      isUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.model_used && (
                      <span className="font-mono text-[var(--nlm-text-secondary)] font-medium">
                        {msg.model_used}
                      </span>
                    )}
                    <span>&bull;</span>
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="hover:text-[var(--nlm-text-primary)] flex items-center space-x-1 transition cursor-pointer"
                    >
                      {copiedId === msg.id ? (
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
          })
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-start space-x-3.5 max-w-3xl mx-auto animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-blue-600/15 border border-blue-500/20 text-blue-600 flex items-center justify-center shrink-0 text-xs">
              <i className="fa-solid fa-robot"></i>
            </div>
            <div className="p-4 rounded-3xl bg-[var(--nlm-surface)] border border-[var(--nlm-border)] rounded-tl-xs flex items-center space-x-2 text-xs text-[var(--nlm-text-secondary)]">
              <i className="fa-solid fa-circle-notch fa-spin text-blue-500"></i>
              <span>Membedah konteks dokumen &amp; merutekan kueri...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Prompt Box */}
      <div className="p-4 border-t border-[var(--nlm-border)] bg-[var(--nlm-surface)] shrink-0">
        <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            disabled={!notebook || loading}
            placeholder={
              notebook
                ? 'Tanyakan isi materi kuliah, ringkasan bab, atau konsep teoritis...'
                : 'Pilih notebook terlebih dahulu'
            }
            className="w-full pl-4 pr-12 py-3 bg-[var(--nlm-surface-variant)] border border-[var(--nlm-border)] rounded-2xl text-xs sm:text-sm text-[var(--nlm-text-primary)] placeholder-[var(--nlm-text-tertiary)] focus:outline-none focus:border-blue-500 transition shadow-inner disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || loading || !notebook}
            className="absolute right-2 top-2 p-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition shadow-sm shadow-blue-500/20 cursor-pointer"
          >
            <i className="fa-solid fa-paper-plane text-xs"></i>
          </button>
        </form>
        <p className="text-center text-[10px] text-[var(--nlm-text-tertiary)] mt-2">
          NoteRoute Router memadukan Gemini 1M context, Groq Cloud, dan 9Router dengan failover otomatis.
        </p>
      </div>
    </main>
  );
}
