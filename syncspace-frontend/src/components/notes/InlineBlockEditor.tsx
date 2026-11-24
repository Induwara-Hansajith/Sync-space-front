import React, { useState } from 'react';
import {
  ContentBlock,
  BlockType,
  Role,
  Comment,
  ROLE_DEFINITIONS,
  User,
} from '../../types';
import {
  Heading,
  AlignLeft,
  CheckSquare,
  Code2,
  Image as ImageIcon,
  FileText,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Download,
  Maximize2,
  X,
  MessageSquare,
  Send,
  Lock,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Upload,
  Link2,
} from 'lucide-react';

interface InlineBlockEditorProps {
  blocks: ContentBlock[];
  comments: Comment[];
  effectiveRole: Role;
  currentUser: User;
  onUpdateBlocks: (blocks: ContentBlock[]) => void;
  onAddComment: (content: string) => void;
  onDeleteComment: (commentId: string) => void;
}

export const InlineBlockEditor: React.FC<InlineBlockEditorProps> = ({
  blocks,
  comments,
  effectiveRole,
  currentUser,
  onUpdateBlocks,
  onAddComment,
  onDeleteComment,
}) => {
  const [activeMenuBlockId, setActiveMenuBlockId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; caption?: string } | null>(null);
  const [isCommentsOpen, setIsCommentsOpen] = useState(true);
  const [newCommentText, setNewCommentText] = useState('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [editingImageUrlBlockId, setEditingImageUrlBlockId] = useState<string | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState('');

  const permissions = ROLE_DEFINITIONS[effectiveRole];
  const canEdit = permissions.canEdit;
  const canComment = permissions.canComment;

  const handleBlockImageFileUpload = (blockId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          updateBlockMetadata(blockId, { url: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Insert block at specific index with auto-append logic
  const insertBlock = (type: BlockType, index: number) => {
    if (!canEdit) return;

    let newBlock: ContentBlock;
    const blockId = `b-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    switch (type) {
      case 'HEADING':
        newBlock = {
          id: blockId,
          type: 'HEADING',
          content: '',
          metadata: { level: 2 },
        };
        break;
      case 'CHECKLIST':
        newBlock = {
          id: blockId,
          type: 'CHECKLIST',
          content: '',
          metadata: { checked: false },
        };
        break;
      case 'CODE':
        newBlock = {
          id: blockId,
          type: 'CODE',
          content: '// Write your code snippet here...',
          metadata: { language: 'typescript' },
        };
        break;
      case 'IMAGE':
        newBlock = {
          id: blockId,
          type: 'IMAGE',
          content: 'Architecture & Workspace Snapshot',
          metadata: {
            url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
            caption: 'Click to zoom • Architecture Microservices Diagram',
          },
        };
        break;
      case 'DOCUMENT':
        newBlock = {
          id: blockId,
          type: 'DOCUMENT',
          content: 'System Specification',
          metadata: {
            fileName: 'syncspace-microservices-spec.pdf',
            fileSize: '2.8 MB',
            fileType: 'application/pdf',
          },
        };
        break;
      case 'PARAGRAPH':
      default:
        newBlock = {
          id: blockId,
          type: 'PARAGRAPH',
          content: '',
        };
        break;
    }

    const updated = [...blocks];

    // CRITICAL: Whenever an IMAGE or DOCUMENT block is inserted,
    // automatically append an empty PARAGRAPH block immediately below it!
    if (type === 'IMAGE' || type === 'DOCUMENT') {
      const companionParagraph: ContentBlock = {
        id: `b-p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: 'PARAGRAPH',
        content: '',
      };
      updated.splice(index + 1, 0, newBlock, companionParagraph);
    } else {
      updated.splice(index + 1, 0, newBlock);
    }

    onUpdateBlocks(updated);
    setActiveMenuBlockId(null);
  };

  // Modify block content
  const updateBlockContent = (id: string, content: string) => {
    if (!canEdit) return;
    const updated = blocks.map((b) => (b.id === id ? { ...b, content } : b));
    onUpdateBlocks(updated);
  };

  // Modify block metadata (e.g. checked, caption, language)
  const updateBlockMetadata = (id: string, metaPatch: Partial<ContentBlock['metadata']>) => {
    if (!canEdit) return;
    const updated = blocks.map((b) =>
      b.id === id ? { ...b, metadata: { ...b.metadata, ...metaPatch } } : b
    );
    onUpdateBlocks(updated);
  };

  // Reorder blocks
  const moveBlock = (index: number, direction: 'UP' | 'DOWN') => {
    if (!canEdit) return;
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;

    const updated = [...blocks];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    onUpdateBlocks(updated);
  };

  // Delete block
  const deleteBlock = (id: string) => {
    if (!canEdit) return;
    if (blocks.length <= 1) return; // Keep at least one block
    const updated = blocks.filter((b) => b.id !== id);
    onUpdateBlocks(updated);
  };

  // Handle document download action
  const handleDownloadDocument = (block: ContentBlock) => {
    const fileName = block.metadata?.fileName || 'document.txt';
    const blobContent = `--- Sync-Space Export ---\nDocument: ${fileName}\nNote Content Reference: ${block.content}\nTimestamp: ${new Date().toISOString()}\n`;
    const blob = new Blob([blobContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy code block snippet
  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // Submit comment
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canComment || !newCommentText.trim()) return;
    onAddComment(newCommentText.trim());
    setNewCommentText('');
  };

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Top Toolbar for inserting at beginning or when empty */}
      {canEdit && (
        <div className="sticky top-0 z-20 flex items-center gap-1.5 p-2 bg-[#0a0a0c]/95 backdrop-blur-md rounded-lg border border-[#1e1f24] shadow-2xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-discordMuted px-2">
            Insert Block:
          </span>
          <button
            type="button"
            onClick={() => insertBlock('HEADING', -1)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-[#111215] hover:bg-[#1a1c22] border border-[#202127] text-discordText hover:text-white transition"
          >
            <Heading className="w-3.5 h-3.5 text-discordBlurple" /> Heading
          </button>
          <button
            type="button"
            onClick={() => insertBlock('PARAGRAPH', -1)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-[#111215] hover:bg-[#1a1c22] border border-[#202127] text-discordText hover:text-white transition"
          >
            <AlignLeft className="w-3.5 h-3.5 text-blue-400" /> Text
          </button>
          <button
            type="button"
            onClick={() => insertBlock('CHECKLIST', -1)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-[#111215] hover:bg-[#1a1c22] border border-[#202127] text-discordText hover:text-white transition"
          >
            <CheckSquare className="w-3.5 h-3.5 text-discordGreen" /> Checklist
          </button>
          <button
            type="button"
            onClick={() => insertBlock('CODE', -1)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-[#111215] hover:bg-[#1a1c22] border border-[#202127] text-discordText hover:text-white transition"
          >
            <Code2 className="w-3.5 h-3.5 text-discordYellow" /> Code
          </button>
          <button
            type="button"
            onClick={() => insertBlock('IMAGE', -1)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-[#111215] hover:bg-[#1a1c22] border border-[#202127] text-discordText hover:text-white transition"
          >
            <ImageIcon className="w-3.5 h-3.5 text-pink-400" /> Image
          </button>
          <button
            type="button"
            onClick={() => insertBlock('DOCUMENT', -1)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-[#111215] hover:bg-[#1a1c22] border border-[#202127] text-discordText hover:text-white transition"
          >
            <FileText className="w-3.5 h-3.5 text-purple-400" /> Document
          </button>
        </div>
      )}

      {/* Read-Only Notice when editing is restricted */}
      {!canEdit && (
        <div className="flex items-center gap-2 px-3 py-2 rounded bg-discordMid border border-discordHover text-xs text-discordMuted">
          <Lock className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            You have <strong className="text-white">{permissions.label}</strong> permissions on this note ({permissions.description}). Editing blocks is locked.
          </span>
        </div>
      )}

      {/* Blocks Container */}
      <div className="space-y-3">
        {blocks.map((block, index) => (
          <div
            key={block.id}
            className="group relative rounded-lg p-2.5 transition-colors border border-transparent hover:border-discordHover/60 hover:bg-discordMid/30"
          >
            {/* Block Action Controls (Drag, Reorder, Delete, Insert Below) */}
            {canEdit && (
              <div className="absolute right-2 -top-3.5 hidden group-hover:flex items-center gap-1 bg-discordDark border border-discordHover rounded-md px-1 py-0.5 shadow-md z-10">
                {/* Insert Below Menu Toggle */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveMenuBlockId(activeMenuBlockId === block.id ? null : block.id)
                    }
                    className="p-1 hover:text-discordBlurple rounded hover:bg-discordMid text-discordMuted transition flex items-center gap-1 text-[11px]"
                    title="Insert block below this"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-medium">+ Below</span>
                  </button>

                  {/* Dropdown Menu for + Below */}
                  {activeMenuBlockId === block.id && (
                    <div className="absolute left-0 mt-1 w-44 bg-discordDark border border-discordHover rounded-md shadow-2xl py-1 z-30 animate-fadeIn">
                      <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-discordMuted">
                        Insert Below:
                      </div>
                      <button
                        type="button"
                        onClick={() => insertBlock('HEADING', index)}
                        className="w-full px-2.5 py-1.5 text-xs text-left hover:bg-discordMid flex items-center gap-2 text-discordText hover:text-white"
                      >
                        <Heading className="w-3.5 h-3.5 text-discordBlurple" /> Heading
                      </button>
                      <button
                        type="button"
                        onClick={() => insertBlock('PARAGRAPH', index)}
                        className="w-full px-2.5 py-1.5 text-xs text-left hover:bg-discordMid flex items-center gap-2 text-discordText hover:text-white"
                      >
                        <AlignLeft className="w-3.5 h-3.5 text-blue-400" /> Paragraph
                      </button>
                      <button
                        type="button"
                        onClick={() => insertBlock('CHECKLIST', index)}
                        className="w-full px-2.5 py-1.5 text-xs text-left hover:bg-discordMid flex items-center gap-2 text-discordText hover:text-white"
                      >
                        <CheckSquare className="w-3.5 h-3.5 text-discordGreen" /> Checklist
                      </button>
                      <button
                        type="button"
                        onClick={() => insertBlock('CODE', index)}
                        className="w-full px-2.5 py-1.5 text-xs text-left hover:bg-discordMid flex items-center gap-2 text-discordText hover:text-white"
                      >
                        <Code2 className="w-3.5 h-3.5 text-discordYellow" /> Code Snippet
                      </button>
                      <button
                        type="button"
                        onClick={() => insertBlock('IMAGE', index)}
                        className="w-full px-2.5 py-1.5 text-xs text-left hover:bg-discordMid flex items-center gap-2 text-discordText hover:text-white"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-pink-400" /> Image (+ Text)
                      </button>
                      <button
                        type="button"
                        onClick={() => insertBlock('DOCUMENT', index)}
                        className="w-full px-2.5 py-1.5 text-xs text-left hover:bg-discordMid flex items-center gap-2 text-discordText hover:text-white"
                      >
                        <FileText className="w-3.5 h-3.5 text-purple-400" /> Document (+ Text)
                      </button>
                    </div>
                  )}
                </div>

                <div className="w-[1px] h-3 bg-discordHover" />

                <button
                  type="button"
                  onClick={() => moveBlock(index, 'UP')}
                  disabled={index === 0}
                  className="p-1 hover:text-white rounded hover:bg-discordMid text-discordMuted disabled:opacity-30 transition"
                  title="Move Block Up"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => moveBlock(index, 'DOWN')}
                  disabled={index === blocks.length - 1}
                  className="p-1 hover:text-white rounded hover:bg-discordMid text-discordMuted disabled:opacity-30 transition"
                  title="Move Block Down"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>

                <div className="w-[1px] h-3 bg-discordHover" />

                <button
                  type="button"
                  onClick={() => deleteBlock(block.id)}
                  disabled={blocks.length <= 1}
                  className="p-1 hover:text-discordRed rounded hover:bg-discordMid text-discordMuted disabled:opacity-30 transition"
                  title="Delete Block"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Render Polymorphic Content Blocks */}
            {/* 1. HEADING */}
            {block.type === 'HEADING' && (
              <div>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={block.content}
                  placeholder="Heading title..."
                  onChange={(e) => updateBlockContent(block.id, e.target.value)}
                  className={`w-full bg-transparent border-b border-transparent focus:border-discordBlurple/50 outline-none text-white font-bold transition ${
                    block.metadata?.level === 1
                      ? 'text-2xl pb-1'
                      : block.metadata?.level === 2
                      ? 'text-xl pb-1'
                      : 'text-lg pb-0.5'
                  } ${!canEdit ? 'cursor-default' : ''}`}
                />
              </div>
            )}

            {/* 2. PARAGRAPH */}
            {block.type === 'PARAGRAPH' && (
              <div>
                <textarea
                  rows={Math.max(1, Math.min(10, Math.ceil((block.content.length || 1) / 80)))}
                  disabled={!canEdit}
                  value={block.content}
                  placeholder={canEdit ? "Type notes or use markdown... Click '+ Below' to add media." : ''}
                  onChange={(e) => updateBlockContent(block.id, e.target.value)}
                  className={`w-full bg-transparent border-none outline-none text-sm text-discordText placeholder-discordMuted/40 leading-relaxed resize-none ${
                    !canEdit ? 'cursor-default' : ''
                  }`}
                />
              </div>
            )}

            {/* 3. CHECKLIST */}
            {block.type === 'CHECKLIST' && (
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  disabled={!canEdit}
                  checked={!!block.metadata?.checked}
                  onChange={(e) => updateBlockMetadata(block.id, { checked: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded border-discordHover bg-discordDark text-discordBlurple focus:ring-discordBlurple cursor-pointer disabled:cursor-default"
                />
                <input
                  type="text"
                  disabled={!canEdit}
                  value={block.content}
                  placeholder="Checklist task..."
                  onChange={(e) => updateBlockContent(block.id, e.target.value)}
                  className={`flex-1 bg-transparent border-none outline-none text-sm ${
                    block.metadata?.checked
                      ? 'line-through text-discordMuted/70'
                      : 'text-discordText'
                  } ${!canEdit ? 'cursor-default' : ''}`}
                />
              </div>
            )}

            {/* 4. CODE */}
            {block.type === 'CODE' && (
              <div className="rounded-lg overflow-hidden border border-discordHover bg-discordDark shadow-inner">
                <div className="px-3 py-1.5 bg-discordDark/90 border-b border-discordHover/60 flex items-center justify-between text-xs text-discordMuted">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-3.5 h-3.5 text-discordYellow" />
                    {canEdit ? (
                      <select
                        value={block.metadata?.language || 'typescript'}
                        onChange={(e) => updateBlockMetadata(block.id, { language: e.target.value })}
                        className="bg-discordMid text-[11px] text-discordText rounded px-1.5 py-0.5 outline-none cursor-pointer"
                      >
                        <option value="typescript">TypeScript</option>
                        <option value="javascript">JavaScript</option>
                        <option value="java">Java (Spring Boot)</option>
                        <option value="python">Python</option>
                        <option value="json">JSON</option>
                        <option value="bash">Bash / Shell</option>
                        <option value="yaml">YAML / Docker</option>
                      </select>
                    ) : (
                      <span className="font-mono uppercase text-[10px] text-discordYellow font-bold">
                        {block.metadata?.language || 'CODE'}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyCode(block.id, block.content)}
                    className="p-1 hover:text-white rounded hover:bg-discordHover text-discordMuted transition flex items-center gap-1 text-[11px]"
                  >
                    {copiedCodeId === block.id ? (
                      <>
                        <Check className="w-3 h-3 text-discordGreen" />
                        <span className="text-discordGreen text-[10px]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span className="text-[10px]">Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  rows={Math.max(3, (block.content.match(/\n/g) || []).length + 1)}
                  disabled={!canEdit}
                  value={block.content}
                  onChange={(e) => updateBlockContent(block.id, e.target.value)}
                  className="w-full p-3 bg-discordDark font-mono text-xs text-emerald-400 outline-none leading-relaxed resize-none"
                />
              </div>
            )}

            {/* 5. IMAGE (Inline with editable caption + Upload + Lightbox) */}
            {block.type === 'IMAGE' && (
              <div className="space-y-2">
                <div className="relative group/img rounded-lg overflow-hidden border border-[#1c1d22] bg-[#050506] max-h-96 flex items-center justify-center">
                  <img
                    src={block.metadata?.url || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80'}
                    alt={block.metadata?.caption || 'Note attachment preview'}
                    onClick={() =>
                      setLightboxImage({
                        url: block.metadata?.url || '',
                        caption: block.metadata?.caption,
                      })
                    }
                    className="w-full object-cover max-h-96 cursor-zoom-in hover:brightness-105 transition"
                  />
                  {/* Image Action Overlay (Upload & Lightbox) */}
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover/img:opacity-100 transition-opacity bg-black/80 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 shadow-lg">
                    {canEdit && (
                      <label className="p-1 hover:text-white rounded hover:bg-white/10 text-discordMuted cursor-pointer transition flex items-center gap-1 text-[11px]" title="Upload from Device">
                        <Upload className="w-3.5 h-3.5 text-discordBlurple" />
                        <span className="text-[10px]">Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleBlockImageFileUpload(block.id, e)}
                        />
                      </label>
                    )}
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingImageUrlBlockId(editingImageUrlBlockId === block.id ? null : block.id);
                          setImageUrlInput(block.metadata?.url || '');
                        }}
                        className="p-1 hover:text-white rounded hover:bg-white/10 text-discordMuted transition flex items-center gap-1 text-[11px]"
                        title="Enter Image URL"
                      >
                        <Link2 className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-[10px]">URL</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setLightboxImage({
                          url: block.metadata?.url || '',
                          caption: block.metadata?.caption,
                        })
                      }
                      className="p-1 hover:text-white rounded hover:bg-white/10 text-white text-[11px] font-medium flex items-center gap-1"
                      title="Zoom Lightbox"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Optional URL editor input if toggled */}
                {editingImageUrlBlockId === block.id && canEdit && (
                  <div className="p-2 bg-[#09090b] rounded-lg border border-[#1c1d22] flex gap-2 animate-fadeIn">
                    <input
                      type="url"
                      placeholder="Paste image URL..."
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      className="flex-1 bg-black border border-[#1c1d22] rounded px-2.5 py-1 text-xs text-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (imageUrlInput.trim()) {
                          updateBlockMetadata(block.id, { url: imageUrlInput.trim() });
                        }
                        setEditingImageUrlBlockId(null);
                      }}
                      className="px-2.5 py-1 bg-discordBlurple text-white rounded text-xs font-semibold"
                    >
                      Save
                    </button>
                  </div>
                )}

                {/* Editable Caption */}
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[11px] text-discordMuted italic">Caption:</span>
                  <input
                    type="text"
                    disabled={!canEdit}
                    value={block.metadata?.caption || ''}
                    placeholder={canEdit ? 'Add an image caption...' : ''}
                    onChange={(e) => updateBlockMetadata(block.id, { caption: e.target.value })}
                    className={`flex-1 bg-transparent border-b border-transparent focus:border-discordBlurple/40 text-xs text-discordMuted italic outline-none ${
                      !canEdit ? 'cursor-default' : ''
                    }`}
                  />
                </div>
              </div>
            )}

            {/* 6. DOCUMENT (Inline File Card with details & download action) */}
            {block.type === 'DOCUMENT' && (
              <div className="flex items-center justify-between p-3.5 rounded-lg border border-[#1c1d22] bg-[#08080a] hover:bg-[#0d0e11] transition group/doc">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-discordBlurple/20 text-discordBlurple flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate flex items-center gap-2">
                      <span>{block.metadata?.fileName || 'Attached-Document.pdf'}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-[#111215] text-discordMuted border border-[#1c1d22]">
                        {block.metadata?.fileSize || '2.4 MB'}
                      </span>
                    </div>
                    <div className="text-xs text-discordMuted truncate">
                      {block.content || 'System Specification & Architecture Reference'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDownloadDocument(block)}
                    className="px-3 py-1.5 rounded bg-[#111215] hover:bg-[#1a1c22] border border-[#1c1d22] hover:border-discordBlurple text-xs font-medium text-white flex items-center gap-1.5 transition shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5 text-discordBlurple" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox Zoom Modal for Images */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-fadeIn"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white p-1 rounded-full bg-black/60 hover:bg-black/90 transition"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={lightboxImage.url}
              alt="Zoomed preview"
              className="max-h-[80vh] w-auto rounded-lg shadow-2xl border border-discordHover object-contain"
            />
            {lightboxImage.caption && (
              <div className="mt-3 px-4 py-1.5 rounded-full bg-discordDark/90 border border-discordHover text-xs text-discordText">
                {lightboxImage.caption}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Collapsible Comments Section */}
      <div className="mt-8 pt-6 border-t border-discordHover/70">
        <button
          type="button"
          onClick={() => setIsCommentsOpen(!isCommentsOpen)}
          className="w-full flex items-center justify-between py-2 text-left group"
        >
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-discordMuted group-hover:text-white transition">
            <MessageSquare className="w-4 h-4 text-discordBlurple" />
            <span>Comments & Discussion</span>
            <span className="px-1.5 py-0.5 rounded bg-discordHover text-white text-[10px]">
              {comments.length}
            </span>
          </div>
          {isCommentsOpen ? (
            <ChevronUp className="w-4 h-4 text-discordMuted" />
          ) : (
            <ChevronDown className="w-4 h-4 text-discordMuted" />
          )}
        </button>

        {isCommentsOpen && (
          <div className="mt-3 space-y-4">
            {/* Comment List */}
            {comments.length === 0 ? (
              <div className="p-4 rounded-lg bg-discordDark/50 text-xs text-discordMuted text-center">
                No comments yet. Start the conversation below.
              </div>
            ) : (
              <div className="space-y-2.5">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-3 rounded-lg bg-discordDark border border-discordHover flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 shadow overflow-hidden"
                        style={{ backgroundColor: comment.authorId === currentUser.id && currentUser.avatarUrl ? undefined : comment.authorAvatarColor }}
                      >
                        {comment.authorId === currentUser.id && currentUser.avatarUrl ? (
                          <img src={currentUser.avatarUrl} alt={comment.authorName} className="w-full h-full object-cover" />
                        ) : (
                          comment.authorName ? comment.authorName[0].toUpperCase() : 'U'
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{comment.authorName}</span>
                          <span className="text-[10px] text-discordMuted">
                            {new Date(comment.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-discordText mt-1 whitespace-pre-wrap leading-relaxed">
                          {comment.content}
                        </p>
                      </div>
                    </div>

                    {(permissions.canDelete || comment.authorId === currentUser.id) && (
                      <button
                        onClick={() => onDeleteComment(comment.id)}
                        className="text-discordMuted hover:text-discordRed p-1 rounded hover:bg-discordMid transition shrink-0"
                        title="Delete comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Comment Form (RBAC Checked) */}
            {canComment ? (
              <form onSubmit={handleCommentSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Add a comment to this note..."
                  className="flex-1 bg-[#08080a] border border-[#1c1d22] focus:border-discordBlurple rounded px-3 py-2 text-xs text-white placeholder-discordMuted/50 outline-none"
                />
                <button
                  type="submit"
                  disabled={!newCommentText.trim()}
                  className="px-4 py-2 bg-discordBlurple hover:bg-discordBlurple/90 disabled:opacity-40 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition shadow"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post</span>
                </button>
              </form>
            ) : (
              <div className="p-2.5 rounded bg-discordDark/60 border border-discordHover text-xs text-discordMuted flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-zinc-500" />
                <span>Commenting is disabled for {permissions.label} role.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
