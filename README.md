# VyaparOS

An operating system for traditional wholesale textile markets - a production-grade MVP.

## Features

1. **Dead Stock Exchange** - Buy and sell excess inventory
2. **Digital Catalog + Smart Share** - Manage and share product catalogs
3. **Credit Ledger** - Track credits and payments between businesses
4. **Supplier Discovery** - Find and connect with verified suppliers
5. **Market Intelligence Dashboard** - Aggregated anonymized market signals and trends

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Storage**: Firebase Storage
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd vyaparOS
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Enable Firebase Storage
   - Copy your Firebase configuration

4. Create environment file:
```bash
cp .env.example .env.local
```

5. Add your Firebase configuration to `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

6. Deploy Firestore security rules:
   - Copy the contents of `firestore.rules`
   - Go to Firebase Console > Firestore Database > Rules
   - Paste and publish the rules

7. Run the development server:
```bash
npm run dev
```

8. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
vyaparOS/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard and feature pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── layout/           # Layout components
│   └── providers/       # Context providers
├── lib/                  # Utility libraries
│   ├── firebase/        # Firebase configuration
│   ├── services/        # Firestore service functions
│   └── utils.ts         # Utility functions
├── types/               # TypeScript type definitions
└── firestore.rules      # Firestore security rules
```

## Security

- Multi-tenant data isolation through Firestore security rules
- User authentication required for all operations
- Users can only access/modify their own data
- Market signals are read-only for regular users

## Features in Detail

### Dead Stock Exchange
- List excess inventory with pricing
- Search and filter available stock
- Track item status (available/reserved/sold)

### Digital Catalog
- Create and manage product catalogs
- Share catalog items via smart links
- Set pricing and minimum order quantities

### Credit Ledger
- Track credit transactions
- Monitor pending and paid amounts
- Set due dates and invoice numbers

### Supplier Discovery
- Search suppliers by category, location
- View supplier ratings and transaction history
- Add new suppliers to the network

### Market Intelligence
- View aggregated market signals
- Analyze trends with charts
- Filter by category and region

## Development

### Build for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Deployment

1. Build the project: `npm run build`
2. Deploy to Vercel, Netlify, or your preferred hosting platform
3. Ensure environment variables are set in your hosting platform
4. Deploy Firestore rules to Firebase

## License

Proprietary - All rights reserved



