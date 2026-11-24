import React, { useState, useRef } from 'react';
import { Note, Role, User, NoteCollaborator, ContentBlock } from '../../types';
import { InlineBlockEditor } from './InlineBlockEditor';
import { RoleManagerModal } from './RoleManagerModal';
import {
  FileText,
  Plus,
  Share2,
  Trash2,
  Check,
  ChevronDown,
  ShieldCheck,
  FolderOpen,
  Image as ImageIcon,
  Upload,
  X,
  Link2,
} from 'lucide-react';

const COVER_PRESETS = [
  {
    name: 'Cybernetic Flow',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=80',
  },
  {
    name: 'Deep Space Nebula',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1400&q=80',
  },
  {
    name: 'Microservices Mesh',
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=80',
  },
  {
    name: 'Neon Matrix',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1400&q=80',
  },
];

interface NoteWorkspaceProps {
  notes: Note[];
  activeNote: Note | null;
  currentUser: User;
  simulatedRole: Role | null;
  onSelectNote: (note: Note) => void;
  onCreateNote: () => void;
  onUpdateNote: (updatedNote: Note) => void;
  onDeleteNote: (noteId: string) => void;
  onSimulateRoleChange: (role: Role | null) => void;
}

export const NoteWorkspace: React.FC<NoteWorkspaceProps> = ({
  notes,
  activeNote,
  currentUser,
  simulatedRole,
  onSelectNote,
  onCreateNote,
  onUpdateNote,
  onDeleteNote,
  onSimulateRoleChange,
}) => {
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isNoteDropdownOpen, setIsNoteDropdownOpen] = useState(false);
  const [isSavedToast, setIsSavedToast] = useState(false);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  const handleCoverFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeNote) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const updated = { ...activeNote, coverImage: reader.result };
          onUpdateNote(updated);
          triggerSaveToast();
          setIsCoverModalOpen(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSetCover = (url: string) => {
    if (!activeNote) return;
    const updated = { ...activeNote, coverImage: url };
    onUpdateNote(updated);
    triggerSaveToast();
    setIsCoverModalOpen(false);
    setCustomCoverUrl('');
  };

  const handleRemoveCover = () => {
    if (!activeNote) return;
    const updated = { ...activeNote, coverImage: undefined };
    onUpdateNote(updated);
    triggerSaveToast();
  };

  // Determine effective role: simulated role takes precedence for QA testing,
  // otherwise look up user's role on the note's collaborators, or fall back to user's global role.
  const getEffectiveRole = (): Role => {
    if (simulatedRole) return simulatedRole;
    if (!activeNote) return currentUser.role;

    const collab = activeNote.collaborators.find((c) => c.userId === currentUser.id);
    return collab ? collab.role : currentUser.role;
  };

  const effectiveRole = getEffectiveRole();
  const isAdmin = effectiveRole === 'ADMIN';
  const canEdit = effectiveRole === 'ADMIN' || effectiveRole === 'EDITOR';

  const triggerSaveToast = () => {
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 2000);
  };

  const handleTitleChange = (newTitle: string) => {
    if (!activeNote || !canEdit) return;
    const updated = { ...activeNote, title: newTitle };
    onUpdateNote(updated);
  };

  const handleBlocksUpdate = (newBlocks: ContentBlock[]) => {
    if (!activeNote || !canEdit) return;
    const updated = { ...activeNote, blocks: newBlocks };
    onUpdateNote(updated);
    triggerSaveToast();
  };

  const handleCollaboratorsUpdate = (collaborators: NoteCollaborator[]) => {
    if (!activeNote || !isAdmin) return;
    const updated = { ...activeNote, collaborators };
    onUpdateNote(updated);
    triggerSaveToast();
  };

  const handleAddComment = (commentText: string) => {
    if (!activeNote) return;
    const newComment = {
      id: `c-${Date.now()}`,
      noteId: activeNote.id,
      authorId: currentUser.id,
      authorName: currentUser.displayName,
      authorAvatarColor: currentUser.avatarColor,
      content: commentText,
      createdAt: new Date().toISOString(),
    };
    const updated = {
      ...activeNote,
      comments: [...(activeNote.comments || []), newComment],
    };
    onUpdateNote(updated);
  };

  const handleDeleteComment = (commentId: string) => {
    if (!activeNote) return;
    const updated = {
      ...activeNote,
      comments: activeNote.comments.filter((c) => c.id !== commentId),
    };
    onUpdateNote(updated);
  };

  if (!activeNote) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-discordLight text-discordMuted p-6">
        <FolderOpen className="w-16 h-16 text-discordBlurple/40 mb-3" />
        <h3 className="text-lg font-bold text-white mb-1">No Active Workspace Note</h3>
        <p className="text-sm max-w-sm text-center mb-4">
          Select an existing note from the collection or create a new collaborative note.
        </p>
        <button
          onClick={onCreateNote}
          className="px-4 py-2 bg-discordBlurple hover:bg-discordBlurple/90 text-white rounded-md text-sm font-semibold flex items-center gap-2 shadow"
        >
          <Plus className="w-4 h-4" /> Create First Note
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-black overflow-hidden">
      {/* Top Header Bar */}
      <header className="h-14 px-4 bg-black border-b border-[#18191c] flex items-center justify-between gap-3 shrink-0 shadow-sm z-10">
        {/* Note Selector & Category */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Note Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNoteDropdownOpen(!isNoteDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#0a0a0c] hover:bg-[#141518] border border-[#1c1d22] text-xs font-semibold text-white transition max-w-[220px]"
            >
              <FileText className="w-3.5 h-3.5 text-discordBlurple shrink-0" />
              <span className="truncate">{activeNote.title}</span>
              <ChevronDown className="w-3.5 h-3.5 text-discordMuted shrink-0 ml-1" />
            </button>

            {isNoteDropdownOpen && (
              <div className="absolute left-0 mt-1 w-64 bg-[#0a0a0c] border border-[#1c1d22] rounded-lg shadow-2xl py-1 z-30 animate-fadeIn">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-discordMuted border-b border-[#1c1d22] mb-1">
                  Workspace Notes ({notes.length})
                </div>
                {notes.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      onSelectNote(n);
                      setIsNoteDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-xs text-left flex items-center justify-between hover:bg-[#141518] transition ${
                      n.id === activeNote.id
                        ? 'bg-[#141518] text-white font-semibold'
                        : 'text-discordText'
                    }`}
                  >
                    <span className="truncate">{n.title}</span>
                    <span className="text-[10px] text-discordMuted shrink-0 ml-2">
                      {n.category}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Create New Note Button (Admin / Editor) */}
          {canEdit && (
            <button
              onClick={onCreateNote}
              title="Create New Note"
              className="p-1.5 rounded bg-[#0a0a0c] hover:bg-[#141518] text-discordMuted hover:text-white border border-[#1c1d22] transition"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}

          {/* Saved indicator */}
          {isSavedToast && (
            <span className="text-[11px] text-discordGreen flex items-center gap-1 font-medium animate-fadeIn">
              <Check className="w-3.5 h-3.5" /> Saved
            </span>
          )}
        </div>

        {/* Right Header Controls (Role Simulator, RBAC badge, Share/Manage, Delete) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* QA Role Simulator Dropdown */}
          <div className="flex items-center gap-1.5 bg-discordDark px-2 py-1 rounded border border-discordHover">
            <span className="text-[10px] uppercase font-bold text-discordMuted flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-discordBlurple" /> Simulate:
            </span>
            <select
              value={simulatedRole || ''}
              onChange={(e) =>
                onSimulateRoleChange(e.target.value ? (e.target.value as Role) : null)
              }
              className="bg-discordMid text-[11px] font-semibold text-white rounded px-1.5 py-0.5 outline-none cursor-pointer border border-discordHover"
              title="Simulate role permissions for quick testing"
            >
              <option value="">Actual ({currentUser.role})</option>
              <option value="ADMIN">ADMIN</option>
              <option value="EDITOR">EDITOR</option>
              <option value="COMMENTER">COMMENTER</option>
              <option value="VIEWER">VIEWER</option>
            </select>
          </div>

          {/* Active Role Badge */}
          <div
            className={`text-xs px-2.5 py-1 rounded font-bold border ${
              effectiveRole === 'ADMIN'
                ? 'bg-discordBlurple/20 text-discordBlurple border-discordBlurple/40'
                : effectiveRole === 'EDITOR'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : effectiveRole === 'COMMENTER'
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-zinc-500/20 text-zinc-400 border-zinc-500/40'
            }`}
          >
            {effectiveRole}
          </div>

          {/* Manage Roles / Share Button (Visible only to ADMIN) */}
          {isAdmin && (
            <button
              onClick={() => setIsRoleModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-discordBlurple hover:bg-discordBlurple/90 text-white text-xs font-semibold transition shadow"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share & Roles</span>
            </button>
          )}

          {/* Delete Note Button (Visible only to ADMIN) */}
          {isAdmin && (
            <button
              onClick={() => onDeleteNote(activeNote.id)}
              title="Delete Note (Admin only)"
              className="p-1.5 rounded bg-discordDark hover:bg-discordRed text-discordMuted hover:text-white border border-discordHover hover:border-discordRed transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Main Note Canvas Body */}
      <main className="flex-1 overflow-y-auto p-6 max-w-4xl w-full mx-auto">
        {/* Hidden Cover File Input */}
        <input
          ref={coverFileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleCoverFileUpload}
        />

        {/* Cover Image Banner (if note has cover) */}
        {activeNote.coverImage ? (
          <div className="relative group/cover mb-6 rounded-2xl overflow-hidden h-52 border border-[#1c1d22] shadow-2xl bg-[#08080a]">
            <img
              src={activeNote.coverImage}
              alt="Note Cover Banner"
              className="w-full h-full object-cover transition-transform duration-500 group-hover/cover:scale-[1.02]"
            />
            {canEdit && (
              <div className="absolute top-3 right-3 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center gap-2 bg-black/85 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10 shadow-xl">
                <button
                  type="button"
                  onClick={() => setIsCoverModalOpen(true)}
                  className="px-2.5 py-1 text-xs font-semibold text-white hover:bg-white/10 rounded flex items-center gap-1.5 transition"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-pink-400" />
                  <span>Change Cover</span>
                </button>
                <button
                  type="button"
                  onClick={() => coverFileInputRef.current?.click()}
                  className="px-2.5 py-1 text-xs font-semibold text-white hover:bg-white/10 rounded flex items-center gap-1.5 transition"
                >
                  <Upload className="w-3.5 h-3.5 text-discordBlurple" />
                  <span>Upload Local</span>
                </button>
                <button
                  type="button"
                  onClick={handleRemoveCover}
                  className="px-2.5 py-1 text-xs font-semibold text-discordRed hover:bg-discordRed/20 rounded flex items-center gap-1.5 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Add Cover Image Button when note has no cover */
          canEdit && (
            <div className="mb-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCoverModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0a0a0c] hover:bg-[#141518] border border-[#1c1d22] text-xs font-medium text-discordMuted hover:text-white transition shadow-sm group/btn"
              >
                <ImageIcon className="w-3.5 h-3.5 text-pink-400 group-hover/btn:scale-110 transition-transform" />
                <span>Add Cover Image</span>
              </button>
              <button
                type="button"
                onClick={() => coverFileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0a0a0c] hover:bg-[#141518] border border-[#1c1d22] text-xs font-medium text-discordMuted hover:text-white transition shadow-sm"
              >
                <Upload className="w-3.5 h-3.5 text-discordBlurple" />
                <span>Upload From Device</span>
              </button>
            </div>
          )
        )}

        {/* Editable Title Header */}
        <div className="mb-6">
          <input
            type="text"
            disabled={!canEdit}
            value={activeNote.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Untitled Note..."
            className={`w-full bg-transparent border-b border-transparent focus:border-discordBlurple/50 text-3xl font-extrabold text-white outline-none transition pb-1 ${
              !canEdit ? 'cursor-default' : ''
            }`}
          />
          <div className="flex items-center gap-3 mt-2 text-xs text-discordMuted">
            <span>Created by <strong className="text-discordText">{activeNote.createdBy}</strong></span>
            <span>&bull;</span>
            <span>Updated {new Date(activeNote.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span>&bull;</span>
            <span className="px-2 py-0.5 rounded bg-[#0a0a0c] text-discordBlurple font-mono text-[10px] border border-[#1c1d22]">
              {activeNote.category}
            </span>
          </div>
        </div>

        {/* Inline Block Editor (CRITICAL: with polymorphic blocks, no separate attachments) */}
        <InlineBlockEditor
          blocks={activeNote.blocks}
          comments={activeNote.comments || []}
          effectiveRole={effectiveRole}
          currentUser={currentUser}
          onUpdateBlocks={handleBlocksUpdate}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
        />
      </main>

      {/* Cover Image Selector Modal */}
      {isCoverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#0d0e11] rounded-xl border border-[#202127] shadow-2xl p-5 text-discordText">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c1d22] mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Add Note Cover Image</h3>
                  <p className="text-[11px] text-discordMuted">Upload from your device, choose a wallpaper, or enter a URL</p>
                </div>
              </div>
              <button
                onClick={() => setIsCoverModalOpen(false)}
                className="text-discordMuted hover:text-white p-1 rounded hover:bg-[#18191c]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Upload from device */}
            <div className="mb-4 p-3 rounded-lg bg-black border border-[#1c1d22] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-discordBlurple" />
                <span className="text-xs font-medium text-white">Upload from Computer</span>
              </div>
              <button
                type="button"
                onClick={() => coverFileInputRef.current?.click()}
                className="px-3 py-1.5 bg-discordBlurple hover:bg-discordBlurple/90 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Choose Image</span>
              </button>
            </div>

            {/* Custom URL Input */}
            <div className="mb-4">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-discordMuted mb-1 flex items-center gap-1">
                <Link2 className="w-3.5 h-3.5" /> Image Link / URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={customCoverUrl}
                  onChange={(e) => setCustomCoverUrl(e.target.value)}
                  className="flex-1 bg-black border border-[#1c1d22] focus:border-discordBlurple rounded px-3 py-1.5 text-xs text-white placeholder-discordMuted/50 outline-none"
                />
                <button
                  type="button"
                  disabled={!customCoverUrl.trim()}
                  onClick={() => handleSetCover(customCoverUrl.trim())}
                  className="px-3 py-1.5 bg-discordBlurple hover:bg-discordBlurple/90 disabled:opacity-40 text-white rounded text-xs font-semibold"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Curated Presets */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-discordMuted mb-2">
                Curated Wallpapers
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {COVER_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleSetCover(preset.url)}
                    className="group relative h-20 rounded-lg overflow-hidden border border-[#1c1d22] hover:border-discordBlurple transition text-left"
                  >
                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-2">
                      <span className="text-[11px] font-medium text-white truncate drop-shadow">{preset.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Manager Modal (Visible to ADMIN) */}
      <RoleManagerModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        collaborators={activeNote.collaborators}
        onUpdateCollaborators={handleCollaboratorsUpdate}
      />
    </div>
  );
};
