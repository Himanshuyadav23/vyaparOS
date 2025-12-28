# VyaparOS Project Structure

This document outlines the project structure as requested.

## Folder Structure

```
vyaparOS/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/          # Protected dashboard pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   └── layout/            # Layout components
│       ├── AppLayout.tsx      # Main app layout with sidebar + header
│       └── ProtectedLayout.tsx # Protected route wrapper
├── context/               # React Context providers
│   └── AuthContext.tsx   # Authentication context
├── lib/                   # Utility libraries
│   └── firebase.ts       # Firebase Client & Admin SDK setup
└── types/                 # TypeScript type definitions
```

## Key Files

### `lib/firebase.ts`
- Firebase Client SDK initialization (for browser)
- Firebase Admin SDK setup (for server-side)
- Exports: `app`, `auth`, `db`, `storage` (client)
- Admin SDK available via `lib/firebase-admin.ts`

### `context/AuthContext.tsx`
- Authentication context provider
- Manages user authentication state
- Exports: `AuthProvider`, `useAuth` hook

### `components/layout/ProtectedLayout.tsx`
- Wraps protected routes
- Redirects unauthenticated users to login
- Shows loading state during auth check

### `components/layout/AppLayout.tsx`
- Main application layout
- Sidebar navigation (mobile + desktop)
- Header with user info
- Logout functionality

## Environment Variables

Required in `.env.local`:

```env
# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Firebase Admin SDK (optional, for server-side operations)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

## Usage

### Using Auth Context

```tsx
import { useAuth } from "@/context/AuthContext";

function MyComponent() {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not authenticated</div>;
  
  return <div>Welcome, {user.email}</div>;
}
```

### Protected Routes

```tsx
// app/dashboard/layout.tsx
import ProtectedLayout from "@/components/layout/ProtectedLayout";
import AppLayout from "@/components/layout/AppLayout";

export default function Layout({ children }) {
  return (
    <ProtectedLayout>
      <AppLayout>{children}</AppLayout>
    </ProtectedLayout>
  );
}
```

### Using Firebase Client SDK

```tsx
import { auth, db, storage } from "@/lib/firebase";
// Use in client components only
```

### Using Firebase Admin SDK

```tsx
// In API routes or server components
import { getAdminApp } from "@/lib/firebase-admin";

const { adminAuth, adminDb } = getAdminApp();
// Use for server-side operations
```

## Installation

```bash
npm install
```

This will install:
- Next.js 14
- Firebase Client SDK
- Firebase Admin SDK
- Tailwind CSS
- Other dependencies

## Development

```bash
npm run dev
```

Visit http://localhost:3000



