import React, { useState, useRef } from 'react';
import { User, Role, UserStatus } from '../../types';
import {
  X,
  Check,
  Shield,
  User as UserIcon,
  Palette,
  Activity,
  Camera,
  Trash2,
  Image as ImageIcon,
  Upload,
  Link2,
} from 'lucide-react';

interface ProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
}

const AVATAR_COLORS = [
  '#5865F2', // Discord Blurple
  '#57F287', // Discord Green
  '#FEE75C', // Discord Yellow
  '#EB459E', // Discord Fuchsia
  '#ED4245', // Discord Red
  '#00B0F4', // Discord Cyan
  '#9B59B6', // Purple
  '#E67E22', // Orange
];

const BANNER_PRESETS = [
  {
    name: 'Cyber Grid',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Cosmic Nebula',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Neon Matrix',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Deep Minimal',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
  },
];

export const ProfileModal: React.FC<ProfileModalProps> = ({ user, isOpen, onClose, onSave }) => {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [role, setRole] = useState<Role>(user.role);
  const [status, setStatus] = useState<UserStatus>(user.status);
  const [avatarColor, setAvatarColor] = useState(user.avatarColor);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [bannerUrl, setBannerUrl] = useState(user.bannerUrl || '');
  const [bio, setBio] = useState(user.bio || '');

  const bannerFileInputRef = useRef<HTMLInputElement>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setBannerUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...user,
      displayName,
      role,
      status,
      avatarColor,
      avatarUrl,
      bannerUrl,
      bio,
    });
    onClose();
  };

  const getStatusDot = (st: UserStatus) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-discordMid rounded-lg shadow-2xl border border-discordHover overflow-hidden">
        {/* Hidden File Inputs for Banner & Avatar DP */}
        <input
          ref={bannerFileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleBannerFileUpload}
        />
        <input
          ref={avatarFileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarFileUpload}
        />

        {/* Modal Banner Header */}
        <div
          className="h-28 w-full relative transition-colors overflow-hidden group/banner bg-black"
          style={{ backgroundColor: bannerUrl ? undefined : avatarColor }}
        >
          {bannerUrl ? (
            <>
              <img
                src={bannerUrl}
                alt="Profile Banner"
                className="w-full h-full object-cover transition-transform group-hover/banner:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
          )}

          {/* Action buttons inside the banner bar */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => bannerFileInputRef.current?.click()}
              className="px-2.5 py-1 text-xs font-semibold text-white bg-black/65 hover:bg-black/85 rounded-md border border-white/20 backdrop-blur-md flex items-center gap-1.5 transition shadow"
            >
              <Camera className="w-3.5 h-3.5 text-discordBlurple" />
              <span>Change Banner</span>
            </button>
            {bannerUrl && (
              <button
                type="button"
                onClick={() => setBannerUrl('')}
                className="p-1 text-xs text-white hover:text-red-400 bg-black/65 hover:bg-black/85 rounded-md border border-white/20 backdrop-blur-md transition shadow"
                title="Remove Banner Image"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center transition border border-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Avatar preview overlap */}
        <div className="px-6 relative -mt-12 flex items-end justify-between">
          <div
            className="relative group/dp cursor-pointer"
            onClick={() => avatarFileInputRef.current?.click()}
            title="Click to Change Display Picture (DP)"
          >
            <div
              className="w-20 h-20 rounded-full border-4 border-[#0d0e11] flex items-center justify-center text-2xl font-bold text-white shadow-2xl overflow-hidden relative"
              style={{ backgroundColor: avatarUrl ? undefined : avatarColor }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span>{displayName ? displayName[0].toUpperCase() : 'U'}</span>
              )}

              {/* Hover overlay to Change DP */}
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover/dp:opacity-100 flex flex-col items-center justify-center transition-opacity text-white">
                <Camera className="w-5 h-5 text-discordBlurple mb-0.5" />
                <span className="text-[9px] font-bold tracking-wider uppercase">Change DP</span>
              </div>
            </div>

            <div
              className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-[#0d0e11] ${getStatusDot(
                status
              )}`}
            />
          </div>
          <div className="text-right">
            <span className="text-xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-discordDark text-discordBlurple border border-discordBlurple/30">
              {role}
            </span>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-discordMuted mb-1 flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5" /> Display Name
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-discordDark border border-discordHover focus:border-discordBlurple rounded px-3 py-2 text-sm text-white outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-discordMuted mb-1 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Team Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full bg-discordDark border border-discordHover focus:border-discordBlurple rounded px-3 py-2 text-sm text-white outline-none cursor-pointer"
              >
                <option value="ADMIN">ADMIN</option>
                <option value="EDITOR">EDITOR</option>
                <option value="COMMENTER">COMMENTER</option>
                <option value="VIEWER">VIEWER</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-discordMuted mb-1 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" /> Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as UserStatus)}
                className="w-full bg-discordDark border border-discordHover focus:border-discordBlurple rounded px-3 py-2 text-sm text-white outline-none cursor-pointer"
              >
                <option value="ONLINE">Online</option>
                <option value="IDLE">Idle</option>
                <option value="DND">Do Not Disturb</option>
                <option value="OFFLINE">Invisible</option>
              </select>
            </div>
          </div>

          {/* Avatar Display Picture (DP) Controls */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-discordMuted flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-discordBlurple" /> Profile Picture (DP)
              </label>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl('')}
                  className="text-[11px] text-discordRed hover:underline"
                >
                  Remove DP (Reset to Initial)
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => avatarFileInputRef.current?.click()}
                className="px-3 py-1.5 bg-[#0a0a0c] hover:bg-[#141518] border border-[#1c1d22] text-xs font-medium text-white rounded flex items-center gap-1.5 transition shrink-0 shadow-sm"
              >
                <Upload className="w-3.5 h-3.5 text-discordBlurple" />
                <span>Upload Photo</span>
              </button>
              <button
                type="button"
                onClick={() => setAvatarUrl('/logo.jpg')}
                className="px-2.5 py-1.5 bg-[#0a0a0c] hover:bg-[#141518] border border-[#1c1d22] text-xs font-medium text-white rounded flex items-center gap-1.5 transition shrink-0 shadow-sm"
                title="Use Sync-Space Logo as DP"
              >
                <img src="/logo.jpg" alt="Logo" className="w-3.5 h-3.5 rounded-full object-cover" />
                <span>Use Logo</span>
              </button>
              <div className="relative flex-1">
                <Link2 className="w-3 h-3 text-discordMuted absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  placeholder="Or paste DP image URL..."
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full bg-black border border-[#1c1d22] focus:border-discordBlurple rounded pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-discordMuted/50 outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-discordMuted mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" /> Avatar Theme Color
            </label>
            <div className="flex items-center gap-2.5">
              {AVATAR_COLORS.map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setAvatarColor(col)}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow"
                  style={{ backgroundColor: col }}
                >
                  {avatarColor === col && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-discordMuted flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-discordBlurple" /> Profile Banner Image
              </label>
              {bannerUrl && (
                <button
                  type="button"
                  onClick={() => setBannerUrl('')}
                  className="text-[11px] text-discordRed hover:underline"
                >
                  Reset to Solid Color
                </button>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2 mb-2.5">
              {BANNER_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setBannerUrl(preset.url)}
                  className={`relative h-12 rounded-lg overflow-hidden border transition group/b ${bannerUrl === preset.url
                      ? 'border-discordBlurple ring-2 ring-discordBlurple/40'
                      : 'border-[#1c1d22] hover:border-discordBlurple/60'
                    }`}
                  title={preset.name}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-full h-full object-cover group-hover/b:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-1">
                    <span className="text-[10px] text-white font-medium truncate drop-shadow text-center">
                      {preset.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => bannerFileInputRef.current?.click()}
                className="px-3 py-1.5 bg-[#0a0a0c] hover:bg-[#141518] border border-[#1c1d22] text-xs font-medium text-white rounded flex items-center gap-1.5 transition shrink-0"
              >
                <Upload className="w-3.5 h-3.5 text-discordBlurple" />
                <span>Upload Image</span>
              </button>
              <div className="relative flex-1">
                <Link2 className="w-3 h-3 text-discordMuted absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  placeholder="Or paste banner image URL..."
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  className="w-full bg-black border border-[#1c1d22] focus:border-discordBlurple rounded pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-discordMuted/50 outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-discordMuted mb-1">
              About Me (Bio)
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the team about what you're building..."
              className="w-full bg-discordDark border border-discordHover focus:border-discordBlurple rounded px-3 py-2 text-sm text-white placeholder-discordMuted/50 outline-none resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-discordHover">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-discordText hover:underline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium rounded bg-discordBlurple hover:bg-discordBlurple/90 text-white transition flex items-center gap-1.5 shadow"
            >
              <Check className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
