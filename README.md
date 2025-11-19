# SecureMail React SPA

This project is a modern, secure single-page application built with React, TypeScript, and Vite. It demonstrates a complete and robust authentication system featuring email/password login, Google Sign-In (OAuth), automatic token refresh, and protected routes. It also includes a fully functional **Email Dashboard Mockup** with a responsive 3-column layout.

**Live Demo:** [https://ga03.pages.dev/](https://ga03.pages.dev/)

**Video:** [https://www.youtube.com/watch?v=qEauTn9UY50](https://www.youtube.com/watch?v=qEauTn9UY50)

## ✨ Key Features

- **Secure Authentication**:
  - Email & Password login with client-side validation (`react-hook-form` + `zod`).
  - Google Sign-In (OAuth 2.0) integration.
- **Robust Token Management**:
  - In-memory storage for access tokens to mitigate XSS risks.
  - Persistent refresh tokens in `localStorage` for a seamless user experience across sessions.
  - Automatic token refresh on expiry without interrupting the user.
- **Advanced API Client**:
  - Axios-based client with interceptors for automatically attaching bearer tokens.
  - Built-in request queuing to handle concurrent API calls during token refresh, preventing race conditions.
- **Email Dashboard Mockup**:
  - **3-Column Layout**: Mailboxes (Folders), Email List, and Email Detail view.
  - **Responsive Design**: Adapts seamlessly from desktop (3 columns) to tablet (2 columns) and mobile (1 column with navigation).
  - **Mock Data API**: Realistic simulation of email data fetching with latency.
- **Protected Routes**:
  - Client-side routing with `react-router-dom`.
  - `PrivateRoute` component to guard routes and redirect unauthenticated users.
- **Modern Tech Stack**:
  - **Framework**: React & Vite
  - **Language**: TypeScript
  - **Styling**: Tailwind CSS & shadcn/ui
  - **State Management**: Zustand
  - **Data Fetching**: React Query
  - **Forms**: React Hook Form & Zod

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/installation) (or npm/yarn)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/AdvWeeb/ga03.git
    cd ga03
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    Create a `.env` file in the root of the project and add your Google Client ID.
    ```env
    VITE_GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
    ```

### Running the Development Server

Start the Vite development server. The app will be available at `http://localhost:5173`.

```bash
npm dev
```

### Building for Production

To create a production-ready build, run:

```bash
npm build
```

This will generate a `dist` directory with the optimized and minified assets.

## 🔐 Authentication Flow Explained

This project implements a token-based authentication strategy that is both secure and user-friendly.

1.  **Login**: The user logs in via email/password or Google. The mock backend returns an `accessToken` and a `refreshToken`.
2.  **Token Storage**:
    - The `accessToken` is stored **in-memory** (using a Zustand store). This is the most secure place on the client, as it's inaccessible to XSS attacks.
    - The `refreshToken` is stored in **`localStorage`**. This allows the session to persist across page reloads.
3.  **Authenticated Requests**: For every API request, the `accessToken` is attached to the `Authorization` header.
4.  **Token Expiry & Refresh**:
    - When the `accessToken` expires, the API returns a `401 Unauthorized` error.
    - An Axios interceptor catches this error, pauses all new requests, and uses the `refreshToken` to request a new `accessToken`.
    - Once the new token is received, it's updated in the store, and all queued requests are automatically retried.
5.  **Logout**: Both the in-memory `accessToken` and the `refreshToken` in `localStorage` are cleared, and the user is redirected to the login page.

### Why use `localStorage` for the Refresh Token?

For this application, `localStorage` was chosen to provide a persistent session across browser tabs and reloads, which is a common UX expectation.

-   **Benefit**: A user who closes their browser and returns later will still be logged in.
-   **Security Note**: While `localStorage` is vulnerable to XSS attacks, the risk is mitigated because the short-lived `accessToken` is stored in memory. An attacker stealing a refresh token would still need to exchange it for an access token, a process that can be monitored and rate-limited on the backend. For production-grade security, storing refresh tokens in a secure, `HttpOnly` cookie is the recommended best practice.

## 📁 Project Structure

```
/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── dashboard/      # Dashboard components (MailboxList, EmailList, EmailDetail)
│   │   ├── ui/             # shadcn/ui components
│   │   ├── Navigation.tsx
│   │   └── PrivateRoute.tsx
│   ├── hooks/
│   │   ├── useAuth.ts      # Auth hooks
│   │   └── useEmail.ts     # Email data hooks
│   ├── lib/
│   ├── pages/
│   │   ├── Dashboard.tsx   # Landing page
│   │   ├── Inbox.tsx       # Main Email Dashboard
│   │   └── Login.tsx
│   ├── schemas/
│   │   └── loginSchema.ts
│   ├── services/
│   │   ├── apiClient.ts    # Axios client with interceptors
│   │   ├── mockAuthApi.ts  # Mock Auth API
│   │   └── mockEmailApi.ts # Mock Email API & Data
│   ├── store/
│   │   └── authStore.ts    # Zustand store
│   └── types/
│       └── email.ts        # Type definitions
├── .env.example
├── index.html
├── package.json
└── tsconfig.json
```
