# Security Features Documentation

This document outlines all security features implemented in VyaparOS.

## 🔒 Implemented Security Features

### 1. **Rate Limiting**
- **Purpose**: Prevents brute force attacks and API abuse
- **Implementation**: 
  - Login: 5 attempts per 15 minutes
  - Registration: 3 attempts per hour
  - API requests: 100 requests per minute
  - File uploads: 10 uploads per minute
- **Location**: `lib/security/rateLimiter.ts`
- **Usage**: Applied to authentication and upload endpoints

### 2. **Account Lockout**
- **Purpose**: Locks accounts after multiple failed login attempts
- **Implementation**:
  - Locks account after 5 failed attempts
  - Lockout duration: 15 minutes
  - Tracks attempts by email and IP address
- **Location**: `lib/security/accountLockout.ts`
- **Usage**: Integrated into login endpoint

### 3. **Input Validation & Sanitization**
- **Purpose**: Prevents XSS, NoSQL injection, and validates user input
- **Features**:
  - String sanitization (removes HTML tags, JavaScript protocols)
  - Email validation and sanitization
  - Phone number validation (Indian format)
  - Password strength validation
  - MongoDB query sanitization
  - File name sanitization (prevents path traversal)
  - URL validation
- **Location**: `lib/security/validator.ts`
- **Usage**: Applied to all API endpoints that accept user input

### 4. **Password Strength Requirements**
- **Requirements**:
  - Minimum 8 characters
  - Maximum 128 characters
  - At least one lowercase letter
  - At least one uppercase letter
  - At least one number
  - At least one special character
  - Cannot contain common weak passwords
- **Location**: `lib/security/validator.ts`
- **Usage**: Applied during user registration

### 5. **Security Headers**
- **Purpose**: Protects against common web vulnerabilities
- **Headers Implemented**:
  - `Content-Security-Policy`: Prevents XSS attacks
  - `X-XSS-Protection`: Additional XSS protection
  - `X-Content-Type-Options`: Prevents MIME type sniffing
  - `X-Frame-Options`: Prevents clickjacking
  - `Referrer-Policy`: Controls referrer information
  - `Permissions-Policy`: Restricts browser features
  - `Strict-Transport-Security`: Enforces HTTPS (production only)
- **Location**: `lib/security/headers.ts`, `middleware.ts`
- **Usage**: Applied to all responses via Next.js middleware

### 6. **CORS Configuration**
- **Purpose**: Controls cross-origin requests
- **Implementation**:
  - Configurable allowed origins via `ALLOWED_ORIGINS` environment variable
  - Default: `localhost:3000` and `vyapar-os.vercel.app`
- **Location**: `lib/security/headers.ts`
- **Usage**: Applied to all API responses

### 7. **File Upload Security**
- **Protections**:
  - File type validation (images only: jpg, jpeg, png, gif, webp)
  - File size limit (5MB maximum)
  - Path traversal prevention
  - Filename sanitization
  - Collection name validation
  - Rate limiting (10 uploads per minute)
- **Location**: `app/api/upload/route.ts`
- **Usage**: Applied to file upload endpoint

### 8. **JWT Security**
- **Features**:
  - Token expiration (default: 7 days)
  - Secret key validation (minimum 32 characters in production)
  - Secure token generation and verification
- **Location**: `lib/auth/jwt.ts`
- **Configuration**: 
  - `JWT_SECRET`: Must be set in production (min 32 chars)
  - `JWT_EXPIRES_IN`: Token expiration time (default: 7d)

### 9. **Environment Variable Validation**
- **Purpose**: Ensures required environment variables are set and valid
- **Validated Variables**:
  - `MONGODB_URI`: Must be a valid MongoDB connection string
  - `JWT_SECRET`: Must be at least 32 characters (production)
  - `NODE_ENV`: Must be development, production, or test
- **Location**: `lib/security/env.ts`
- **Usage**: Validates on application startup (production only)

### 10. **Authentication Middleware**
- **Purpose**: Protects API routes requiring authentication
- **Features**:
  - JWT token verification
  - User context injection
  - Optional authentication support
- **Location**: `lib/middleware/auth.ts`
- **Usage**: Applied to protected API routes

## 🛡️ Security Best Practices

### For Developers

1. **Always sanitize user input** before storing in database
   ```typescript
   import { sanitizeString, sanitizeEmail } from '@/lib/security/validator';
   const cleanInput = sanitizeString(userInput);
   ```

2. **Use rate limiting** on sensitive endpoints
   ```typescript
   import { loginRateLimiter, getClientIdentifier } from '@/lib/security/rateLimiter';
   const clientId = getClientIdentifier(req);
   const result = loginRateLimiter.check(clientId, '/api/endpoint');
   ```

3. **Validate passwords** during registration
   ```typescript
   import { validatePasswordStrength } from '@/lib/security/validator';
   const validation = validatePasswordStrength(password);
   if (!validation.valid) {
     // Handle errors
   }
   ```

4. **Check account lockout** before authentication
   ```typescript
   import { accountLockout, getLockoutIdentifier } from '@/lib/security/accountLockout';
   const lockoutId = getLockoutIdentifier(email, ip);
   const status = accountLockout.isLocked(lockoutId);
   ```

### Environment Variables

Required environment variables for production:

```env
# Required
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secure-random-string-min-32-chars

# Optional
JWT_EXPIRES_IN=7d
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Security Checklist

- [x] Rate limiting on authentication endpoints
- [x] Account lockout after failed attempts
- [x] Input validation and sanitization
- [x] Password strength requirements
- [x] Security headers (CSP, XSS protection, etc.)
- [x] CORS configuration
- [x] File upload security
- [x] JWT secret validation
- [x] Environment variable validation
- [x] Path traversal prevention
- [x] NoSQL injection prevention
- [x] XSS protection

## 🔍 Security Monitoring

### Logging
- Failed login attempts are logged
- Rate limit violations are logged
- Account lockouts are logged

### Recommendations
1. Set up monitoring for:
   - Multiple failed login attempts
   - Rate limit violations
   - Account lockouts
   - Unusual API activity

2. Regular security audits:
   - Review authentication logs
   - Check for suspicious patterns
   - Update dependencies regularly

## 🚨 Security Incident Response

If you suspect a security breach:

1. **Immediately**:
   - Review authentication logs
   - Check for unusual API activity
   - Review account lockout records

2. **Actions**:
   - Reset affected user passwords
   - Review and rotate JWT_SECRET if compromised
   - Check for unauthorized data access
   - Review file uploads for malicious content

3. **Prevention**:
   - Ensure all security features are enabled
   - Keep dependencies updated
   - Regular security audits
   - Monitor logs for suspicious activity

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [MongoDB Security Checklist](https://www.mongodb.com/docs/manual/administration/security-checklist/)

## 🔄 Updates

This security implementation is continuously improved. Check this document regularly for updates.

---

**Last Updated**: January 2025
**Version**: 1.0
