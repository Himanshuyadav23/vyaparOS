# Required Dependencies for MERN Stack Migration

## Install these packages:

```bash
npm install mongoose bcryptjs jsonwebtoken uuid
npm install -D @types/bcryptjs @types/jsonwebtoken @types/uuid
```

## Current Dependencies (from package-lock.json)

The project already has:
- next@14.2.5
- react@18.3.1
- react-dom@18.3.1
- tailwindcss
- lucide-react
- recharts
- date-fns
- clsx

## New Dependencies Needed

### Runtime Dependencies:
- **mongoose** - MongoDB ODM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT token generation/verification
- **uuid** - Generate unique IDs

### Development Dependencies:
- **@types/bcryptjs** - TypeScript types for bcryptjs
- **@types/jsonwebtoken** - TypeScript types for jsonwebtoken
- **@types/uuid** - TypeScript types for uuid

## Installation Command

Run this single command to install everything:

```bash
npm install mongoose bcryptjs jsonwebtoken uuid @types/bcryptjs @types/jsonwebtoken @types/uuid
```

## Optional: Remove Firebase Dependencies

If you want to clean up, you can remove:
- @supabase/ssr
- @supabase/supabase-js
- firebase (if installed)
- firebase-admin (if installed)

But keep them for now if you need to migrate data.








