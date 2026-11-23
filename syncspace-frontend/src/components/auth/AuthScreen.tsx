import React, { useState } from 'react';
import { User, Role } from '../../types';
import { Shield, UserCheck, ArrowRight, Lock, Mail, User as UserIcon } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<Role>('ADMIN');

  // Quick Demo Accounts for fast 1-click testing
  const demoUsers: User[] = [
    {
      id: 'demo-admin',
      email: 'malithu@syncspace.dev',
      displayName: 'Malithu',
      role: 'ADMIN',
      status: 'ONLINE',
      avatarColor: '#5865F2',
      bio: 'Lead System Architect & Core Admin',
    },
    {
      id: 'demo-editor',
      email: 'pulitha@syncspace.dev',
      displayName: 'Pulitha',
      role: 'EDITOR',
      status: 'ONLINE',
      avatarColor: '#57F287',
      bio: 'Senior Fullstack Engineer & Technical Writer',
    },
    {
      id: 'demo-commenter',
      email: 'hansajith@syncspace.dev',
      displayName: 'Hansajith',
      role: 'COMMENTER',
      status: 'IDLE',
      avatarColor: '#FEE75C',
      bio: 'Product Manager & QA Reviewer',
    },
    {
      id: 'demo-viewer',
      email: 'savinu@syncspace.dev',
      displayName: 'Savinu',
      role: 'VIEWER',
      status: 'DND',
      avatarColor: '#949ba4',
      bio: 'Guest Observer / Client Stakeholder',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const user: User = {
      id: `user-${Date.now()}`,
      email,
      displayName: displayName || email.split('@')[0],
      role,
      status: 'ONLINE',
      avatarColor: '#5865F2',
      bio: isRegister ? 'New Sync-Space member' : 'Sync-Space collaborator',
    };
    onLogin(user);
  };

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center p-4 selection:bg-discordBlurple selection:text-white relative overflow-hidden">
      {/* Pure Black Backside Atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-discordBlurple/10 rounded-full blur-[160px]" />
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-purple-900/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-cyan-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md bg-[#0f1012] rounded-xl shadow-2xl border border-[#202226] p-8 text-discordText">
        {/* Sync-Space Header Logo & Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl overflow-hidden mb-3 shadow-2xl shadow-black border border-white/10 bg-black p-0.5">
            <img src="/logo.jpg" alt="Sync-Space Logo" className="w-full h-full object-cover rounded-[14px]" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome to Sync-Space</h1>
        </div>

        {/* Quick Demo Login Cards */}
        <div className="mb-6 p-3.5 bg-discordDark/70 rounded-md border border-discordHover">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-discordMuted flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-discordBlurple" /> Quick Demo Login (Instant Test)
            </span>
            <span className="text-[10px] bg-discordBlurple/20 text-discordBlurple px-1.5 py-0.5 rounded font-mono">
              1-Click
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {demoUsers.map((demo) => (
              <button
                key={demo.id}
                type="button"
                onClick={() => onLogin(demo)}
                className="flex items-center gap-2 p-2 rounded bg-discordMid hover:bg-discordHover border border-discordHover/60 hover:border-discordBlurple/50 transition-all text-left group"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow"
                  style={{ backgroundColor: demo.avatarColor }}
                >
                  {demo.displayName[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-white truncate group-hover:text-discordBlurple transition-colors">
                    {demo.displayName.split(' ')[0]}
                  </div>
                  <div className="text-[10px] text-discordMuted truncate">
                    {demo.role}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Login / Register Toggle Tabs */}
        <div className="flex rounded-md bg-discordDark p-1 mb-5 border border-discordHover/50">
          <button
            type="button"
            onClick={() => setIsRegister(false)}
            className={`flex-1 py-1.5 text-xs font-medium rounded transition-all ${
              !isRegister
                ? 'bg-discordMid text-white shadow-sm'
                : 'text-discordMuted hover:text-discordText'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsRegister(true)}
            className={`flex-1 py-1.5 text-xs font-medium rounded transition-all ${
              isRegister
                ? 'bg-discordMid text-white shadow-sm'
                : 'text-discordMuted hover:text-discordText'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-discordMuted mb-1.5">
              Email Address <span className="text-discordRed">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-discordMuted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@syncspace.dev"
                className="w-full bg-discordDark border border-discordHover focus:border-discordBlurple focus:ring-1 focus:ring-discordBlurple rounded px-9 py-2 text-sm text-white placeholder-discordMuted/60 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-discordMuted mb-1.5">
              Password <span className="text-discordRed">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-discordMuted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-discordDark border border-discordHover focus:border-discordBlurple focus:ring-1 focus:ring-discordBlurple rounded px-9 py-2 text-sm text-white placeholder-discordMuted/60 outline-none transition"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-discordMuted mb-1.5">
                Display Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-discordMuted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Malithu"
                  className="w-full bg-discordDark border border-discordHover focus:border-discordBlurple focus:ring-1 focus:ring-discordBlurple rounded px-9 py-2 text-sm text-white placeholder-discordMuted/60 outline-none transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-discordMuted mb-1.5 flex items-center justify-between">
              <span>Team Role</span>
              <span className="text-[11px] text-discordBlurple font-normal flex items-center gap-1 lowercase">
                <Shield className="w-3 h-3" /> Note-level RBAC
              </span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full bg-discordDark border border-discordHover focus:border-discordBlurple focus:ring-1 focus:ring-discordBlurple rounded px-3 py-2 text-sm text-white outline-none cursor-pointer"
            >
              <option value="ADMIN">ADMIN — Full edit, manage roles, comments</option>
              <option value="EDITOR">EDITOR — Full block editing & media insertion</option>
              <option value="COMMENTER">COMMENTER — Read-only blocks + comments</option>
              <option value="VIEWER">VIEWER — Strictly read-only viewer</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full mt-2 bg-discordBlurple hover:bg-discordBlurple/90 text-white font-medium py-2.5 px-4 rounded transition flex items-center justify-center gap-2 shadow-md shadow-discordBlurple/25"
          >
            <span>{isRegister ? 'Register & Enter Workspace' : 'Log In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-discordMuted">
          Connected to Gateway: <code className="text-discordBlurple">/api/notes</code> &bull; <code className="text-discordBlurple">/ws-chat</code>
        </div>
      </div>
    </div>
  );
};
