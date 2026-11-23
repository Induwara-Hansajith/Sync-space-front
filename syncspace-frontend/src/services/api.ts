import axios from 'axios';
import { Note, ContentBlock, Comment, NoteCollaborator, ChatMessage } from '../types';

const GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: GATEWAY_URL,
  timeout: 4000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Event bus for backend connection status changes
type ConnectionStatusListener = (isLive: boolean) => void;
const connectionListeners: ConnectionStatusListener[] = [];
let isBackendLive = false;

export const onBackendStatusChange = (listener: ConnectionStatusListener) => {
  connectionListeners.push(listener);
  listener(isBackendLive);
  return () => {
    const idx = connectionListeners.indexOf(listener);
    if (idx !== -1) connectionListeners.splice(idx, 1);
  };
};

const setBackendStatus = (live: boolean) => {
  if (isBackendLive !== live) {
    isBackendLive = live;
    connectionListeners.forEach((fn) => fn(live));
  }
};

// ==========================================
// SEED MOCK DATA (PERSISTED IN LOCALSTORAGE)
// ==========================================
const NOTES_STORAGE_KEY = 'syncspace_notes_v3';
const CHAT_STORAGE_KEY = 'syncspace_chat_v3';

const SEED_NOTES: Note[] = [
  {
    id: 'note-1',
    title: 'Microservices Architecture & Gateway Specs',
    category: 'Architecture',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=80',
    createdBy: 'Malithu',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    collaborators: [
      { userId: 'u-1', userEmail: 'malithu@syncspace.dev', displayName: 'Malithu', role: 'ADMIN' },
      { userId: 'u-2', userEmail: 'pulitha@syncspace.dev', displayName: 'Pulitha', role: 'EDITOR' },
      { userId: 'u-3', userEmail: 'hansajith@syncspace.dev', displayName: 'Hansajith', role: 'COMMENTER' },
      { userId: 'u-4', userEmail: 'savinu@syncspace.dev', displayName: 'Savinu', role: 'VIEWER' },
    ],
    blocks: [
      {
        id: 'b-1',
        type: 'HEADING',
        content: 'Sync-Space Platform Architecture Overview',
        metadata: { level: 1 },
      },
      {
        id: 'b-2',
        type: 'PARAGRAPH',
        content: 'Sync-Space is built around an event-driven reactive microservices fabric orchestrated via Spring Cloud Gateway, with decentralized WebSockets and AI services.',
      },
      {
        id: 'b-3',
        type: 'HEADING',
        content: 'Sprint Deliverables & Milestones',
        metadata: { level: 2 },
      },
      {
        id: 'b-4',
        type: 'CHECKLIST',
        content: 'Configure Spring Cloud API Gateway routes (/api/notes, /api/chat, /api/ai)',
        metadata: { checked: true },
      },
      {
        id: 'b-5',
        type: 'CHECKLIST',
        content: 'Implement STOMP over SockJS broker in chat-service for room channels',
        metadata: { checked: true },
      },
      {
        id: 'b-6',
        type: 'CHECKLIST',
        content: 'Integrate Redis pub/sub cluster for horizontal chat scaling',
        metadata: { checked: false },
      },
      {
        id: 'b-7',
        type: 'CODE',
        content: `@Configuration\npublic class GatewayConfig {\n    @Bean\n    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {\n        return builder.routes()\n            .route("notes-service", r -> r.path("/api/notes/**")\n                .uri("lb://NOTES-SERVICE"))\n            .route("chat-service", r -> r.path("/api/chat/**", "/ws-chat/**")\n                .uri("lb://CHAT-SERVICE"))\n            .route("ai-service", r -> r.path("/api/ai/**")\n                .uri("lb://AI-SERVICE"))\n            .build();\n    }\n}`,
        metadata: { language: 'java' },
      },
      {
        id: 'b-8',
        type: 'IMAGE',
        content: 'Architecture Topology',
        metadata: {
          url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
          caption: 'Figure 1: Sync-Space Gateway Routing & Microservices Mesh',
        },
      },
      {
        id: 'b-9',
        type: 'PARAGRAPH',
        content: 'Review the attached specification draft before deploying to the Kubernetes staging cluster. All services must register with Eureka discovery.',
      },
      {
        id: 'b-10',
        type: 'DOCUMENT',
        content: 'Specification Document',
        metadata: {
          fileName: 'syncspace-architecture-v2.1.pdf',
          fileSize: '3.4 MB',
          fileType: 'application/pdf',
          downloadUrl: '#download-pdf',
        },
      },
      {
        id: 'b-11',
        type: 'PARAGRAPH',
        content: 'Security requirements: Ensure all incoming JWT tokens are validated at the Gateway boundary before routing.',
      },
    ],
    comments: [
      {
        id: 'c-1',
        noteId: 'note-1',
        authorId: 'u-2',
        authorName: 'Pulitha',
        authorAvatarColor: '#5865F2',
        content: 'Verified the Gateway CORS filters for localhost:3000. Ready for WebSocket testing!',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'c-2',
        noteId: 'note-1',
        authorId: 'u-3',
        authorName: 'Hansajith',
        authorAvatarColor: '#57F287',
        content: 'Looks solid! Please check if we need rate limiting on the /api/ai endpoints.',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
  },
  {
    id: 'note-2',
    title: 'Discord Dark UI & Theme Design System',
    category: 'Frontend',
    createdBy: 'Pulitha',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 900000).toISOString(),
    collaborators: [
      { userId: 'u-1', userEmail: 'malithu@syncspace.dev', displayName: 'Malithu', role: 'ADMIN' },
      { userId: 'u-2', userEmail: 'pulitha@syncspace.dev', displayName: 'Pulitha', role: 'EDITOR' },
    ],
    blocks: [
      {
        id: 'nb-1',
        type: 'HEADING',
        content: 'Discord-Inspired Dark Color Palette Guidelines',
        metadata: { level: 1 },
      },
      {
        id: 'nb-2',
        type: 'PARAGRAPH',
        content: 'Our UI uses authentic Discord dark tokens for a comfortable, developer-focused collaboration environment with clear visual hierarchy.',
      },
      {
        id: 'nb-3',
        type: 'CODE',
        content: `// tailwind.config.js theme extension\ncolors: {\n  discordDark: '#202225',\n  discordMid: '#2f3136',\n  discordLight: '#36393f',\n  discordHover: '#40444b',\n  discordBlurple: '#5865F2',\n  discordGreen: '#57F287',\n}`,
        metadata: { language: 'typescript' },
      },
      {
        id: 'nb-4',
        type: 'CHECKLIST',
        content: 'Enforce 3-column layout: 20% AI Sidebar, 50% Note Workspace, 30% Team Chat',
        metadata: { checked: true },
      },
      {
        id: 'nb-5',
        type: 'CHECKLIST',
        content: 'Automatic empty paragraph appending when media (Image/Document) is inserted',
        metadata: { checked: true },
      },
      {
        id: 'nb-6',
        type: 'DOCUMENT',
        content: 'Brand Guidelines',
        metadata: {
          fileName: 'syncspace-ui-tokens-v1.json',
          fileSize: '48 KB',
          fileType: 'application/json',
          downloadUrl: '#download-json',
        },
      },
      {
        id: 'nb-7',
        type: 'PARAGRAPH',
        content: 'All modals and dropdowns should feature Discord-styled rounded corners and backdrop blurs.',
      },
    ],
    comments: [],
  },
];

const SEED_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'm-1',
    room: 'general-chat',
    senderId: 'u-1',
    senderName: 'Malithu',
    senderRole: 'ADMIN',
    senderAvatarColor: '#5865F2',
    content: 'Welcome to the #general-chat channel! The microservices backend is running.',
    timestamp: new Date(Date.now() - 15000000).toISOString(),
  },
  {
    id: 'm-2',
    room: 'general-chat',
    senderId: 'u-2',
    senderName: 'Pulitha',
    senderRole: 'EDITOR',
    senderAvatarColor: '#57F287',
    content: 'Loving the inline block editor! Testing image and document insertion now.',
    timestamp: new Date(Date.now() - 9000000).toISOString(),
  },
  {
    id: 'm-3',
    room: 'general-chat',
    senderId: 'bot-1',
    senderName: 'SyncBot AI',
    senderRole: 'ADMIN',
    senderAvatarColor: '#5865F2',
    content: 'Hello team! Mention @ai in any chat message to get instant answers or summaries directly in the room.',
    timestamp: new Date(Date.now() - 6000000).toISOString(),
    isBot: true,
    botBadge: 'BOT',
  },
];

// Helper to get notes from storage
const getStoredNotes = (): Note[] => {
  try {
    const raw = localStorage.getItem(NOTES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(SEED_NOTES));
      return SEED_NOTES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Error reading notes from localStorage:', err);
    return SEED_NOTES;
  }
};

const saveStoredNotes = (notes: Note[]) => {
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch (err) {
    console.warn('Error saving notes to localStorage:', err);
  }
};

const getStoredChat = (room: string): ChatMessage[] => {
  try {
    const raw = localStorage.getItem(`${CHAT_STORAGE_KEY}_${room}`);
    if (!raw) {
      localStorage.setItem(`${CHAT_STORAGE_KEY}_${room}`, JSON.stringify(SEED_CHAT_MESSAGES));
      return SEED_CHAT_MESSAGES;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_CHAT_MESSAGES;
  }
};

const saveStoredChat = (room: string, messages: ChatMessage[]) => {
  try {
    localStorage.setItem(`${CHAT_STORAGE_KEY}_${room}`, JSON.stringify(messages));
  } catch (err) {
    console.warn('Error saving chat to localStorage:', err);
  }
};

// ==========================================
// NOTES API
// ==========================================
export const notesApi = {
  async getNotes(): Promise<Note[]> {
    try {
      const res = await apiClient.get<Note[]>('/api/notes');
      setBackendStatus(true);
      return res.data;
    } catch (err) {
      setBackendStatus(false);
      return getStoredNotes();
    }
  },

  async getNoteById(id: string): Promise<Note> {
    try {
      const res = await apiClient.get<Note>(`/api/notes/${id}`);
      setBackendStatus(true);
      return res.data;
    } catch {
      setBackendStatus(false);
      const notes = getStoredNotes();
      const found = notes.find((n) => n.id === id);
      if (!found) throw new Error(`Note ${id} not found`);
      return found;
    }
  },

  async createNote(noteData: Partial<Note>): Promise<Note> {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: noteData.title || 'Untitled Note',
      category: noteData.category || 'General',
      createdBy: noteData.createdBy || 'Current User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      collaborators: noteData.collaborators || [],
      comments: [],
      blocks: noteData.blocks || [
        {
          id: `b-${Date.now()}`,
          type: 'PARAGRAPH',
          content: 'Start typing here or use the toolbar to add content blocks...',
        },
      ],
    };

    try {
      const res = await apiClient.post<Note>('/api/notes', newNote);
      setBackendStatus(true);
      return res.data;
    } catch {
      setBackendStatus(false);
      const notes = getStoredNotes();
      const updated = [newNote, ...notes];
      saveStoredNotes(updated);
      return newNote;
    }
  },

  async updateNote(id: string, noteData: Partial<Note>): Promise<Note> {
    try {
      const res = await apiClient.put<Note>(`/api/notes/${id}`, noteData);
      setBackendStatus(true);
      return res.data;
    } catch {
      setBackendStatus(false);
      const notes = getStoredNotes();
      const idx = notes.findIndex((n) => n.id === id);
      if (idx === -1) throw new Error(`Note ${id} not found`);

      const updatedNote: Note = {
        ...notes[idx],
        ...noteData,
        updatedAt: new Date().toISOString(),
      };
      notes[idx] = updatedNote;
      saveStoredNotes(notes);
      return updatedNote;
    }
  },

  async deleteNote(id: string): Promise<{ success: boolean }> {
    try {
      await apiClient.delete(`/api/notes/${id}`);
      setBackendStatus(true);
      return { success: true };
    } catch {
      setBackendStatus(false);
      const notes = getStoredNotes();
      const filtered = notes.filter((n) => n.id !== id);
      saveStoredNotes(filtered);
      return { success: true };
    }
  },

  async updateCollaborators(noteId: string, collaborators: NoteCollaborator[]): Promise<NoteCollaborator[]> {
    try {
      const res = await apiClient.put<NoteCollaborator[]>(`/api/notes/${noteId}/collaborators`, { collaborators });
      setBackendStatus(true);
      return res.data;
    } catch {
      setBackendStatus(false);
      const notes = getStoredNotes();
      const note = notes.find((n) => n.id === noteId);
      if (note) {
        note.collaborators = collaborators;
        note.updatedAt = new Date().toISOString();
        saveStoredNotes(notes);
      }
      return collaborators;
    }
  },

  async addComment(noteId: string, commentData: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> {
    const newComment: Comment = {
      ...commentData,
      id: `c-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await apiClient.post<Comment>(`/api/notes/${noteId}/comments`, newComment);
      setBackendStatus(true);
      return res.data;
    } catch {
      setBackendStatus(false);
      const notes = getStoredNotes();
      const note = notes.find((n) => n.id === noteId);
      if (note) {
        note.comments = [...(note.comments || []), newComment];
        saveStoredNotes(notes);
      }
      return newComment;
    }
  },

  async deleteComment(noteId: string, commentId: string): Promise<{ success: boolean }> {
    try {
      await apiClient.delete(`/api/notes/${noteId}/comments/${commentId}`);
      setBackendStatus(true);
      return { success: true };
    } catch {
      setBackendStatus(false);
      const notes = getStoredNotes();
      const note = notes.find((n) => n.id === noteId);
      if (note) {
        note.comments = note.comments.filter((c) => c.id !== commentId);
        saveStoredNotes(notes);
      }
      return { success: true };
    }
  },
};

// ==========================================
// CHAT REST API (FOR RECENT MESSAGES)
// ==========================================
export const chatApi = {
  async getRecentMessages(room: string = 'general-chat'): Promise<ChatMessage[]> {
    try {
      const res = await apiClient.get<ChatMessage[]>(`/api/chat/${room}/messages`);
      setBackendStatus(true);
      return res.data;
    } catch {
      setBackendStatus(false);
      return getStoredChat(room);
    }
  },

  async sendMessage(message: Partial<ChatMessage>): Promise<ChatMessage> {
    const fullMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      room: message.room || 'general-chat',
      senderId: message.senderId || 'anon',
      senderName: message.senderName || 'Anonymous',
      senderRole: message.senderRole || 'VIEWER',
      senderAvatarColor: message.senderAvatarColor || '#5865F2',
      content: message.content || '',
      timestamp: new Date().toISOString(),
      isBot: message.isBot,
      botBadge: message.botBadge,
    };

    try {
      const res = await apiClient.post<ChatMessage>(`/api/chat/${fullMsg.room}/messages`, fullMsg);
      setBackendStatus(true);
      return res.data;
    } catch {
      setBackendStatus(false);
      const existing = getStoredChat(fullMsg.room);
      const updated = [...existing, fullMsg];
      saveStoredChat(fullMsg.room, updated);
      return fullMsg;
    }
  },
};

// ==========================================
// AI ASSISTANT API
// ==========================================
export const aiApi = {
  async summarizeNote(noteId: string, blocks: ContentBlock[]): Promise<{ summary: string; keyPoints: string[] }> {
    try {
      const res = await apiClient.post<{ summary: string; keyPoints: string[] }>('/api/ai/summarize', {
        noteId,
        blocks,
      });
      setBackendStatus(true);
      return res.data;
    } catch {
      setBackendStatus(false);
      // Fallback local intelligence parsing all blocks
      const headings = blocks.filter((b) => b.type === 'HEADING').map((b) => b.content);
      const paragraphs = blocks.filter((b) => b.type === 'PARAGRAPH').map((b) => b.content);
      const checklists = blocks.filter((b) => b.type === 'CHECKLIST').map((b) => b.content);
      const images = blocks.filter((b) => b.type === 'IMAGE');
      const docs = blocks.filter((b) => b.type === 'DOCUMENT');
      const codeBlocks = blocks.filter((b) => b.type === 'CODE');

      const keyPoints: string[] = [];
      if (headings.length > 0) keyPoints.push(`Core focus on: "${headings[0]}"`);
      if (checklists.length > 0) keyPoints.push(`Includes ${checklists.length} task item(s)`);
      if (images.length > 0) keyPoints.push(`Contains visual diagrams/media: ${images[0].metadata?.caption || 'Image attached'}`);
      if (docs.length > 0) keyPoints.push(`Attached specification: ${docs[0].metadata?.fileName || 'Document'}`);
      if (codeBlocks.length > 0) keyPoints.push(`Features code snippets (${codeBlocks[0].metadata?.language || 'code'})`);

      const summaryText = paragraphs.length > 0
        ? paragraphs.slice(0, 2).join(' ')
        : 'The active note defines workspace procedures, architectural components, and deliverables.';

      return {
        summary: `Executive Summary: ${summaryText}`,
        keyPoints,
      };
    }
  },

  async extractTasks(noteId: string, blocks: ContentBlock[]): Promise<{ tasks: Array<{ task: string; priority: 'HIGH' | 'MEDIUM' | 'LOW'; sourceBlockId?: string }> }> {
    try {
      const res = await apiClient.post('/api/ai/tasks', { noteId, blocks });
      setBackendStatus(true);
      return res.data;
    } catch {
      setBackendStatus(false);
      // Local fallback logic extracting tasks from checklist & paragraph items
      const tasks: Array<{ task: string; priority: 'HIGH' | 'MEDIUM' | 'LOW'; sourceBlockId?: string }> = [];

      blocks.forEach((block) => {
        if (block.type === 'CHECKLIST') {
          const isDone = block.metadata?.checked;
          tasks.push({
            task: `${isDone ? '[Completed] ' : '[Pending] '}${block.content}`,
            priority: block.content.toLowerCase().includes('gateway') || block.content.toLowerCase().includes('security') ? 'HIGH' : 'MEDIUM',
            sourceBlockId: block.id,
          });
        } else if (block.type === 'DOCUMENT') {
          tasks.push({
            task: `Review documentation: ${block.metadata?.fileName || 'Attached document'}`,
            priority: 'MEDIUM',
            sourceBlockId: block.id,
          });
        } else if (block.type === 'CODE') {
          tasks.push({
            task: `Verify implementation & write unit tests for ${block.metadata?.language || 'code'} block`,
            priority: 'HIGH',
            sourceBlockId: block.id,
          });
        }
      });

      if (tasks.length === 0) {
        tasks.push({
          task: 'Review note content and establish action items with team members',
          priority: 'LOW',
        });
      }

      return { tasks };
    }
  },

  async askQuestion(question: string, noteContext: { title: string; blocks: ContentBlock[] }): Promise<{ answer: string }> {
    try {
      const res = await apiClient.post<{ answer: string }>('/api/ai/ask', {
        question,
        context: noteContext,
      });
      setBackendStatus(true);
      return res.data;
    } catch {
      setBackendStatus(false);
      const q = question.toLowerCase();
      const title = noteContext.title;
      const blocks = noteContext.blocks;

      // Smart semantic matching based on note blocks
      if (q.includes('task') || q.includes('todo') || q.includes('checklist')) {
        const checklists = blocks.filter((b) => b.type === 'CHECKLIST');
        if (checklists.length > 0) {
          const items = checklists.map((c) => `• ${c.content} (${c.metadata?.checked ? 'Completed' : 'Pending'})`).join('\n');
          return {
            answer: `Here are the active tasks in "${title}":\n\n${items}`,
          };
        }
      }

      if (q.includes('document') || q.includes('pdf') || q.includes('spec') || q.includes('file')) {
        const docs = blocks.filter((b) => b.type === 'DOCUMENT');
        if (docs.length > 0) {
          const file = docs[0].metadata;
          return {
            answer: `The note references the file **${file?.fileName}** (${file?.fileSize || 'Standard file'}), which is linked inline in the document stream.`,
          };
        }
      }

      if (q.includes('architecture') || q.includes('gateway') || q.includes('route')) {
        return {
          answer: `Regarding the architecture in "${title}": The system uses Spring Cloud Gateway with dynamic routes for notes, chat, and AI microservices. Tokens are validated at the perimeter before proxying to downstream services.`,
        };
      }

      // Contextual general reply
      const textSnippets = blocks
        .filter((b) => b.type === 'PARAGRAPH')
        .map((b) => b.content)
        .slice(0, 2)
        .join(' ');

      return {
        answer: `Based on **${title}**: ${textSnippets || 'This note contains workspace collaboration blocks.'} To dive deeper, you can also use "Summarize Active Note" or "Extract Tasks" from the quick actions above.`,
      };
    }
  },
};
