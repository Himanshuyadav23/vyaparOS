/**
 * Account Lockout Utility
 * Prevents brute force attacks by locking accounts after failed login attempts
 */

interface LockoutEntry {
  attempts: number;
  lockedUntil: number | null;
  lastAttempt: number;
}

class AccountLockoutManager {
  private store: Map<string, LockoutEntry> = new Map();
  private readonly maxAttempts = 5;
  private readonly lockoutDuration = 15 * 60 * 1000; // 15 minutes
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes

  /**
   * Record a failed login attempt
   */
  recordFailedAttempt(identifier: string): {
    locked: boolean;
    remainingAttempts: number;
    lockedUntil: number | null;
  } {
    const now = Date.now();
    let entry = this.store.get(identifier);

    if (!entry) {
      entry = {
        attempts: 1,
        lockedUntil: null,
        lastAttempt: now,
      };
    } else {
      // Reset if window expired
      if (now - entry.lastAttempt > this.windowMs) {
        entry.attempts = 1;
        entry.lockedUntil = null;
      } else {
        entry.attempts++;
      }
      entry.lastAttempt = now;
    }

    // Lock account if max attempts reached
    if (entry.attempts >= this.maxAttempts && !entry.lockedUntil) {
      entry.lockedUntil = now + this.lockoutDuration;
    }

    this.store.set(identifier, entry);

    const isLocked = entry.lockedUntil !== null && now < entry.lockedUntil;
    const remainingAttempts = Math.max(0, this.maxAttempts - entry.attempts);

    return {
      locked: isLocked,
      remainingAttempts,
      lockedUntil: entry.lockedUntil,
    };
  }

  /**
   * Record a successful login attempt (reset counter)
   */
  recordSuccess(identifier: string): void {
    this.store.delete(identifier);
  }

  /**
   * Check if account is locked
   */
  isLocked(identifier: string): {
    locked: boolean;
    lockedUntil: number | null;
    remainingAttempts: number;
  } {
    const entry = this.store.get(identifier);
    
    if (!entry) {
      return {
        locked: false,
        lockedUntil: null,
        remainingAttempts: this.maxAttempts,
      };
    }

    const now = Date.now();
    const isLocked = entry.lockedUntil !== null && now < entry.lockedUntil;
    const remainingAttempts = Math.max(0, this.maxAttempts - entry.attempts);

    // Clean up if lockout expired
    if (entry.lockedUntil && now >= entry.lockedUntil) {
      this.store.delete(identifier);
      return {
        locked: false,
        lockedUntil: null,
        remainingAttempts: this.maxAttempts,
      };
    }

    return {
      locked: isLocked,
      lockedUntil: entry.lockedUntil,
      remainingAttempts,
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.store.entries());
    for (const [key, entry] of entries) {
      if (entry.lockedUntil && now >= entry.lockedUntil) {
        this.store.delete(key);
      } else if (now - entry.lastAttempt > this.windowMs * 2) {
        // Remove entries older than 2 windows
        this.store.delete(key);
      }
    }
  }
}

// Create singleton instance
export const accountLockout = new AccountLockoutManager();

// Clean up every 5 minutes
setInterval(() => accountLockout.cleanup(), 5 * 60 * 1000);

/**
 * Get identifier for account lockout (email or IP)
 */
export function getLockoutIdentifier(email?: string, ip?: string): string {
  return email ? `email:${email.toLowerCase()}` : `ip:${ip || 'unknown'}`;
}
