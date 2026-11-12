import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import WorkspaceSidebar from './components/WorkspaceSidebar';
import DocumentPanel from './components/DocumentPanel';
import ChatArea from './components/ChatArea';
import AuthModal from './components/AuthModal';
import { 
  apiGetWorkspaces, 
  apiCreateWorkspace, 
  apiDeleteWorkspace, 
  apiGetDocuments, 
  apiUploadDocument, 
  apiDeleteDocument, 
  apiSendChat, 
  apiCheckHealth,
  apiGetMe
} from './services/api';

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('noteroute_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [serverHealth, setServerHealth] = useState(null);

  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(false);

  const [documents, setDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  const [messages, setMessages] = useState([]);
  const [loadingChat, setLoadingChat] = useState(false);

  // 1. Initial Health & Workspaces Load
  useEffect(() => {
    const initApp = async () => {
      try {
        const health = await apiCheckHealth();
        setServerHealth(health);
      } catch (e) {
        console.warn('Backend server offline or starting:', e.message);
      }

      await loadWorkspaces();
    };

    initApp();
  }, []);

  // 2. Load Workspaces from MongoDB
  const loadWorkspaces = async () => {
    setLoadingWorkspaces(true);
    try {
      const data = await apiGetWorkspaces();
      setWorkspaces(data);
      if (data.length > 0 && !activeWorkspace) {
        setActiveWorkspace(data[0]);
      }
    } catch (err) {
      console.error('Gagal memuat workspaces:', err);
    } finally {
      setLoadingWorkspaces(false);
    }
  };

  // 3. Load Documents when activeWorkspace changes
  useEffect(() => {
    if (!activeWorkspace?.id) {
      setDocuments([]);
      setMessages([]);
      return;
    }

    const loadDocs = async () => {
      setLoadingDocuments(true);
      try {
        const docs = await apiGetDocuments(activeWorkspace.id);
        setDocuments(docs);
      } catch (err) {
        console.error('Gagal memuat berkas:', err);
      } finally {
        setLoadingDocuments(false);
      }
    };

    loadDocs();
  }, [activeWorkspace]);

  // 4. Handle Workspace Actions
  const handleCreateWorkspace = async (name, description) => {
    const newWs = await apiCreateWorkspace(name, description);
    setWorkspaces((prev) => [newWs, ...prev]);
    setActiveWorkspace(newWs);
  };

  const handleDeleteWorkspace = async (id) => {
    await apiDeleteWorkspace(id);
    const remaining = workspaces.filter((w) => w.id !== id);
    setWorkspaces(remaining);
    if (activeWorkspace?.id === id) {
      setActiveWorkspace(remaining[0] || null);
    }
  };

  // 5. Handle Document Actions
  const handleUploadDocument = async (workspaceId, file) => {
    const uploaded = await apiUploadDocument(workspaceId, file);
    setDocuments((prev) => [uploaded, ...prev]);
    // Update count in workspaces list
    setWorkspaces((prev) =>
      prev.map((w) =>
        w.id === workspaceId ? { ...w, document_count: (w.document_count || 0) + 1 } : w
      )
    );
  };

  const handleDeleteDocument = async (id) => {
    await apiDeleteDocument(id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    if (activeWorkspace) {
      setWorkspaces((prev) =>
        prev.map((w) =>
          w.id === activeWorkspace.id
            ? { ...w, document_count: Math.max(0, (w.document_count || 1) - 1) }
            : w
        )
      );
    }
  };

  // 6. Handle Chat
  const handleSendMessage = async (prompt, modelTarget) => {
    if (!activeWorkspace) return;

    const userMsg = {
      id: 'u_' + Date.now(),
      role: 'user',
      content: prompt,
      created_at: new Date().toISOString()
    };

    const currentHistory = [...messages, userMsg];
    setMessages(currentHistory);
    setLoadingChat(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await apiSendChat({
        workspaceId: activeWorkspace.id,
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
        content: `Galat inferensi AI: ${err.message || 'Gagal menghubungi router AI. Periksa koneksi atau kunci API.'}`,
        created_at: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoadingChat(false);
    }
  };

  // 7. Auth State
  const handleAuthSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('noteroute_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('noteroute_user');
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Navigation Bar */}
      <Navbar
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        serverHealth={serverHealth}
      />

      {/* 3-Column Studio Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Workspaces */}
        <WorkspaceSidebar
          workspaces={workspaces}
          activeWorkspace={activeWorkspace}
          onSelectWorkspace={setActiveWorkspace}
          onCreateWorkspace={handleCreateWorkspace}
          onDeleteWorkspace={handleDeleteWorkspace}
          loading={loadingWorkspaces}
        />

        {/* Center-Left: Documents Explorer */}
        <DocumentPanel
          workspace={activeWorkspace}
          documents={documents}
          onUpload={handleUploadDocument}
          onDelete={handleDeleteDocument}
          loading={loadingDocuments}
        />

        {/* Center-Right: Document Chat Area with Citations & Switcher */}
        <ChatArea
          workspace={activeWorkspace}
          documents={documents}
          messages={messages}
          onSendMessage={handleSendMessage}
          loading={loadingChat}
        />
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
