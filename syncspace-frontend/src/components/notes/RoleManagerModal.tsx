import React, { useState } from 'react';
import { NoteCollaborator, Role, ROLE_DEFINITIONS } from '../../types';
import { X, Shield, UserPlus, Trash2, Check, Users } from 'lucide-react';

interface RoleManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  collaborators: NoteCollaborator[];
  onUpdateCollaborators: (updated: NoteCollaborator[]) => void;
}

export const RoleManagerModal: React.FC<RoleManagerModalProps> = ({
  isOpen,
  onClose,
  collaborators,
  onUpdateCollaborators,
}) => {
  const [items, setItems] = useState<NoteCollaborator[]>(collaborators);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<Role>('EDITOR');

  if (!isOpen) return null;

  const handleRoleChange = (userId: string, role: Role) => {
    const updated = items.map((collab) =>
      collab.userId === userId ? { ...collab, role } : collab
    );
    setItems(updated);
  };

  const handleRemove = (userId: string) => {
    const updated = items.filter((collab) => collab.userId !== userId);
    setItems(updated);
  };

  const handleAddCollaborator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    const newCollab: NoteCollaborator = {
      userId: `user-${Date.now()}`,
      userEmail: newEmail.trim(),
      displayName: newName.trim() || newEmail.split('@')[0],
      role: newRole,
    };

    const updated = [...items, newCollab];
    setItems(updated);
    setNewEmail('');
    setNewName('');
  };

  const handleSave = () => {
    onUpdateCollaborators(items);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-discordMid rounded-lg shadow-2xl border border-discordHover overflow-hidden text-discordText">
        {/* Header */}
        <div className="p-4 bg-discordDark border-b border-discordHover flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-discordBlurple/20 text-discordBlurple flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Note Access & Role Manager
              </h3>
              <p className="text-[11px] text-discordMuted">
                Configure role-based access control (RBAC) permissions for this note
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-discordMuted hover:text-white p-1 rounded hover:bg-discordHover transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Add collaborator form */}
          <form
            onSubmit={handleAddCollaborator}
            className="p-3 bg-discordDark/70 rounded-md border border-discordHover/70 space-y-2.5"
          >
            <div className="text-xs font-bold uppercase tracking-wider text-discordMuted flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5 text-discordBlurple" /> Add New Collaborator
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="email"
                required
                placeholder="colleague@syncspace.dev"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="bg-discordMid border border-discordHover focus:border-discordBlurple rounded px-2.5 py-1.5 text-xs text-white outline-none"
              />
              <input
                type="text"
                placeholder="Display Name (optional)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="bg-discordMid border border-discordHover focus:border-discordBlurple rounded px-2.5 py-1.5 text-xs text-white outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as Role)}
                className="flex-1 bg-discordMid border border-discordHover focus:border-discordBlurple rounded px-2.5 py-1.5 text-xs text-white outline-none cursor-pointer"
              >
                <option value="ADMIN">ADMIN — Full management & delete</option>
                <option value="EDITOR">EDITOR — Full block editing & media</option>
                <option value="COMMENTER">COMMENTER — Read-only blocks + comments</option>
                <option value="VIEWER">VIEWER — Strictly read-only viewer</option>
              </select>
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-medium rounded bg-discordBlurple hover:bg-discordBlurple/90 text-white transition flex items-center gap-1 shadow shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </form>

          {/* Collaborator List */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-discordMuted mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Collaborators ({items.length})
              </span>
            </div>

            <div className="space-y-2">
              {items.map((collab) => {
                const roleDef = ROLE_DEFINITIONS[collab.role];
                return (
                  <div
                    key={collab.userId}
                    className="flex items-center justify-between p-2.5 rounded bg-discordDark border border-discordHover/60"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-discordBlurple/30 text-discordBlurple flex items-center justify-center font-bold text-xs shrink-0">
                        {collab.displayName[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white truncate">
                          {collab.displayName}
                        </div>
                        <div className="text-[10px] text-discordMuted truncate">
                          {collab.userEmail}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={collab.role}
                        onChange={(e) => handleRoleChange(collab.userId, e.target.value as Role)}
                        className={`text-xs px-2 py-1 rounded border outline-none cursor-pointer bg-discordMid ${roleDef.badgeClass}`}
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="EDITOR">EDITOR</option>
                        <option value="COMMENTER">COMMENTER</option>
                        <option value="VIEWER">VIEWER</option>
                      </select>

                      <button
                        onClick={() => handleRemove(collab.userId)}
                        title="Remove Collaborator"
                        className="p-1 rounded text-discordMuted hover:text-discordRed hover:bg-discordMid transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-discordDark border-t border-discordHover flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-discordText hover:underline"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 text-xs font-semibold rounded bg-discordBlurple hover:bg-discordBlurple/90 text-white transition flex items-center gap-1.5 shadow"
          >
            <Check className="w-3.5 h-3.5" /> Save Permissions
          </button>
        </div>
      </div>
    </div>
  );
};
