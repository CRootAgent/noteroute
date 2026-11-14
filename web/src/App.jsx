import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomeView from './components/HomeView';
import WorkspaceView from './components/WorkspaceView';
import SettingsModal from './components/SettingsModal';
import AuthModal from './components/AuthModal';
import AddSourceModal from './components/AddSourceModal';
import CreateNoteModal from './components/CreateNoteModal';
import NoteViewerModal from './components/NoteViewerModal';
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
  const [currentView, setCurrentView] = useState('home');

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
  const [activeNotebook, setActiveNotebook] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Documents & Chat Messages
  const [documents, setDocuments] = useState([]);
  const [selectedDocIds, setSelectedDocIds] = useState([]);
  const [messages, setMessages] = useState([]);
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
      return saved ? JSON.parse(saved) : [
        {
          id: 'sn_1',
          title: 'Briefing Doc: Ringkasan Eksekutif Bab 3',
          content: 'Kajian terhadap konsistensi data terdistribusi menunjukkan pentingnya replikasi sinkron dan asinkron.',
          date: '12 Nov'
        },
        {
          id: 'sn_2',
          title: 'Panduan Belajar: Konsep Kunci Paxos & Raft',
          content: 'Rangkuman algoritma konsensus dalam menjaga ketersediaan layanan.',
          date: '10 Nov'
        }
      ];
    } catch {
      return [];
    }
  });

  // Responsive Sidebar States
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState('profile');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);
  const [isCreateNoteOpen, setIsCreateNoteOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [previewType, setPreviewType] = useState('document');

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

  // 3. Load Documents when activeNotebook changes
  useEffect(() => {
    if (!activeNotebook?.id) {
      setDocuments([]);
      setSelectedDocIds([]);
      setMessages([]);
      return;
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
      alert('Gagal membuat notebook: ' + err.message);
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
      const remaining = notebooks.filter((nb) => nb.id !== id);
      setNotebooks(remaining);
      if (activeNotebook?.id === id) {
        setActiveNotebook(null);
        setCurrentView('home');
      }
    } catch (err) {
      alert('Gagal menghapus notebook: ' + err.message);
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
    await apiDeleteDocument(id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
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
        history: historyPayload
      });

      const assistantMsg = {
        id: 'a_' + Date.now(),
        role: 'assistant',
        content: res.answer || res.content,
        citations: res.citations || [],
        model_used: res.model_used || modelTarget,
        failover: res.failover || false,
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

  // 7. Studio Actions
  const handleCreateStudyTool = (toolName) => {
    const promptText = `Buatkan ${toolName} yang mendalam dan terstruktur rapi berdasarkan materi berkas yang dipilih.`;
    handleSendMessage(promptText, selectedModel);

    // Also record note in studio
    const newNote = {
      id: 'sn_' + Date.now(),
      title: `${toolName}: ${activeNotebook?.name || 'Materi Kuliah'}`,
      content: `Dibuat otomatis oleh AI (${selectedModel}) untuk membantu persiapan materi.`,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    };
    setStudioNotes((prev) => [newNote, ...prev]);
  };

  const handleGenerateAudio = () => {
    const audioNote = {
      id: 'sn_' + Date.now(),
      title: `Ikhtisar Audio: ${activeNotebook?.name || 'Materi'}`,
      content: 'Percakapan 2 host AI membedah konsep penting dan analisis komparasi dari materi kuliah Anda.',
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    };
    setStudioNotes((prev) => [audioNote, ...prev]);
  };

  // 8. Auth & Profile
  const handleAuthSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('noteroute_user', JSON.stringify(userData));
    localStorage.setItem('noteroute_auth_user', JSON.stringify(userData));
    loadNotebooks(userData);
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
            loadingChat={loadingChat}
            selectedModel={selectedModel}
            onSelectModel={setSelectedModel}
            onCreateStudyTool={handleCreateStudyTool}
            onGenerateAudio={handleGenerateAudio}
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

    </div>
  );
}
