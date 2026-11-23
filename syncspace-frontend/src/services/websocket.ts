import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ChatMessage } from '../types';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws-chat';

export type MessageCallback = (message: ChatMessage) => void;
export type ConnectionStatus = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR';

class WebSocketService {
  private client: Client | null = null;
  private messageCallbacks: Map<string, Set<MessageCallback>> = new Map();
  private statusListeners: Set<(status: ConnectionStatus) => void> = new Set();
  private status: ConnectionStatus = 'DISCONNECTED';
  private currentRoom: string = 'general-chat';
  private isFallbackMode: boolean = false;

  constructor() {
    this.initClient();
  }

  private setStatus(newStatus: ConnectionStatus) {
    this.status = newStatus;
    this.statusListeners.forEach((listener) => listener(newStatus));
  }

  public getStatus(): ConnectionStatus {
    return this.status;
  }

  public onStatusChange(callback: (status: ConnectionStatus) => void) {
    this.statusListeners.add(callback);
    callback(this.status);
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  private initClient() {
    this.setStatus('CONNECTING');

    try {
      this.client = new Client({
        // SockJS factory for Spring WebSocket compatibility
        webSocketFactory: () => new SockJS(WS_URL),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        debug: (str) => {
          // Keep internal logs quiet in production, but available for debugging
          if (import.meta.env.DEV && false) {
            console.log('[STOMP]:', str);
          }
        },
      });

      this.client.onConnect = () => {
        this.isFallbackMode = false;
        this.setStatus('CONNECTED');
        this.subscribeToRoom(this.currentRoom);
      };

      this.client.onStompError = (frame) => {
        console.warn('[STOMP Error]', frame.headers['message']);
        this.enableFallbackMode();
      };

      this.client.onWebSocketClose = () => {
        if (!this.isFallbackMode) {
          this.enableFallbackMode();
        }
      };

      this.client.onWebSocketError = () => {
        this.enableFallbackMode();
      };

      this.client.activate();
    } catch (err) {
      console.warn('Failed to initialize STOMP client, using fallback mode:', err);
      this.enableFallbackMode();
    }
  }

  private enableFallbackMode() {
    this.isFallbackMode = true;
    this.setStatus('DISCONNECTED');
  }

  public subscribe(room: string, callback: MessageCallback): () => void {
    this.currentRoom = room;

    if (!this.messageCallbacks.has(room)) {
      this.messageCallbacks.set(room, new Set());
    }
    this.messageCallbacks.get(room)!.add(callback);

    if (this.client && this.client.connected) {
      this.subscribeToRoom(room);
    }

    return () => {
      const callbacks = this.messageCallbacks.get(room);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  private subscribeToRoom(room: string) {
    if (!this.client || !this.client.connected) return;

    this.client.subscribe(`/topic/chat/${room}`, (stompMessage: IMessage) => {
      try {
        const payload: ChatMessage = JSON.parse(stompMessage.body);
        this.dispatchMessage(room, payload);
      } catch (e) {
        console.error('Failed to parse incoming STOMP message:', e);
      }
    });
  }

  private dispatchMessage(room: string, message: ChatMessage) {
    const callbacks = this.messageCallbacks.get(room);
    if (callbacks) {
      callbacks.forEach((cb) => cb(message));
    }
  }

  public sendMessage(room: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): void {
    const fullMessage: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };

    // If connected via real STOMP broker, publish to /app/chat/{room}
    if (this.client && this.client.connected) {
      this.client.publish({
        destination: `/app/chat/${room}`,
        body: JSON.stringify(fullMessage),
      });
      // Also notify local listeners optimistically
      this.dispatchMessage(room, fullMessage);
    } else {
      // Local fallback mode: dispatch to local listeners
      this.dispatchMessage(room, fullMessage);
    }

    // Detect @ai bot mentions: trigger public bot response in the room
    this.handleAiBotMention(room, fullMessage);
  }

  private handleAiBotMention(room: string, userMessage: ChatMessage) {
    const content = userMessage.content.trim();
    if (content.toLowerCase().includes('@ai')) {
      const question = content.replace(/@ai/gi, '').trim();

      // Simulate real-time bot response after short natural delay
      setTimeout(() => {
        let botReply = '';
        const qLower = question.toLowerCase();

        if (qLower.includes('status') || qLower.includes('health')) {
          botReply = 'All microservices are functioning smoothly! Gateway, Notes-Service, and Chat-Service are reporting healthy.';
        } else if (qLower.includes('summarize') || qLower.includes('note')) {
          botReply = 'You can run a full private summary of the active note using the "Summarize Active Note" button on the left AI panel.';
        } else if (qLower.includes('deploy') || qLower.includes('docker')) {
          botReply = 'Docker Compose is configured for multi-stage build on port 3000 with Nginx serving static assets and proxying /api and /ws-chat.';
        } else if (!question) {
          botReply = 'Yes? I am here! Ask me anything about your notes, architecture, or project tasks.';
        } else {
          botReply = `I received your question: "${question}". I am monitoring team activity and syncing changes across the workspace.`;
        }

        const botMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          room,
          senderId: 'syncspace-bot',
          senderName: 'SyncBot AI',
          senderRole: 'ADMIN',
          senderAvatarColor: '#5865F2',
          content: botReply,
          timestamp: new Date().toISOString(),
          isBot: true,
          botBadge: 'BOT',
        };

        this.dispatchMessage(room, botMessage);
      }, 700);
    }
  }

  public disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
    this.setStatus('DISCONNECTED');
  }
}

export const webSocketService = new WebSocketService();
