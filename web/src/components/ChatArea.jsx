import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Loader2, 
  Shuffle, 
  Bookmark, 
  Copy, 
  Check, 
  Cpu, 
  FileText,
  AlertTriangle
} from 'lucide-react';

const MODELS = [
  { id: 'gemini', name: 'Gemini 1.5 Flash', badge: '1M Context Free', provider: 'Google AI' },
  { id: 'groq', name: 'Llama 3.3 70B', badge: '300+ t/s Ultra-Fast', provider: 'Groq Cloud' },
  { id: 'deepseek', name: 'DeepSeek R1/V3', badge: 'Penalaran Hemat', provider: 'DeepSeek' },
  { id: '9router_local', name: '9Router Local', badge: 'Port 20128', provider: 'OmniRoute/Local' },
];

export default function ChatArea({ 
  workspace, 
  documents, 
  messages, 
  onSendMessage, 
  loading 
}) {
  const [inputPrompt, setInputPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini');
  const [copiedId, setCopiedId] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputPrompt.trim() || loading || !workspace) return;
    onSendMessage(inputPrompt.trim(), selectedModel);
    setInputPrompt('');
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <main className="flex-1 flex flex-col bg-slate-950 min-w-0 h-full overflow-hidden">
      {/* Top Header: Model Switcher & Document Context */}
      <div className="h-14 border-b border-slate-800/80 bg-slate-900/40 px-4 sm:px-6 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-slate-300">Target AI:</span>
          <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
            {MODELS.map((m) => {
              const active = selectedModel === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition cursor-pointer flex items-center space-x-1 ${
                    active 
                      ? 'bg-indigo-600 text-white shadow-xs' 
                      : 'bg-slate-800/70 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span>{m.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-400 hidden md:block">
          {documents.length} Dokumen Rujukan Aktif
        </div>
      </div>

      {/* Messages Scroll Container */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 select-text"
      >
        {!workspace ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto p-6 text-slate-500">
            <Sparkles className="w-10 h-10 text-indigo-500/50 mb-3" />
            <h3 className="text-sm font-bold text-slate-300">Pilih Ruang Kerja</h3>
            <p className="text-xs text-slate-500 mt-1">
              Buka atau buat ruang kerja baru di sidebar kiri untuk mulai bertanya seputar dokumen laptop Anda.
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto p-6 text-slate-500">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-200">
              NoteRoute Knowledge Agent Siap
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Tanyakan apa saja seputar berkas rujukan Anda. AI akan merespons dengan sitasi kutipan transparan nomor halaman dan dokumen aslinya.
            </p>
            {documents.length === 0 && (
              <div className="mt-4 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Belum ada dokumen yang diunggah di ruang kerja ini.</span>
              </div>
            )}
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div 
                key={msg.id} 
                className={`flex items-start space-x-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-2xl space-y-2 ${isUser ? 'items-end' : 'items-start'}`}>
                  {/* Bubble Content */}
                  <div className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed ${
                    isUser 
                      ? 'bg-indigo-600 text-white rounded-tr-xs shadow-md shadow-indigo-600/10' 
                      : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-xs shadow-xs'
                  }`}>
                    {/* Failover badge */}
                    {msg.failover && (
                      <div className="mb-2 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/20 text-amber-400 text-[11px] font-semibold flex items-center space-x-1.5">
                        <Shuffle className="w-3.5 h-3.5" />
                        <span>Dialihkan otomatis via Heuristic Failover Router</span>
                      </div>
                    )}

                    <div className="whitespace-pre-wrap select-text">
                      {msg.content}
                    </div>

                    {/* Citations Badges */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block w-full mb-1">
                          Sumber Rujukan Terverifikasi:
                        </span>
                        {msg.citations.map((cite, idx) => (
                          <div 
                            key={idx}
                            className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300"
                            title={cite.snippet || 'Kutipan rujukan'}
                          >
                            <FileText className="w-3 h-3 text-indigo-400" />
                            <span className="font-semibold truncate max-w-[150px]">{cite.filename}</span>
                            {cite.page && <span className="opacity-70">(Hal. {cite.page})</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions & Meta */}
                  <div className={`flex items-center space-x-2 text-[10px] text-slate-500 px-1 ${
                    isUser ? 'justify-end' : 'justify-start'
                  }`}>
                    {msg.model_used && (
                      <span className="font-mono text-slate-400 font-medium">
                        {msg.model_used}
                      </span>
                    )}
                    <span>&bull;</span>
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="hover:text-slate-300 flex items-center space-x-1 transition"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-start space-x-3.5 animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 rounded-tl-xs flex items-center space-x-2 text-xs text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span>Membedah konteks dokumen & merutekan kueri...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Prompt Box */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/60 shrink-0">
        <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            disabled={!workspace || loading}
            placeholder={
              workspace 
                ? "Tanyakan isi materi kuliah, ringkasan bab, atau konsep teoritis..." 
                : "Pilih ruang kerja terlebih dahulu untuk mulai bertanya"
            }
            className="w-full pl-4 pr-12 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner transition disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || loading || !workspace}
            className="absolute right-2 top-2 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white transition shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-center text-[10px] text-slate-500 mt-2">
          NoteRoute Router memadukan Gemini 1M context, Groq Cloud, dan 9Router dengan failover otomatis.
        </p>
      </div>
    </main>
  );
}
