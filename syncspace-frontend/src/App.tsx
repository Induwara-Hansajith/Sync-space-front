import React, { useState, useEffect } from 'react';
import { User, Note, Role } from './types';
import { notesApi, onBackendStatusChange } from './services/api';
import { AuthScreen } from './components/auth/AuthScreen';
import { ProfileModal } from './components/profile/ProfileModal';
import { AiSidebar } from './components/ai/AiSidebar';
import { NoteWorkspace } from './components/notes/NoteWorkspace';
import { TeamChatPanel } from './components/chat/TeamChatPanel';
import { Server } from 'lucide-react';

export const App: React.FC = () => {
  // Current authenticated user (persisted in session)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('syncspace_user_v3');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [simulatedRole, setSimulatedRole] = useState<Role | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isBackendLive, setIsBackendLive] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Monitor backend live status
  useEffect(() => {
    const unsub = onBackendStatusChange((live) => {
      setIsBackendLive(live);
    });
    return unsub;
  }, []);

  // Fetch initial notes
  useEffect(() => {
    if (currentUser) {
      notesApi.getNotes().then((loadedNotes) => {
        setNotes(loadedNotes);
        if (loadedNotes.length > 0) {
          setActiveNote(loadedNotes[0]);
        }
      });
    }
  }, [currentUser]);

  // Persist user in localStorage
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('syncspace_user_v3', JSON.stringify(user));
    } catch (e) {
      console.warn(e);
    }
    showToast(`Logged in as ${user.displayName} (${user.role})`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSimulatedRole(null);
    localStorage.removeItem('syncspace_user_v3');
    showToast('Logged out of Sync-Space');
  };

  const handleUpdateProfile = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('syncspace_user_v3', JSON.stringify(updatedUser));
    } catch (e) {
      console.warn(e);
    }
    showToast('Profile and status updated successfully');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCreateNote = async () => {
    if (!currentUser) return;
    const newNote = await notesApi.createNote({
      title: 'New Architecture Note',
      category: 'General',
      createdBy: currentUser.displayName,
      collaborators: [
        {
          userId: currentUser.id,
          userEmail: currentUser.email,
          displayName: currentUser.displayName,
          role: 'ADMIN',
        },
      ],
      blocks: [
        {
          id: `b-h-${Date.now()}`,
          type: 'HEADING',
          content: 'New Collaboration Workspace',
          metadata: { level: 1 },
        },
        {
          id: `b-p-${Date.now()}`,
          type: 'PARAGRAPH',
          content: 'Add blocks, code snippets, inline images, or documents to collaborate in real-time.',
        },
      ],
    });

    setNotes((prev) => [newNote, ...prev]);
    setActiveNote(newNote);
    showToast('New collaborative note created');
  };

  const handleUpdateNote = async (updated: Note) => {
    setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    setActiveNote(updated);
    await notesApi.updateNote(updated.id, updated);
  };

  const handleDeleteNote = async (noteId: string) => {
    await notesApi.deleteNote(noteId);
    setNotes((prev) => {
      const filtered = prev.filter((n) => n.id !== noteId);
      setActiveNote(filtered[0] || null);
      return filtered;
    });
    showToast('Note deleted');
  };

  // If user is not logged in, render Auth Screen
  if (!currentUser) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-black font-sans">
      {/* Subtle Top Workspace Status Bar */}
      <header className="h-9 px-3.5 bg-[#08090a] border-b border-[#18191c] flex items-center justify-between text-xs text-discordMuted shrink-0 select-none">
        <div className="flex items-center gap-2">
          <img
            src="/logo.jpg"
            alt="Sync-Space Logo"
            className="w-5 h-5 rounded-full object-cover border border-discordHover/80 shadow-sm"
          />
          <span className="font-semibold text-white tracking-wide">Sync-Space</span>
          <span className="text-discordHover">/</span>
          <span className="text-[11px] text-discordText">Engineering Workspace</span>
          {simulatedRole && (
            <span className="ml-2 px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-mono">
              QA Simulation Active: {simulatedRole}
            </span>
          )}
        </div>

        {/* Backend & Gateway Status Indicator */}
        <div className="flex items-center gap-3">
          {toastMessage && (
            <div className="text-[11px] text-discordGreen font-medium animate-fadeIn">
              {toastMessage}
            </div>
          )}
          <div
            className="flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded bg-discordMid border border-discordHover"
            title={
              isBackendLive
                ? 'Connected to Spring Cloud API Gateway (http://localhost:8080)'
                : 'Spring Cloud Gateway is offline. Running in zero-failure Local Mock Mode.'
            }
          >
            <Server className={`w-3 h-3 ${isBackendLive ? 'text-discordGreen' : 'text-discordBlurple'}`} />
            <span className="font-mono">
              Gateway: {isBackendLive ? 'Live :8080' : 'Offline (Mock Mode)'}
            </span>
          </div>
        </div>
      </header>

      {/* 3-Column Discord-Style Workspace Layout */}
      <div className="flex-1 flex flex-row overflow-hidden">
        {/* Left Panel (20% width) — Private AI Assistant */}
        <div className="w-1/5 min-w-[260px] max-w-[340px] h-full shrink-0">
          <AiSidebar
            user={currentUser}
            activeNote={activeNote}
            onOpenProfile={() => setIsProfileOpen(true)}
            onLogout={handleLogout}
          />
        </div>

        {/* Center Panel (50% width) — Workspace Notes & Inline Block Editor */}
        <div className="w-1/2 flex-1 h-full min-w-0">
          <NoteWorkspace
            notes={notes}
            activeNote={activeNote}
            currentUser={currentUser}
            simulatedRole={simulatedRole}
            onSelectNote={setActiveNote}
            onCreateNote={handleCreateNote}
            onUpdateNote={handleUpdateNote}
            onDeleteNote={handleDeleteNote}
            onSimulateRoleChange={setSimulatedRole}
          />
        </div>

        {/* Right Panel (30% width) — Real-Time Team Chat */}
        <div className="w-[30%] min-w-[300px] max-w-[440px] h-full shrink-0">
          <TeamChatPanel currentUser={currentUser} />
        </div>
      </div>

      {/* User Profile Modal */}
      <ProfileModal
        user={currentUser}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onSave={handleUpdateProfile}
      />
    </div>
  );
};

export default App;
