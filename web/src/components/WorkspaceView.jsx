import React, { useState } from 'react';
import SourcesPanel from './SourcesPanel';
import ChatPanel from './ChatPanel';
import StudioPanel from './StudioPanel';

export default function WorkspaceView({
  notebook,
  documents,
  notes,
  studioNotes,
  onOpenAddSource,
  onOpenCreateNote,
  onDeleteDocument,
  onDeleteNote,
  onDeleteStudioNote,
  onPreviewDocument,
  onViewNote,
  selectedDocIds,
  onToggleSelectDoc,
  onToggleSelectAll,
  messages,
  onSendMessage,
  loadingChat,
  selectedModel,
  onSelectModel,
  onCreateStudyTool,
  onGenerateAudio,
  isLeftSidebarOpen,
  isRightSidebarOpen,
  onToggleLeftSidebar,
  onToggleRightSidebar
}) {
  return (
    <div className="flex-1 flex overflow-hidden relative h-full">
      
      {/* MOBILE / TABLET OVERLAY BACKDROP */}
      {(isLeftSidebarOpen || isRightSidebarOpen) && (
        <div
          onClick={() => {
            if (isLeftSidebarOpen) onToggleLeftSidebar();
            if (isRightSidebarOpen) onToggleRightSidebar();
          }}
          className="lg:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* FLOATING BUTTON TO RE-OPEN SOURCES WHEN COLLAPSED */}
      {!isLeftSidebarOpen && (
        <button
          onClick={onToggleLeftSidebar}
          className="absolute top-3 left-3 z-20 px-3 py-1.5 rounded-full bg-[var(--nlm-surface)] hover:bg-[var(--nlm-surface-hover)] border border-[var(--nlm-border)] shadow-lg text-xs font-semibold text-[var(--nlm-text-primary)] flex items-center space-x-2 transition cursor-pointer animate-fadeIn"
          title="Tampilkan Panel Sumber & Catatan"
        >
          <i className="fa-solid fa-folder-open text-amber-500"></i>
          <span>Sumber ({documents.length})</span>
        </button>
      )}

      {/* FLOATING BUTTON TO RE-OPEN STUDIO WHEN COLLAPSED */}
      {!isRightSidebarOpen && (
        <button
          onClick={onToggleRightSidebar}
          className="absolute top-3 right-3 z-20 px-3 py-1.5 rounded-full bg-[var(--nlm-surface)] hover:bg-[var(--nlm-surface-hover)] border border-[var(--nlm-border)] shadow-lg text-xs font-semibold text-[var(--nlm-text-primary)] flex items-center space-x-2 transition cursor-pointer animate-fadeIn"
          title="Tampilkan Panel Studio & Alat Bantu"
        >
          <i className="fa-solid fa-headphones text-purple-600"></i>
          <span>Studio</span>
        </button>
      )}

      {/* PANEL 1: SUMBER & CATATAN (LEFT PANEL) */}
      <div
        className={`${
          isLeftSidebarOpen ? 'flex' : 'hidden'
        } h-full shrink-0 z-30 transition-all duration-300`}
      >
        <SourcesPanel
          notebook={notebook}
          documents={documents}
          notes={notes}
          onOpenAddSource={onOpenAddSource}
          onOpenCreateNote={onOpenCreateNote}
          onDeleteDocument={onDeleteDocument}
          onDeleteNote={onDeleteNote}
          onPreviewDocument={onPreviewDocument}
          onViewNote={onViewNote}
          selectedDocIds={selectedDocIds}
          onToggleSelectDoc={onToggleSelectDoc}
          onToggleSelectAll={onToggleSelectAll}
          onCollapse={onToggleLeftSidebar}
        />
      </div>

      {/* PANEL 2: MULTI-LLM GROUNDED CHAT (CENTER) */}
      <ChatPanel
        notebook={notebook}
        documents={documents}
        messages={messages}
        onSendMessage={onSendMessage}
        loading={loadingChat}
        selectedModel={selectedModel}
        onSelectModel={onSelectModel}
        onSelectCitation={onPreviewDocument}
      />

      {/* PANEL 3: STUDIO & CATATAN ALAT (RIGHT PANEL) */}
      <div
        className={`${
          isRightSidebarOpen ? 'flex' : 'hidden'
        } h-full shrink-0 z-30 transition-all duration-300`}
      >
        <StudioPanel
          documents={documents}
          notes={studioNotes}
          onCreateStudyTool={onCreateStudyTool}
          onGenerateAudio={onGenerateAudio}
          onViewNote={onViewNote}
          onDeleteNote={onDeleteStudioNote}
          onCollapse={onToggleRightSidebar}
        />
      </div>

    </div>
  );
}
