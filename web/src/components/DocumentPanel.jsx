import React, { useState, useRef } from 'react';
import { 
  FileText, 
  UploadCloud, 
  Download, 
  Trash2, 
  Eye, 
  Loader2, 
  AlertCircle,
  FileCode,
  FileCheck,
  X
} from 'lucide-react';
import { getDownloadUrl } from '../services/api';

export default function DocumentPanel({ 
  workspace, 
  documents, 
  onUpload, 
  onDelete, 
  loading 
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPreview, setSelectedPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !workspace?.id) return;

    setError('');
    setUploading(true);
    try {
      await onUpload(workspace.id, file);
    } catch (err) {
      setError(err.message || 'Gagal mengunggah berkas');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (mimeType, filename) => {
    if (mimeType?.includes('pdf') || filename?.endsWith('.pdf')) {
      return <FileText className="w-4 h-4 text-rose-400" />;
    }
    if (filename?.endsWith('.md') || filename?.endsWith('.txt')) {
      return <FileCode className="w-4 h-4 text-indigo-400" />;
    }
    return <FileCheck className="w-4 h-4 text-blue-400" />;
  };

  return (
    <div className="w-80 border-r border-slate-800 bg-slate-900/30 flex flex-col shrink-0 select-none">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Sumber Rujukan</span>
          <span className="text-[11px] text-slate-500 font-mono truncate max-w-[180px]">
            {workspace ? workspace.name : 'Pilih Ruang Kerja'}
          </span>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={!workspace || uploading}
          className="px-2.5 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white disabled:opacity-40 transition text-xs font-semibold flex items-center space-x-1 cursor-pointer"
          title="Unggah Dokumen (PDF, DOCX, MD)"
        >
          {uploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Unggah</span>
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.md,.txt"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {error && (
        <div className="m-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] flex items-center space-x-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{error}</span>
        </div>
      )}

      {/* Document List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center p-8 text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : !workspace ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Pilih atau buat ruang kerja terlebih dahulu di panel sebelah kiri.
          </div>
        ) : documents.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-slate-800/80 rounded-2xl">
            <UploadCloud className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-400">Belum ada dokumen</p>
            <p className="text-[10px] text-slate-500 mt-1">
              Klik tombol Unggah untuk menambahkan berkas PDF, DOCX, atau Markdown.
            </p>
          </div>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              className="group p-3 rounded-2xl bg-slate-800/40 hover:bg-slate-800/70 border border-slate-800 transition flex flex-col justify-between"
            >
              <div className="flex items-start space-x-2.5">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-700/60 shrink-0 mt-0.5">
                  {getFileIcon(doc.mime_type, doc.filename)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-slate-200 truncate leading-snug" title={doc.filename}>
                    {doc.filename}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center space-x-2">
                    <span>{doc.file_size_formatted || `${((doc.file_size || 0)/1024).toFixed(1)} KB`}</span>
                    <span>&bull;</span>
                    <span className="text-emerald-400">Terindeks</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-1 mt-2 pt-2 border-t border-slate-800/60 opacity-80 group-hover:opacity-100 transition">
                <button
                  onClick={() => setSelectedPreview(doc)}
                  className="px-2 py-1 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 text-[11px] font-medium flex items-center space-x-1 transition"
                  title="Pratinjau Teks Ekstraksi"
                >
                  <Eye className="w-3 h-3" />
                  <span>Lihat Teks</span>
                </button>
                <a
                  href={getDownloadUrl(doc.id)}
                  download
                  className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition"
                  title="Unduh Berkas ke Laptop / HP"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => {
                    if (confirm(`Hapus berkas "${doc.filename}" dari MongoDB?`)) {
                      onDelete(doc.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                  title="Hapus Dokumen"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Preview Ekstraksi Dokumen */}
      {selectedPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white truncate max-w-md">{selectedPreview.filename}</h3>
              </div>
              <button
                onClick={() => setSelectedPreview(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto my-4 text-xs font-mono text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800 select-text whitespace-pre-wrap">
              {selectedPreview.extracted_text || selectedPreview.preview_text || 'Tidak ada teks yang dapat diekstrak.'}
            </div>

            <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500">
              <span>{selectedPreview.file_size_formatted}</span>
              <button
                onClick={() => setSelectedPreview(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
