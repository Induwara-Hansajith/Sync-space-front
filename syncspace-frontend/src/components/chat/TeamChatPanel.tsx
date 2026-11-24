import React, { useState, useEffect, useRef } from 'react';
import { User, ChatMessage } from '../../types';
import { webSocketService, ConnectionStatus } from '../../services/websocket';
import { chatApi, onBackendStatusChange } from '../../services/api';
import {
  Hash,
  Send,
  Sparkles,
  Wifi,
  WifiOff,
} from 'lucide-react';

interface TeamChatPanelProps {
  currentUser: User;
}

const CHANNELS = [
  { id: 'general-chat', name: 'general-chat', desc: 'Main team collaboration & announcements' },
  { id: 'dev-team', name: 'dev-team', desc: 'Microservices & PR reviews' },
  { id: 'architecture', name: 'architecture', desc: 'Gateway routes and data models' },
];

export const TeamChatPanel: React.FC<TeamChatPanelProps> = ({ currentUser }) => {
  const [currentChannel, setCurrentChannel] = useState('general-chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [wsStatus, setWsStatus] = useState<ConnectionStatus>('DISCONNECTED');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Monitor connection statuses
  useEffect(() => {
    const unsubWs = webSocketService.onStatusChange(setWsStatus);
    const unsubApi = onBackendStatusChange(() => {});

    return () => {
      unsubWs();
      unsubApi();
    };
  }, []);

  // Subscribe to channel messages via STOMP and load history
  useEffect(() => {
    // Load historical messages from API or local fallback
    chatApi.getRecentMessages(currentChannel).then((initial) => {
      setMessages(initial);
    });

    // Subscribe to STOMP topic (/topic/chat/{room})
    const unsubscribe = webSocketService.subscribe(currentChannel, (newMsg: ChatMessage) => {
      setMessages((prev) => {
        // Prevent duplicate IDs
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    });

    return () => {
      unsubscribe();
    };
  }, [currentChannel]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const content = inputMessage.trim();
    setInputMessage('');

    webSocketService.sendMessage(currentChannel, {
      room: currentChannel,
      senderId: currentUser.id,
      senderName: currentUser.displayName,
      senderRole: currentUser.role,
      senderAvatarColor: currentUser.avatarColor,
      content,
    });
  };

  // Quick action: insert @ai mention
  const handleInsertAiMention = () => {
    if (!inputMessage.startsWith('@ai ')) {
      setInputMessage(`@ai ${inputMessage}`);
    }
    inputRef.current?.focus();
  };

  return (
    <aside className="w-full h-full flex flex-col bg-black border-l border-[#18191c] select-none">
      {/* Top Channel Header */}
      <div className="h-14 px-4 bg-black border-b border-[#18191c] flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-2 min-w-0">
          <Hash className="w-5 h-5 text-discordMuted shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <select
                value={currentChannel}
                onChange={(e) => setCurrentChannel(e.target.value)}
                className="bg-transparent text-sm font-bold text-white outline-none cursor-pointer hover:underline"
              >
                {CHANNELS.map((ch) => (
                  <option key={ch.id} value={ch.id} className="bg-discordDark text-white">
                    {ch.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-[10px] text-discordMuted truncate">
              {CHANNELS.find((c) => c.id === currentChannel)?.desc}
            </div>
          </div>
        </div>

        {/* Live WebSocket Connection Status Badge */}
        <div className="flex items-center gap-1.5 shrink-0">
          {wsStatus === 'CONNECTED' ? (
            <div
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-discordGreen/15 border border-discordGreen/30 text-[10px] text-discordGreen font-mono"
              title="Connected to Chat-Service STOMP Broker via Gateway"
            >
              <Wifi className="w-3 h-3 text-discordGreen animate-pulse" />
              <span>STOMP Live</span>
            </div>
          ) : (
            <div
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-discordBlurple/15 border border-discordBlurple/30 text-[10px] text-discordBlurple font-mono"
              title="Local Real-Time Fallback Mode (Simulated Sync & @ai Bot active)"
            >
              <WifiOff className="w-3 h-3 text-discordBlurple" />
              <span>Local Sync</span>
            </div>
          )}
        </div>
      </div>

      {/* Real-Time Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 select-text">
        {messages.map((msg, index) => {
          const isAiBot = msg.isBot || msg.senderId.includes('bot');
          const isCurrentUser = msg.senderId === currentUser.id;

          // Render styled AI Bot Bubble
          if (isAiBot) {
            return (
              <div
                key={msg.id || index}
                className="rounded-lg p-3.5 bg-discordDark/90 border border-discordBlurple/40 shadow-md animate-fadeIn"
              >
                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-discordHover/50">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg overflow-hidden border border-discordBlurple/50 shadow flex items-center justify-center">
                      <img src="/logo.jpg" alt="SyncBot Logo" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{msg.senderName}</span>
                      <span className="bg-discordBlurple text-[9px] font-bold text-white px-1.5 py-0.2 rounded font-mono uppercase tracking-wider">
                        {msg.botBadge || 'BOT'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-discordMuted">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="text-xs text-discordText pl-1 leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </div>
              </div>
            );
          }

          // Regular User Chat Message
          return (
            <div
              key={msg.id || index}
              className={`flex items-start gap-3 group transition ${
                isCurrentUser ? 'opacity-100' : 'opacity-95'
              }`}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 shadow mt-0.5 overflow-hidden"
                style={{ backgroundColor: isCurrentUser && currentUser.avatarUrl ? undefined : (msg.senderAvatarColor || '#5865F2') }}
              >
                {isCurrentUser && currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt={currentUser.displayName} className="w-full h-full object-cover" />
                ) : (
                  msg.senderName ? msg.senderName[0].toUpperCase() : 'U'
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white hover:underline cursor-pointer">
                    {msg.senderName}
                  </span>
                  <span className="text-[10px] font-mono px-1 rounded bg-discordDark text-discordMuted">
                    {msg.senderRole}
                  </span>
                  <span className="text-[10px] text-discordMuted">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="text-xs text-discordText mt-1 leading-relaxed whitespace-pre-wrap break-words">
                  {/* Highlight @ai mentions */}
                  {msg.content.includes('@ai') ? (
                    <span>
                      {msg.content.split(/(@ai)/gi).map((part, i) =>
                        part.toLowerCase() === '@ai' ? (
                          <span
                            key={i}
                            className="bg-discordBlurple/30 text-discordBlurple font-semibold px-1 py-0.5 rounded"
                          >
                            @ai
                          </span>
                        ) : (
                          part
                        )
                      )}
                    </span>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <div className="p-3 border-t border-[#18191c] bg-black shrink-0">
        <form onSubmit={handleSendMessage} className="space-y-2">
          <div className="relative flex items-center bg-[#0a0a0c] border border-[#1c1d22] focus-within:border-discordBlurple rounded-lg">
            <button
              type="button"
              onClick={handleInsertAiMention}
              title="Mention @ai to ask room bot"
              className="pl-3 pr-2 py-2 text-discordMuted hover:text-discordBlurple transition flex items-center gap-1 text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-discordBlurple" />
              <span className="text-[10px] font-bold text-discordBlurple">@ai</span>
            </button>

            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Message #${currentChannel}... (Use @ai to ask bot)`}
              className="flex-1 bg-transparent py-2.5 text-xs text-white placeholder-discordMuted/50 outline-none"
            />

            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="px-3 py-2 text-discordMuted hover:text-discordBlurple disabled:opacity-30 transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] text-discordMuted px-1">
            <span>Tip: Type <strong className="text-discordBlurple">@ai &lt;question&gt;</strong> for instant team-visible bot answers</span>
            <span>Room: #{currentChannel}</span>
          </div>
        </form>
      </div>
    </aside>
  );
};
