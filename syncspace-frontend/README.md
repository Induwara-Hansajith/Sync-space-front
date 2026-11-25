# Sync-Space Frontend

A production-ready, Discord-inspired collaborative workspace frontend engineered with **Vite, React 18, TypeScript, and Tailwind CSS**. Designed to connect with a Spring Cloud microservices architecture (API Gateway, Notes Service, Chat Service, and AI Service), with zero-failure offline mock fallback.

---

## 🚀 Key Features & Highlights

### 1. 3-Column Discord-Style Layout
- **Left Panel (20% width) — Private AI Assistant (`AiSidebar`)**:
  - **Summarize Active Note**: Instant summary of headings, key blocks, and media with bullet points.
  - **Extract Tasks**: Identifies checklists, action items, code reviews, and documentation tasks tagged with priority (`HIGH`, `MEDIUM`, `LOW`).
  - **Private AI Chat**: Ask questions scoped directly to the active note context. 100% confidential and isolated from the team chat room.
  - **User Profile Bar**: Docked at the bottom with avatar, status indicator (Online, Idle, DND), role tag, and settings.
- **Center Panel (50% width) — Workspace Notes & Inline Block Editor (`NoteWorkspace` & `InlineBlockEditor`)**:
  - **Polymorphic Inline Blocks**: Notes are made up of an ordered flow of `HEADING`, `PARAGRAPH`, `CHECKLIST`, `CODE`, `IMAGE`, and `DOCUMENT` blocks.
  - **Seamless Media Insertion**: Insert Images and Documents anywhere via the top toolbar or the hover **`+ Below`** menu on any block.
  - **Auto-Appending Paragraph**: Whenever an `IMAGE` or `DOCUMENT` block is inserted, an empty `PARAGRAPH` block is automatically appended below it so users can keep typing without disruption.
  - **Lightbox Modal**: Click any image to view it full-size in a high-res lightbox zoom modal with captions.
  - **Inline Document Cards**: Rendered as cards with file name, file size badge, and immediate simulated download.
  - **Block Reordering & Deletion**: Move blocks up/down or remove blocks seamlessly.
  - **Fine-Grained RBAC**:
    - `ADMIN`: Full editing, delete note, manage collaborator roles via `RoleManagerModal`, and comment.
    - `EDITOR`: Full block editing, media insertion, and commenting (cannot delete note or manage roles).
    - `COMMENTER`: Read-only blocks, can post and view comments.
    - `VIEWER`: Strictly read-only blocks, commenting disabled.
  - **Simulate Role Dropdown**: Test all 4 RBAC roles instantly from the header without switching accounts!
  - **Collapsible Comments Section**: Threaded discussion under each note respecting RBAC permissions.
- **Right Panel (30% width) — Real-Time Team Chat (`TeamChatPanel`)**:
  - Real-time STOMP over SockJS client subscribing to `/topic/chat/{room}` and sending to `/app/chat/{room}`.
  - Channel switcher: `#general-chat`, `#dev-team`, `#architecture`.
  - **`@ai` Mention Detection**: Typing `@ai <question>` triggers a public bot response with a Discord-styled `BOT` badge and sparkles icon.
  - Live connection status badge indicating STOMP Live or Local Sync fallback.

### 2. Authentication & Profile
- **AuthScreen**: Discord-styled sign-in and registration screen.
- **Quick Demo Login**: 1-click login presets for instant testing:
  - **Malithu** (`ADMIN`)
  - **Pulitha** (`EDITOR`)
  - **Hansajith** (`COMMENTER`)
  - **Savinu** (`VIEWER`)
- **ProfileModal**: Real-time editing of Display Name, Team Role, Status, Avatar Color, and Bio. Updates reflect instantly across the entire interface and chat messages.

---

## 🛠 Tech Stack
- **Framework**: Vite 5 + React 18 + TypeScript 5
- **Styling**: Tailwind CSS configured with Discord dark tokens:
  - `discordDark`: `#202225`
  - `discordMid`: `#2f3136`
  - `discordLight`: `#36393f`
  - `discordHover`: `#40444b`
  - Accents: `discordBlurple` (`#5865F2`), `discordGreen` (`#57F287`), `discordYellow` (`#FEE75C`), `discordRed` (`#ED4245`)
- **Icons**: `lucide-react`
- **HTTP Client**: `axios`
- **Real-Time WebSockets**: `@stomp/stompjs` + `sockjs-client`
- **Containerization**: Multi-stage `Dockerfile` (Node build -> Nginx alpine)

---

## 📂 Directory Structure

```
syncspace-frontend/
├── Dockerfile                  # Multi-stage production container
├── nginx.conf                  # Nginx reverse proxy & SPA router
├── docker-compose.yml          # Container orchestration
├── index.html                  # HTML entry point
├── package.json                # Project dependencies and scripts
├── postcss.config.js           # PostCSS configuration
├── tailwind.config.js          # Tailwind theme with Discord palette
├── tsconfig.json               # TypeScript compiler config
├── vite.config.ts              # Vite config with SockJS polyfills
├── .env.example                # Environment variables template
├── .env                        # Local environment variables
└── src/
    ├── App.tsx                 # Core application layout and state
    ├── main.tsx                # React DOM mount point
    ├── index.css               # Discord dark scrollbar & base styles
    ├── types/
    │   └── index.ts            # Type definitions (User, Note, Block, etc.)
    ├── services/
    │   ├── api.ts              # Axios instance & local fallback mock mode
    │   └── websocket.ts        # STOMP / SockJS client & bot dispatcher
    └── components/
        ├── auth/
        │   └── AuthScreen.tsx       # Discord-styled login / demo presets
        ├── profile/
        │   └── ProfileModal.tsx     # User status & avatar customization
        ├── ai/
        │   └── AiSidebar.tsx        # Private AI assistant & profile bar
        ├── notes/
        │   ├── NoteWorkspace.tsx    # Note canvas header & RBAC controller
        │   ├── InlineBlockEditor.tsx# Block editor with Lightbox & Docs
        │   └── RoleManagerModal.tsx # Note access & collaborator manager
        └── chat/
            └── TeamChatPanel.tsx    # Real-time chat & @ai bot bubbles
```

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```env
VITE_API_GATEWAY_URL=http://localhost:8080
VITE_WS_URL=http://localhost:8080/ws-chat
```
*(If the backend is not running, the application will automatically activate its rich Local Fallback Mock Mode with zero errors!)*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
```

---

## 🐳 Docker Deployment

Build and run using Docker:
```bash
docker build -t syncspace-frontend .
docker run -p 3000:80 syncspace-frontend
```

Or via Docker Compose:
```bash
docker-compose up -d
```
The Nginx server will serve the optimized SPA on port 3000 and proxy `/api/` and `/ws-chat` requests to the Spring Cloud Gateway.
