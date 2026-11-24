import React, { useState, useRef, useEffect } from 'react';
import { User, Note, AiMessage } from '../../types';
import { aiApi } from '../../services/api';
import {
  Sparkles,
  ListTodo,
  FileText,
  Send,
  Trash2,
  Copy,
  Check,
  Settings,
  LogOut,
  Bot,
  Loader2,
} from 'lucide-react';

interface AiSidebarProps {
  user: User;
  activeNote: Note | null;
  onOpenProfile: () => void;
  onLogout: () => void;
}

export const AiSidebar: React.FC<AiSidebarProps> = ({
  user,
  activeNote,
  onOpenProfile,
  onLogout,
}) => {
  const [messages, setMessages] = useState<AiMessage[]>([
    {
      id: 'ai-welcome',
      sender: 'AI',
      content: `Hello ${user.displayName}! I am your private AI assistant. Ask questions about "${activeNote?.title || 'your workspace'}", summarize content, or extract actionable tasks. Everything here is strictly private to you.`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<'SUMMARIZE' | 'TASKS' | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle Quick Action: Summarize Active Note
  const handleSummarize = async () => {
    if (!activeNote) return;
    setIsLoading(true);
    setActiveAction('SUMMARIZE');

    try {
      const result = await aiApi.summarizeNote(activeNote.id, activeNote.blocks);
      const points = result.keyPoints.map((p) => `• ${p}`).join('\n');
      const responseContent = `### 📋 Summary for "${activeNote.title}"\n\n${result.summary}\n\n**Key Takeaways:**\n${points}`;

      const aiMsg: AiMessage = {
        id: `ai-${Date.now()}`,
        sender: 'AI',
        content: responseContent,
        timestamp: new Date().toISOString(),
        isActionOutput: true,
        actionType: 'SUMMARIZE',
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Error summarizing note:', err);
    } finally {
      setIsLoading(false);
      setActiveAction(null);
    }
  };

  // Handle Quick Action: Extract Tasks
  const handleExtractTasks = async () => {
    if (!activeNote) return;
    setIsLoading(true);
    setActiveAction('TASKS');

    try {
      const result = await aiApi.extractTasks(activeNote.id, activeNote.blocks);
      const taskList = result.tasks
        .map((t, idx) => `${idx + 1}. **[${t.priority}]** ${t.task}`)
        .join('\n');
      const responseContent = `### ✅ Actionable Tasks Extracted from "${activeNote.title}"\n\n${taskList}\n\n*Identified from checklists, documentation blocks, and architecture requirements.*`;

      const aiMsg: AiMessage = {
        id: `ai-${Date.now()}`,
        sender: 'AI',
        content: responseContent,
        timestamp: new Date().toISOString(),
        isActionOutput: true,
        actionType: 'TASKS',
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Error extracting tasks:', err);
    } finally {
      setIsLoading(false);
      setActiveAction(null);
    }
  };

  // Handle Asking Private Question
  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuestion.trim() || isLoading) return;

    const question = inputQuestion.trim();
    setInputQuestion('');

    // Add user question
    const userMsg: AiMessage = {
      id: `u-${Date.now()}`,
      sender: 'USER',
      content: question,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const result = await aiApi.askQuestion(question, {
        title: activeNote?.title || 'Workspace Note',
        blocks: activeNote?.blocks || [],
      });

      const aiMsg: AiMessage = {
        id: `ai-${Date.now()}`,
        sender: 'AI',
        content: result.answer,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Error asking AI question:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: `ai-${Date.now()}`,
        sender: 'AI',
        content: 'Chat cleared. Ask me any question about your active note!',
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const getStatusColor = (st: User['status']) => {
    switch (st) {
      case 'ONLINE':
        return 'bg-discordGreen';
      case 'IDLE':
        return 'bg-discordYellow';
      case 'DND':
        return 'bg-discordRed';
      default:
        return 'bg-discordMuted';
    }
  };

  return (
    <aside className="w-full h-full flex flex-col bg-black border-r border-[#18191c] select-none">
      {/* Top Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-[#18191c] shadow-sm shrink-0 bg-black">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg overflow-hidden border border-discordHover/70 shadow-sm shrink-0">
            <img src="/logo.jpg" alt="Sync-Space Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">Private AI Assistant</h2>
            <div className="text-[10px] text-discordMuted flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-discordGreen animate-pulse" />
              Isolated & Confidential
            </div>
          </div>
        </div>

        <button
          onClick={clearChat}
          title="Clear AI Conversation"
          className="text-discordMuted hover:text-white p-1 rounded hover:bg-discordHover transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Active Note Context Banner */}
      <div className="px-3.5 py-2 bg-[#08080a] border-b border-[#18191c] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <FileText className="w-3.5 h-3.5 text-discordBlurple shrink-0" />
          <span className="text-[11px] text-discordMuted truncate">
            Context: <span className="text-discordText font-medium">{activeNote?.title || 'No note selected'}</span>
          </span>
        </div>
        <span className="text-[10px] bg-discordHover px-1.5 py-0.5 rounded text-discordMuted shrink-0">
          {activeNote?.blocks.length || 0} blocks
        </span>
      </div>

      {/* Quick Action Buttons */}
      <div className="p-3 grid grid-cols-2 gap-2 border-b border-[#18191c] shrink-0 bg-black">
        <button
          onClick={handleSummarize}
          disabled={!activeNote || isLoading}
          className="flex flex-col items-start p-2.5 rounded bg-discordDark hover:bg-discordHover border border-discordHover/70 hover:border-discordBlurple/40 transition text-left group disabled:opacity-50"
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-white group-hover:text-discordBlurple transition">
            {activeAction === 'SUMMARIZE' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-discordBlurple" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-discordBlurple" />
            )}
            <span>Summarize</span>
          </div>
          <span className="text-[10px] text-discordMuted mt-0.5">Active note blocks</span>
        </button>

        <button
          onClick={handleExtractTasks}
          disabled={!activeNote || isLoading}
          className="flex flex-col items-start p-2.5 rounded bg-discordDark hover:bg-discordHover border border-discordHover/70 hover:border-emerald-500/40 transition text-left group disabled:opacity-50"
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-white group-hover:text-emerald-400 transition">
            {activeAction === 'TASKS' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            ) : (
              <ListTodo className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>Extract Tasks</span>
          </div>
          <span className="text-[10px] text-discordMuted mt-0.5">Generate checklist</span>
        </button>
      </div>

      {/* Private Chat Message Stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 select-text">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`rounded-lg p-3 text-xs leading-relaxed transition ${
              msg.sender === 'USER'
                ? 'bg-discordBlurple/20 border border-discordBlurple/30 ml-4 text-white'
                : 'bg-discordDark/90 border border-discordHover mr-1 text-discordText'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-discordHover/40">
              <div className="flex items-center gap-1.5">
                {msg.sender === 'AI' ? (
                  <div className="flex items-center gap-1 font-bold text-discordBlurple">
                    <Bot className="w-3.5 h-3.5" />
                    <span>Sync AI</span>
                    <span className="bg-discordBlurple text-[9px] text-white px-1 py-0.2 rounded font-mono">
                      BOT
                    </span>
                  </div>
                ) : (
                  <span className="font-bold text-white">{user.displayName}</span>
                )}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-discordMuted">
                <span>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {msg.sender === 'AI' && (
                  <button
                    onClick={() => handleCopy(msg.id, msg.content)}
                    className="p-1 hover:text-white rounded hover:bg-discordHover transition ml-1"
                    title="Copy AI Response"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3 h-3 text-discordGreen" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="whitespace-pre-wrap font-sans space-y-1">
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && !activeAction && (
          <div className="bg-discordDark/80 rounded-lg p-3 border border-discordHover flex items-center gap-2 text-xs text-discordMuted">
            <Loader2 className="w-4 h-4 animate-spin text-discordBlurple" />
            <span>Analyzing active note blocks...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form for Private Questions */}
      <div className="p-3 border-t border-[#18191c] bg-black shrink-0">
        <form onSubmit={handleAskQuestion} className="relative">
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            disabled={isLoading}
            placeholder={`Ask about "${activeNote?.title ? activeNote.title.slice(0, 16) + '...' : 'active note'}"...`}
            className="w-full bg-[#08080a] border border-[#18191c] focus:border-discordBlurple rounded-md pl-3 pr-9 py-2 text-xs text-white placeholder-discordMuted/60 outline-none"
          />
          <button
            type="submit"
            disabled={!inputQuestion.trim() || isLoading}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded text-discordMuted hover:text-discordBlurple disabled:opacity-40 transition"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
        <div className="mt-1 text-[10px] text-discordMuted text-right">
          Press <kbd className="bg-[#121316] px-1 rounded text-zinc-400">Enter</kbd> to submit
        </div>
      </div>

      {/* Docked Bottom User Profile Bar */}
      <div className="h-14 px-3 bg-black border-t border-[#18191c] flex items-center justify-between shrink-0">
        <div
          onClick={onOpenProfile}
          className="flex items-center gap-2.5 min-w-0 p-1 -ml-1 rounded hover:bg-discordMid/70 cursor-pointer transition flex-1"
          title="Click to edit profile"
        >
          <div className="relative shrink-0">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow overflow-hidden"
              style={{ backgroundColor: user.avatarUrl ? undefined : user.avatarColor }}
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
              ) : (
                user.displayName ? user.displayName[0].toUpperCase() : 'U'
              )}
            </div>
            <div
              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-black ${getStatusColor(
                user.status
              )}`}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-white truncate hover:underline">
              {user.displayName}
            </div>
            <div className="text-[10px] text-discordMuted truncate flex items-center gap-1">
              <span className="font-mono text-discordBlurple">{user.role}</span>
              <span>&bull;</span>
              <span className="capitalize">{user.status.toLowerCase()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onOpenProfile}
            title="User Settings & Role"
            className="p-1.5 rounded text-discordMuted hover:text-white hover:bg-discordMid transition"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={onLogout}
            title="Log Out"
            className="p-1.5 rounded text-discordMuted hover:text-discordRed hover:bg-discordMid transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
