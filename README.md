# TLDR Email Client

A modern, full-stack email client application with Gmail integration built with React, TypeScript, NestJS, and PostgreSQL. This project features complete OAuth 2.0 authentication with PKCE, real-time email synchronization, and the ability to send, receive, and manage emails through the Gmail API.

**Live Demo:** [https://ga03.pages.dev/](https://ga03.pages.dev/)

**Video:** [https://youtu.be/ipUBGLoWaoQ](https://youtu.be/ipUBGLoWaoQ)

## ✨ Key Features

### Authentication & Security
- **Google OAuth 2.0 with PKCE**: Secure authorization code flow with Proof Key for Code Exchange
- **JWT Token Management**: Access tokens with automatic refresh handling
- **Encrypted Token Storage**: AES-256-GCM encryption for OAuth tokens in database
- **Protected Routes**: Client-side route guards with automatic token refresh

### Email Management
- **Gmail Integration**: Full Gmail API integration for reading and sending emails
- **Real-time Sync**: Automatic email synchronization with sync status indicators
- **Incremental Updates**: Gmail History API for efficient incremental syncing
- **Background Jobs**: Automated cron jobs for periodic email synchronization
- **Email Threading**: Proper email threading support with In-Reply-To and References headers
- **Rich Email Display**: HTML email rendering with attachments support
- **Kanban Board**: Visual workflow management with drag-and-drop email organization
- **Task Management**: 4-column Kanban (Inbox, To Do, In Progress, Done) for email workflow
- **Email Snooze**: Snooze emails with multiple duration options (1hr, 4hr, 1day, 3days, 1week)
- **Auto Wake-up**: Backend cron job automatically unsnoozes emails when time expires
- **Kanban Board**: Visual workflow management with drag-and-drop email organization
- **Task Management**: 4-column Kanban (Inbox, To Do, In Progress, Done) for email workflow
- **Email Snooze**: Snooze emails with multiple duration options (1hr, 4hr, 1day, 3days, 1week)
- **Auto Wake-up**: Backend cron job automatically unsnoozes emails when time expires

### AI-Powered Features
- **Email Summarization**: AI-generated summaries for quick email understanding
- **Auto-Summarization**: Automatically generate summaries for top 5 emails on Kanban entry
- **Smart Insights**: Sparkles icon indicates AI-summarized emails

### Email Sending
- **Compose New Emails**: Create and send new emails with To, Cc, Bcc support
- **Reply & Reply All**: Reply to emails with proper threading
- **Forward Emails**: Forward messages to new recipients
- **RFC 2822 Format**: Properly formatted email messages with multipart/alternative (HTML + plain text)
- **Auto Token Refresh**: Automatic OAuth token refresh before sending

### User Interface
- **3-Column Layout**: Mailbox list, email list, and email detail view
- **Responsive Design**: Fully responsive from desktop to mobile
- **Virtualized Lists**: Efficient rendering of large email lists with react-virtualized
- **Sync Status Indicators**: Visual feedback during email synchronization
- **Keyboard Navigation**: Navigate emails with keyboard shortcuts
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS

### Backend Architecture
- **NestJS Framework**: Modular, scalable backend architecture
- **PostgreSQL Database**: Robust data persistence with TypeORM
- **RESTful API**: Well-documented REST API with Swagger/OpenAPI
- **Error Handling**: Global exception filters with proper error responses
- **Pagination**: Cursor-based pagination for efficient data loading
- **Data Validation**: DTO validation with class-validator

## 🏗️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand (auth) + React Query (data fetching)
- **Forms**: React Hook Form + Zod validation
- **Routing**: React Router v6
- **HTTP Client**: Axios with interceptors
- **Virtualization**: react-virtualized for performance
- **Drag & Drop**: @hello-pangea/dnd for Kanban board

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT + Google OAuth 2.0
- **API Documentation**: Swagger/OpenAPI
- **Email Service**: Gmail API via googleapis
- **Encryption**: AES-256-GCM for token storage
- **Validation**: class-validator + class-transformer
- **Background Jobs**: NestJS Schedule (cron)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [PostgreSQL](https://www.postgresql.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- Google OAuth 2.0 credentials ([Get them here](https://console.cloud.google.com/))

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd tldr-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   Create a `.env` file in the `tldr-backend` directory:
   ```env
   # Database
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USERNAME=postgres
   DATABASE_PASSWORD=your_password
   DATABASE_NAME=tldr_email
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key-change-this
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
   JWT_REFRESH_EXPIRES_IN=7d
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
   
   # Encryption (for OAuth tokens)
   ENCRYPTION_KEY=your-32-character-encryption-key-here
   
   # App
   PORT=3000
   ```

4. **Create PostgreSQL database:**
   ```bash
   createdb tldr_email
   ```

5. **Run database migrations:**
   ```bash
   npm run migration:run
   ```

6. **Start the backend server:**
   ```bash
   npm run start:dev
   ```
   
   The API will be available at `http://localhost:3000`
   API documentation (Swagger) at `http://localhost:3000/api/docs`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd tldr-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   Create a `.env` file in the `tldr-frontend` directory:
   ```env
   VITE_API_URL=http://localhost:3000/v1
   VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173`

### Building for Production

**Backend:**
```bash
cd tldr-backend
npm run build
npm run start:prod
```

**Frontend:**
```bash
cd Ga03
npm run build
```

This will generate a `dist` directory with optimized assets.

## 🔐 Authentication Flow Explained

This project implements OAuth 2.0 with PKCE (Proof Key for Code Exchange) for enhanced security.

1. **Google Sign-In**: User clicks "Sign in with Google" button
2. **Authorization Request**: Frontend generates code verifier and code challenge, redirects to Google OAuth consent screen
3. **Authorization Code**: Google redirects back with an authorization code
4. **Token Exchange**: Backend exchanges the code for access and refresh tokens using the code verifier
5. **Mailbox Auto-Creation**: Backend automatically creates a mailbox entry and initiates email sync
6. **Token Storage**: 
   - Frontend: Access token in memory (Zustand), JWT tokens stored in HttpOnly cookies
   - Backend: OAuth tokens encrypted with AES-256-GCM in PostgreSQL
7. **Token Refresh**: Automatic token refresh before API calls if expired (5-minute threshold)
8. **Email Sync**: Background jobs periodically sync emails using Gmail History API

### Security Features

- **PKCE Flow**: Prevents authorization code interception attacks
- **One-Time Code Use**: Authorization codes are consumed and cannot be reused
- **Encrypted Storage**: All OAuth tokens encrypted at rest in database
- **HttpOnly Cookies**: JWT tokens stored in secure, HttpOnly cookies to prevent XSS attacks
- **SameSite Cookies**: CSRF protection with SameSite=Strict cookie attribute
- **Token Expiry**: Short-lived access tokens (15 minutes) with longer refresh tokens (7 days)
- **Automatic Refresh**: Tokens refreshed automatically before API operations
- **Secure Cookies**: HttpOnly, SameSite cookies for additional security (optional)

## 📧 Email Features

### Receiving Emails
- **Full Sync**: Initial sync fetches 100 most recent emails per mailbox
- **Incremental Sync**: Gmail History API tracks changes since last sync
- **Background Jobs**: Automated syncing every 5 minutes
- **Manual Sync**: Users can manually trigger sync via UI
- **Sync Status**: Real-time sync status indicators (pending, syncing, synced, error)

### Sending Emails
- **Compose**: Create new emails with rich text support
- **Reply**: Reply to single recipient with proper threading
- **Reply All**: Reply to all recipients (To + Cc)
- **Forward**: Forward emails to new recipients
- **Threading**: Maintains email threads with In-Reply-To and References headers
- **Multipart**: Supports both HTML and plain text formats

### Email Display
- **HTML Rendering**: Safe HTML email rendering
- **Attachments**: Display attachment metadata (full download coming soon)
- **Labels**: Gmail labels and categories
- **Star/Unstar**: Mark emails as starred
- **Read/Unread**: Track read status
- **Search**: Search emails by sender, subject, or content
- **Pagination**: Efficient cursor-based pagination

## 🎨 UI Components

Built with shadcn/ui, the interface includes:
- **Navigation**: Top navigation with user profile and logout
- **Mailbox List**: Sidebar with folder structure (Inbox, Favorites, Snoozed, Drafts, Sent, Archive, Spam, Bin)
- **Email List**: Virtualized scrollable email list with sender, subject, snippet, and timestamp
- **Email Detail**: Full email view with actions (reply, forward, delete, star, snooze)
- **Kanban Board**: Drag-and-drop board with 4 columns for visual email workflow management
- **Email Cards**: Rich cards with AI summaries, snooze indicators, and quick actions
- **Compose Modal**: Rich email composition interface
- **Loading States**: Skeletons and spinners for async operations
- **Error Handling**: User-friendly error messages and alerts

## 📁 Project Structure

### Frontend (`Ga03/`)
```
Ga03/
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── EmailDetail.tsx       # Email detail view with reply/forward
│   │   │   ├── EmailList.tsx         # Virtualized email list
│   │   │   ├── MailboxList.tsx       # Sidebar with folders
│   │   │   └── ComposeEmailModal.tsx # Email composition modal
│   │   ├── kanban/
│   │   │   ├── KanbanBoard.tsx       # Drag-and-drop board with 4 columns
│   │   │   ├── KanbanColumn.tsx      # Droppable column component
│   │   │   └── EmailCard.tsx         # Draggable email card with snooze
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── Navigation.tsx            # Top navigation bar
│   │   ├── PrivateRoute.tsx          # Route guard
│   │   └── AuthProvider.tsx          # Auth context
│   ├── hooks/
│   │   ├── useAuth.ts                # Authentication hooks
│   │   ├── useEmail.ts               # Email data hooks (React Query)
│   │   └── useKeyboardNavigation.ts  # Keyboard shortcuts
│   ├── pages/
│   │   ├── Login.tsx                 # Login page with Google OAuth
│   │   ├── Dashboard.tsx             # Landing page
│   │   ├── Inbox.tsx                 # Main email interface
│   │   └── Kanban.tsx                # Kanban board view
│   ├── services/
│   │   ├── apiClient.ts              # Axios client with interceptors
│   │   ├── authApi.ts                # Authentication API calls
│   │   └── emailApi.ts               # Email API calls
│   ├── store/
│   │   └── authStore.ts              # Zustand auth store
│   ├── types/
│   │   └── email.ts                  # TypeScript interfaces
│   └── lib/
│       └── utils.ts                  # Utility functions
├── docs/                             # Documentation
└── public/                           # Static assets
```

### Backend (`tldr-backend/`)
```
tldr-backend/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts    # Login, logout, token refresh
│   │   │   ├── auth.service.ts       # Auth business logic
│   │   │   ├── strategies/           # JWT & Google OAuth strategies
│   │   │   └── guards/               # Auth guards
│   │   ├── user/
│   │   │   ├── user.controller.ts    # User profile endpoints
│   │   │   ├── user.service.ts       # User management
│   │   │   └── entities/user.entity.ts
│   │   └── mailbox/
│   │       ├── mailbox.controller.ts # Mailbox CRUD
│   │       ├── mailbox.service.ts    # Mailbox management
│   │       ├── email.controller.ts   # Email CRUD & send
│   │       ├── email.service.ts      # Email business logic
│   │       ├── providers/
│   │       │   └── gmail.service.ts  # Gmail API integration
│   │       ├── entities/
│   │       │   ├── mailbox.entity.ts # Mailbox model
│   │       │   ├── email.entity.ts   # Email model
│   │       │   └── attachment.entity.ts
│   │       └── dto/                  # Data Transfer Objects
│   ├── common/
│   │   ├── filters/                  # Exception filters
│   │   ├── interceptors/             # Response interceptors
│   │   ├── pagination/               # Pagination utilities
│   │   └── utils/
│   │       └── encryption.util.ts    # AES encryption
│   └── config/                       # Configuration modules
└── test/                             # E2E tests
```

## 🔌 API Endpoints

### Authentication
- `POST /v1/auth/google` - Exchange Google OAuth code for JWT tokens
- `POST /v1/auth/refresh` - Refresh access token
- `POST /v1/auth/logout` - Logout user
- `GET /v1/auth/profile` - Get current user profile

### Mailboxes
- `GET /v1/mailboxes` - List user's mailboxes
- `GET /v1/mailboxes/:id` - Get mailbox details
- `POST /v1/mailboxes/connect` - Connect new Gmail mailbox
- `POST /v1/mailboxes/:id/sync` - Trigger manual sync
- `DELETE /v1/mailboxes/:id` - Disconnect mailbox

### Emails
- `GET /v1/emails` - List emails (with pagination, filtering)
- `GET /v1/emails/:id` - Get email details
- `POST /v1/emails/send` - Send email
- `PATCH /v1/emails/:id` - Update email (read status, starred, etc.)
- `DELETE /v1/emails/:id` - Delete email

Full API documentation available at `/api/docs` when running the backend.

## 🚦 Environment Variables

### Backend (`.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_HOST` | PostgreSQL host | `localhost` |
| `DATABASE_PORT` | PostgreSQL port | `5432` |
| `DATABASE_USERNAME` | Database username | `postgres` |
| `DATABASE_PASSWORD` | Database password | `your_password` |
| `DATABASE_NAME` | Database name | `tldr_email` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `JWT_EXPIRES_IN` | Access token expiry | `15m` |
| `JWT_REFRESH_SECRET` | Refresh token secret | `your-refresh-secret` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `7d` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | `your-secret` |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL | `http://localhost:3000/auth/google/callback` |
| `ENCRYPTION_KEY` | 32-char encryption key | `your-32-character-key-here` |
| `PORT` | Server port | `3000` |

### Frontend (`.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3000/v1` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID | `xxx.apps.googleusercontent.com` |

## 🔧 Development

### Database Migrations
```bash
# Create a new migration
npm run migration:create --name=MigrationName

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

### Testing
```bash
# Backend unit tests
cd tldr-backend
npm run test

# Backend e2e tests
npm run test:e2e

# Frontend tests
cd Ga03
npm run test
```

### Code Quality
```bash
# Lint
npm run lint

# Format
npm run format
```

## 📝 Features Roadmap

### ✅ Completed
- [x] Google OAuth 2.0 with PKCE
- [x] JWT authentication
- [x] Mailbox auto-creation
- [x] Full email sync
- [x] Incremental sync with History API
- [x] Email sending (compose, reply, forward)
- [x] Sync status indicators
- [x] Token auto-refresh
- [x] Virtualized email list
- [x] Responsive design
- [x] Keyboard navigation
- [x] Kanban board with drag-and-drop
- [x] Email snooze/unsnooze
- [x] AI email summarization
- [x] Auto-summarization on Kanban entry
- [x] Task status management (4 workflow columns)

### 🚧 In Progress
- [ ] Attachment downloads
- [ ] Rich text editor for email composition
- [ ] Draft saving
- [ ] Email search improvements

### 📋 Planned
- [ ] Multiple mailbox support
- [ ] Email labels/tags management
- [ ] Email filters and rules
- [ ] Bulk operations
- [ ] Email templates
- [ ] Calendar integration
- [ ] Contact management
- [ ] Dark mode
- [ ] Email notifications
- [ ] Offline support

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - Backend framework
- [React](https://react.dev/) - Frontend library
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Gmail API](https://developers.google.com/gmail/api) - Email integration
- [TypeORM](https://typeorm.io/) - Database ORM
- [React Query](https://tanstack.com/query) - Data fetching
- [Zustand](https://zustand-demo.pmnd.rs/) - State management

## 📞 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

Built with ❤️ by [AdvWeeb](https://github.com/AdvWeeb)
