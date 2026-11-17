import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomeView from './components/HomeView';
import WorkspaceView from './components/WorkspaceView';
import SettingsModal from './components/SettingsModal';
import AuthModal from './components/AuthModal';
import AddSourceModal from './components/AddSourceModal';
import CreateNoteModal from './components/CreateNoteModal';
import NoteViewerModal from './components/NoteViewerModal';
import QuickGuideModal from './components/QuickGuideModal';
import DialogModal from './components/DialogModal';
import {
  apiGetWorkspaces,
  apiCreateWorkspace,
  apiDeleteWorkspace,
  apiGetDocuments,
  apiUploadDocument,
  apiDeleteDocument,
  apiSendChat,
  apiCheckHealth
} from './services/api';

export default function App() {
  // Navigation View: 'home' (Beranda Notebook) vs 'workspace' (Workspace 3-Kolom)
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('noteroute_current_view') || 'home';
  });

  // Theme: 'dark', 'light', 'system'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('noteroute_theme') || 'dark';
  });

  // AI Mode: 'document' (RAG) vs 'general' (AI Bebas)
  const [aiMode, setAiMode] = useState('document');

  // Authenticated User State
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('noteroute_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Notebooks / Workspaces
  const [notebooks, setNotebooks] = useState([]);
  const [activeNotebook, setActiveNotebook] = useState(() => {
    try {
      const saved = localStorage.getItem('noteroute_active_notebook');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Documents & Chat Messages (Persisted across refreshes & tab closes)
  const [documents, setDocuments] = useState([]);
  const [selectedDocIds, setSelectedDocIds] = useState([]);
  const [messages, setMessages] = useState(() => {
    try {
      const savedNb = localStorage.getItem('noteroute_active_notebook');
      if (savedNb) {
        const nb = JSON.parse(savedNb);
        if (nb?.id) {
          const savedChat = localStorage.getItem(`noteroute_chat_messages_${nb.id}`);
          if (savedChat) return JSON.parse(savedChat);
        }
      }
    } catch {}
    return [];
  });
  const [selectedModel, setSelectedModel] = useState('gemini');
  const [loadingChat, setLoadingChat] = useState(false);

  // Notes
  const [personalNotes, setPersonalNotes] = useState(() => {
    try {
      const saved = localStorage.getItem('noteroute_personal_notes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [studioNotes, setStudioNotes] = useState(() => {
    try {
      const saved = localStorage.getItem('noteroute_studio_notes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Responsive Sidebar States
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

  // Modals & Notifications
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState('profile');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);
  const [isCreateNoteOpen, setIsCreateNoteOpen] = useState(false);
  const [isQuickGuideOpen, setIsQuickGuideOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [previewType, setPreviewType] = useState('document');
  const [welcomeToast, setWelcomeToast] = useState(null);
  const [generatingTool, setGeneratingTool] = useState(null);
  const [dialogModal, setDialogModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    confirmText: 'OK',
    cancelText: 'Batal',
    onConfirm: null
  });

  // Check if just logged in from noteroute.home
  useEffect(() => {
    try {
      const justLoggedIn = sessionStorage.getItem('noteroute_just_logged_in');
      if (justLoggedIn && user?.name) {
        setWelcomeToast(`Selamat datang, ${user.name}!`);
        sessionStorage.removeItem('noteroute_just_logged_in');
        setTimeout(() => setWelcomeToast(null), 3500);
      }
    } catch {
      // ignore
    }
  }, [user]);

  // 1. Sync Theme & AI Mode Classes on HTML Element
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light', 'mode-doc', 'mode-general');

    let activeTheme = theme;
    if (theme === 'system') {
      activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    root.classList.add(activeTheme);
    root.classList.add(aiMode === 'document' ? 'mode-doc' : 'mode-general');
    localStorage.setItem('noteroute_theme', theme);
  }, [theme, aiMode]);

  // 2. Load Notebooks / Workspaces for Logged In User
  const loadNotebooks = async (targetUser = user) => {
    const userId = targetUser?.id || targetUser?.email;
    if (!userId) {
      setNotebooks([]);
      setActiveNotebook(null);
      return;
    }

    try {
      const data = await apiGetWorkspaces(userId);
      setNotebooks(data);
      if (activeNotebook) {
        const refreshed = data.find((nb) => nb.id === activeNotebook.id);
        if (refreshed) setActiveNotebook(refreshed);
      }
    } catch (err) {
      console.warn('Gagal memuat notebook dari database:', err.message);
    }
  };

  useEffect(() => {
    loadNotebooks(user);
  }, [user]);

  // 3. Load Documents & Persisted Chat when activeNotebook changes
  useEffect(() => {
    if (!activeNotebook?.id) {
      setDocuments([]);
      setSelectedDocIds([]);
      setMessages([]);
      return;
    }

    // Load persisted chat history for this specific notebook
    try {
      const savedChat = localStorage.getItem(`noteroute_chat_messages_${activeNotebook.id}`);
      if (savedChat) {
        setMessages(JSON.parse(savedChat));
      } else {
        setMessages([]);
      }
    } catch {
      setMessages([]);
    }

    const loadDocs = async () => {
      try {
        const docs = await apiGetDocuments(activeNotebook.id);
        setDocuments(docs);
        setSelectedDocIds(docs.map((d) => d.id));
      } catch (err) {
        console.error('Gagal memuat dokumen:', err);
      }
    };

    loadDocs();
  }, [activeNotebook?.id]);

  // Persist chat messages whenever messages array updates for active notebook
  useEffect(() => {
    if (activeNotebook?.id && Array.isArray(messages)) {
      try {
        localStorage.setItem(`noteroute_chat_messages_${activeNotebook.id}`, JSON.stringify(messages));
      } catch (e) {
        console.warn('Gagal menyimpan riwayat chat:', e);
      }
    }
  }, [messages, activeNotebook?.id]);

  // Sync currentView and activeNotebook to localStorage
  useEffect(() => {
    localStorage.setItem('noteroute_current_view', currentView);
  }, [currentView]);

  useEffect(() => {
    if (activeNotebook) {
      localStorage.setItem('noteroute_active_notebook', JSON.stringify(activeNotebook));
    } else {
      localStorage.removeItem('noteroute_active_notebook');
    }
  }, [activeNotebook]);

  // Save notes to localStorage
  useEffect(() => {
    localStorage.setItem('noteroute_personal_notes', JSON.stringify(personalNotes));
  }, [personalNotes]);

  useEffect(() => {
    localStorage.setItem('noteroute_studio_notes', JSON.stringify(studioNotes));
  }, [studioNotes]);

  // 4. Notebook Actions
  const handleOpenNotebook = (nb) => {
    setActiveNotebook(nb);
    setCurrentView('workspace');
  };

  const handleCreateNotebook = async (title) => {
    const userId = user?.id || user?.email || 'user_local';
    try {
      const newNb = await apiCreateWorkspace(title, 'Notebook NoteRoute', userId);
      setNotebooks((prev) => [newNb, ...prev]);
      setActiveNotebook(newNb);
      setCurrentView('workspace');
    } catch (err) {
      setDialogModal({
        isOpen: true,
        title: 'Gagal Membuat Notebook',
        message: err.message || 'Terjadi kesalahan saat membuat notebook.',
        type: 'danger'
      });
    }
  };

  const handleRenameNotebook = async (id, newTitle) => {
    // Optimistic rename
    setNotebooks((prev) =>
      prev.map((nb) => (nb.id === id ? { ...nb, name: newTitle } : nb))
    );
    if (activeNotebook?.id === id) {
      setActiveNotebook((prev) => (prev ? { ...prev, name: newTitle } : null));
    }
  };

  const handleDeleteNotebook = async (id) => {
    try {
      await apiDeleteWorkspace(id);
      try {
        localStorage.removeItem(`noteroute_chat_messages_${id}`);
      } catch {}
      const remaining = notebooks.filter((nb) => nb.id !== id);
      setNotebooks(remaining);
      if (activeNotebook?.id === id) {
        setActiveNotebook(null);
        setCurrentView('home');
      }
    } catch (err) {
      setDialogModal({
        isOpen: true,
        title: 'Gagal Menghapus Notebook',
        message: err.message || 'Terjadi kesalahan saat menghapus notebook.',
        type: 'danger'
      });
    }
  };

  // 5. Document Actions
  const handleUploadDocument = async (workspaceId, file) => {
    const uploaded = await apiUploadDocument(workspaceId, file);
    setDocuments((prev) => [uploaded, ...prev]);
    setSelectedDocIds((prev) => [...prev, uploaded.id]);
    setNotebooks((prev) =>
      prev.map((nb) =>
        nb.id === workspaceId
          ? { ...nb, document_count: (nb.document_count || 0) + 1 }
          : nb
      )
    );
  };

  const handleDeleteDocument = async (id) => {
    await apiDeleteDocument(id, activeNotebook?.id);
    setDocuments((prev) => prev.filter((d) => d.id !== id && d._id !== id));
    setSelectedDocIds((prev) => prev.filter((x) => x !== id));
    if (activeNotebook) {
      setNotebooks((prev) =>
        prev.map((nb) =>
          nb.id === activeNotebook.id
            ? { ...nb, document_count: Math.max(0, (nb.document_count || 1) - 1) }
            : nb
        )
      );
    }
  };

  // 6. Chat Actions
  const handleSendMessage = async (prompt, modelTarget) => {
    if (!activeNotebook) return;

    const userMsg = {
      id: 'u_' + Date.now(),
      role: 'user',
      content: prompt,
      created_at: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoadingChat(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await apiSendChat({
        workspaceId: activeNotebook.id,
        prompt,
        modelTarget,
        history: historyPayload,
        aiMode
      });

      const assistantMsg = {
        id: 'a_' + Date.now(),
        role: 'assistant',
        content: res.answer || res.content,
        citations: res.citations || [],
        model_used: res.model_used || modelTarget,
        failover: res.failover || false,
        failover_reason: res.failover_reason || null,
        created_at: new Date().toISOString()
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg = {
        id: 'err_' + Date.now(),
        role: 'assistant',
        content: `Galat inferensi AI: ${
          err.message || 'Gagal menghubungi router AI. Periksa koneksi atau kunci API.'
        }`,
        created_at: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoadingChat(false);
    }
  };

  // Edit a previously sent message and re-run inference
  const handleEditMessage = async (msgId, newContent) => {
    const targetIdx = messages.findIndex((m) => m.id === msgId);
    if (targetIdx === -1) return;

    const truncatedHistory = messages.slice(0, targetIdx);
    const updatedUserMsg = {
      ...messages[targetIdx],
      content: newContent,
      created_at: new Date().toISOString()
    };

    setMessages([...truncatedHistory, updatedUserMsg]);
    setLoadingChat(true);

    try {
      const historyPayload = truncatedHistory.slice(-6).map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await apiSendChat({
        workspaceId: activeNotebook?.id,
        prompt: newContent,
        modelTarget: selectedModel,
        history: historyPayload,
        aiMode
      });

      const assistantMsg = {
        id: 'a_' + Date.now(),
        role: 'assistant',
        content: res.answer || res.content,
        citations: res.citations || [],
        model_used: res.model_used || selectedModel,
        failover: res.failover || false,
        failover_reason: res.failover_reason || null,
        created_at: new Date().toISOString()
      };

      setMessages([...truncatedHistory, updatedUserMsg, assistantMsg]);
    } catch (err) {
      const errorMsg = {
        id: 'err_' + Date.now(),
        role: 'assistant',
        content: `Galat inferensi AI: ${
          err.message || 'Gagal menghubungi router AI. Periksa koneksi atau kunci API.'
        }`,
        created_at: new Date().toISOString()
      };
      setMessages([...truncatedHistory, updatedUserMsg, errorMsg]);
    } finally {
      setLoadingChat(false);
    }
  };

  // Regenerate an assistant response from the preceding user prompt
  const handleRegenerateMessage = async (msgId) => {
    const targetIdx = messages.findIndex((m) => m.id === msgId);
    if (targetIdx === -1) return;

    let promptToReplay = '';
    let truncatedHistory = [];

    for (let i = targetIdx - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        promptToReplay = messages[i].content;
        truncatedHistory = messages.slice(0, i);
        break;
      }
    }

    if (!promptToReplay) return;

    const retainedMessages = messages.slice(0, targetIdx);
    setMessages(retainedMessages);
    setLoadingChat(true);

    try {
      const historyPayload = truncatedHistory.slice(-6).map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await apiSendChat({
        workspaceId: activeNotebook?.id,
        prompt: promptToReplay,
        modelTarget: selectedModel,
        history: historyPayload,
        aiMode
      });

      const newAssistantMsg = {
        id: 'a_' + Date.now(),
        role: 'assistant',
        content: res.answer || res.content,
        citations: res.citations || [],
        model_used: res.model_used || selectedModel,
        failover: res.failover || false,
        failover_reason: res.failover_reason || null,
        created_at: new Date().toISOString()
      };

      setMessages([...retainedMessages, newAssistantMsg]);
    } catch (err) {
      const errorMsg = {
        id: 'err_' + Date.now(),
        role: 'assistant',
        content: `Galat inferensi AI: ${
          err.message || 'Gagal menghubungi router AI. Periksa koneksi atau kunci API.'
        }`,
        created_at: new Date().toISOString()
      };
      setMessages([...retainedMessages, errorMsg]);
    } finally {
      setLoadingChat(false);
    }
  };

  // Clear chat history for active notebook
  const handleClearChat = () => {
    if (!activeNotebook?.id) return;
    setDialogModal({
      isOpen: true,
      title: 'Bersihkan Riwayat Percakapan',
      message: 'Apakah Anda yakin ingin mengosongkan riwayat percakapan notebook ini? Tindakan ini tidak dapat dibatalkan.',
      type: 'confirm',
      confirmText: 'Ya, Bersihkan',
      cancelText: 'Batal',
      onConfirm: () => {
        setMessages([]);
        try {
          localStorage.removeItem(`noteroute_chat_messages_${activeNotebook.id}`);
        } catch {}
      }
    });
  };

  // 7. Studio Actions (Generates content directly into Studio Notes without polluting chat)
  const handleCreateStudyTool = async (toolName) => {
    if (!activeNotebook) return;
    setGeneratingTool(toolName);

    const promptText = `Tolong buatkan ${toolName} yang komprehensif, terstruktur rapi, lengkap dengan poin-poin penjelasan penting berbasis materi berkas dokumen rujukan yang dipilih dalam format Markdown.`;

    try {
      const res = await apiSendChat({
        workspaceId: activeNotebook.id,
        prompt: promptText,
        modelTarget: selectedModel,
        history: [],
        aiMode: 'document'
      });

      const generatedContent = res.answer || res.content || 'Catatan berhasil dibuat.';

      const newNote = {
        id: 'sn_' + Date.now(),
        title: `${toolName}: ${activeNotebook.name}`,
        content: generatedContent,
        tool: toolName,
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        created_at: new Date().toISOString()
      };

      setStudioNotes((prev) => [newNote, ...prev]);

      // Open the note viewer immediately so the user can inspect the generated study tool
      setPreviewItem(newNote);
      setPreviewType('note');
    } catch (err) {
      setDialogModal({
        isOpen: true,
        title: `Gagal Membuat ${toolName}`,
        message: err.message || 'Terjadi kesalahan saat memproses generator studio.',
        type: 'danger'
      });
    } finally {
      setGeneratingTool(null);
    }
  };

  // 8. Auth & Profile
  const handleAuthSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('noteroute_user', JSON.stringify(userData));
    localStorage.setItem('noteroute_auth_user', JSON.stringify(userData));
    loadNotebooks(userData);
    setWelcomeToast(`Selamat datang, ${userData.name}!`);
    setTimeout(() => {
      setWelcomeToast(null);
    }, 3500);
  };

  const handleUpdateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('noteroute_user', JSON.stringify(updated));
    if (updates.avatar !== undefined) {
      if (updates.avatar) {
        localStorage.setItem('noteroute_avatar_' + user.email, updates.avatar);
      } else {
        localStorage.removeItem('noteroute_avatar_' + user.email);
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    setNotebooks([]);
    setActiveNotebook(null);
    setDocuments([]);
    setMessages([]);
    localStorage.removeItem('noteroute_user');
    localStorage.removeItem('noteroute_auth_user');
    localStorage.removeItem('noteroute_active_notebook');
    localStorage.removeItem('noteroute_current_view');

    const landingUrl =
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:8080/'
        : 'https://crootagent.github.io/noteroute.home/';
    window.location.href = landingUrl;
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden font-sans bg-[var(--nlm-bg)] text-[var(--nlm-text-primary)] transition-colors duration-200">
      
      {/* 1. TOP APP BAR */}
      <Navbar
        currentView={currentView}
        onNavigateHome={() => setCurrentView('home')}
        activeNotebook={activeNotebook}
        onRenameNotebook={(newTitle) => {
          if (activeNotebook) handleRenameNotebook(activeNotebook.id, newTitle);
        }}
        user={user}
        aiMode={aiMode}
        onToggleAiMode={(mode) => setAiMode(mode)}
        theme={theme}
        onOpenSettings={(tab) => {
          setSettingsInitialTab(tab);
          setIsSettingsOpen(true);
        }}
        onOpenAuth={() => {
          setAuthMode('signin');
          setIsAuthOpen(true);
        }}
        onLogout={handleLogout}
        onOpenQuickGuide={() => setIsQuickGuideOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        onToggleLeftSidebar={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
        onToggleRightSidebar={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
      />

      {/* 2. MAIN BODY (HOME VIEW OR WORKSPACE VIEW) */}
      {currentView === 'home' ? (
        <div className="flex-1 overflow-y-auto">
          <HomeView
            notebooks={notebooks}
            onOpenNotebook={handleOpenNotebook}
            onCreateNotebook={handleCreateNotebook}
            onRenameNotebook={handleRenameNotebook}
            onDeleteNotebook={handleDeleteNotebook}
            searchQuery={searchQuery}
            viewMode={viewMode}
            user={user}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <WorkspaceView
            notebook={activeNotebook}
            documents={documents}
            notes={personalNotes}
            studioNotes={studioNotes}
            onOpenAddSource={() => setIsAddSourceOpen(true)}
            onOpenCreateNote={() => setIsCreateNoteOpen(true)}
            onDeleteDocument={handleDeleteDocument}
            onDeleteNote={(id) => setPersonalNotes((p) => p.filter((x) => x.id !== id))}
            onDeleteStudioNote={(id) => setStudioNotes((p) => p.filter((x) => x.id !== id))}
            onPreviewDocument={(doc) => {
              setPreviewItem(doc);
              setPreviewType('document');
            }}
            onViewNote={(note) => {
              setPreviewItem(note);
              setPreviewType('note');
            }}
            selectedDocIds={selectedDocIds}
            onToggleSelectDoc={(id) =>
              setSelectedDocIds((prev) =>
                prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
              )
            }
            onToggleSelectAll={() => {
              if (selectedDocIds.length === documents.length) {
                setSelectedDocIds([]);
              } else {
                setSelectedDocIds(documents.map((d) => d.id));
              }
            }}
            messages={messages}
            onSendMessage={handleSendMessage}
            onEditMessage={handleEditMessage}
            onRegenerateMessage={handleRegenerateMessage}
            onClearChat={handleClearChat}
            loadingChat={loadingChat}
            selectedModel={selectedModel}
            onSelectModel={setSelectedModel}
            onCreateStudyTool={handleCreateStudyTool}
            generatingTool={generatingTool}
            aiMode={aiMode}
            isLeftSidebarOpen={isLeftSidebarOpen}
            isRightSidebarOpen={isRightSidebarOpen}
            onToggleLeftSidebar={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
            onToggleRightSidebar={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
          />
        </div>
      )}

      {/* 3. SETTINGS MODAL */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialTab={settingsInitialTab}
        user={user}
        onUpdateUser={handleUpdateUser}
        theme={theme}
        onSetTheme={setTheme}
      />

      {/* 4. SLIDING AUTH MODAL */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authMode}
      />

      {/* 5. ADD SOURCE MODAL (DRAG & DROP) */}
      <AddSourceModal
        isOpen={isAddSourceOpen}
        onClose={() => setIsAddSourceOpen(false)}
        onUpload={handleUploadDocument}
        notebook={activeNotebook}
      />

      {/* 6. CREATE NOTE MODAL */}
      <CreateNoteModal
        isOpen={isCreateNoteOpen}
        onClose={() => setIsCreateNoteOpen(false)}
        onSaveNote={(note) => setPersonalNotes((prev) => [note, ...prev])}
      />

      {/* 7. NOTE / CITATION VIEWER MODAL */}
      <NoteViewerModal
        isOpen={Boolean(previewItem)}
        onClose={() => setPreviewItem(null)}
        item={previewItem}
        type={previewType}
      />

      {/* 8. QUICK GUIDE / TUTORIAL MODAL */}
      <QuickGuideModal
        isOpen={isQuickGuideOpen}
        onClose={() => setIsQuickGuideOpen(false)}
      />

      {/* 9. WELCOME TOAST NOTIFICATION */}
      {welcomeToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xl animate-slideUp">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-sm font-bold">
            👋
          </div>
          <div>
            <div className="text-xs font-bold">{welcomeToast}</div>
            <div className="text-[10px] text-blue-100">Ruang kerja dan catatan Anda telah siap.</div>
          </div>
          <button
            onClick={() => setWelcomeToast(null)}
            className="text-white/70 hover:text-white p-1"
          >
            <i className="fa-solid fa-xmark text-xs"></i>
          </button>
        </div>
      )}

      {/* 10. GLOBAL DIALOG MODAL (ALERTS & CONFIRMS) */}
      <DialogModal
        isOpen={dialogModal.isOpen}
        title={dialogModal.title}
        message={dialogModal.message}
        type={dialogModal.type}
        confirmText={dialogModal.confirmText}
        cancelText={dialogModal.cancelText}
        onConfirm={dialogModal.onConfirm}
        onClose={() => setDialogModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
