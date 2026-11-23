export type Role = 'ADMIN' | 'EDITOR' | 'COMMENTER' | 'VIEWER';

export type UserStatus = 'ONLINE' | 'IDLE' | 'DND' | 'OFFLINE';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  status: UserStatus;
  avatarColor: string;
  avatarUrl?: string;
  bannerUrl?: string;
  bio?: string;
}

export type BlockType = 'HEADING' | 'PARAGRAPH' | 'CHECKLIST' | 'CODE' | 'IMAGE' | 'DOCUMENT';

export interface BlockMetadata {
  level?: 1 | 2 | 3;
  checked?: boolean;
  language?: string;
  url?: string;
  caption?: string;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  downloadUrl?: string;
}

export interface ContentBlock {
  id: string;
  type: BlockType;
  content: string;
  metadata?: BlockMetadata;
}

export interface Comment {
  id: string;
  noteId: string;
  authorId: string;
  authorName: string;
  authorAvatarColor: string;
  content: string;
  createdAt: string;
}

export interface NoteCollaborator {
  userId: string;
  userEmail: string;
  displayName: string;
  role: Role;
}

export interface Note {
  id: string;
  title: string;
  category: string;
  coverImage?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  blocks: ContentBlock[];
  comments: Comment[];
  collaborators: NoteCollaborator[];
}

export interface ChatMessage {
  id: string;
  room: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  senderAvatarColor: string;
  content: string;
  timestamp: string;
  isBot?: boolean;
  botBadge?: string;
}

export interface AiMessage {
  id: string;
  sender: 'USER' | 'AI';
  content: string;
  timestamp: string;
  isActionOutput?: boolean;
  actionType?: 'SUMMARIZE' | 'TASKS' | 'ASK';
}

export interface RolePermissions {
  canEdit: boolean;
  canDelete: boolean;
  canManageRoles: boolean;
  canComment: boolean;
  label: string;
  description: string;
  badgeClass: string;
}

export const ROLE_DEFINITIONS: Record<Role, RolePermissions> = {
  ADMIN: {
    canEdit: true,
    canDelete: true,
    canManageRoles: true,
    canComment: true,
    label: 'Admin',
    description: 'Full edit, delete, manage collaborator roles & comment',
    badgeClass: 'bg-discordBlurple/20 text-discordBlurple border-discordBlurple/40',
  },
  EDITOR: {
    canEdit: true,
    canDelete: false,
    canManageRoles: false,
    canComment: true,
    label: 'Editor',
    description: 'Full block editing, media insertion & comment',
    badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  },
  COMMENTER: {
    canEdit: false,
    canDelete: false,
    canManageRoles: false,
    canComment: true,
    label: 'Commenter',
    description: 'Read-only blocks, post & view comments',
    badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  },
  VIEWER: {
    canEdit: false,
    canDelete: false,
    canManageRoles: false,
    canComment: false,
    label: 'Viewer',
    description: 'Strictly read-only blocks, commenting disabled',
    badgeClass: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/40',
  },
};
