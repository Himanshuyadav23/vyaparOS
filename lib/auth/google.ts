// Google OAuth client-side helper

export interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  emailVerified: boolean;
}

// Load Google OAuth script
export function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google OAuth script'));
    document.head.appendChild(script);
  });
}

// Initialize Google Sign-In
export async function initializeGoogleSignIn(
  clientId: string,
  callback: (response: any) => void
) {
  await loadGoogleScript();

  if (!window.google?.accounts) {
    throw new Error('Google OAuth script not loaded');
  }

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: callback,
  });
}

// Render Google Sign-In button
export function renderGoogleButton(
  elementId: string,
  onSuccess: (credential: string) => void,
  onError?: (error: Error) => void
) {
  if (!window.google?.accounts) {
    throw new Error('Google OAuth not initialized');
  }

  window.google.accounts.id.renderButton(
    document.getElementById(elementId),
    {
      theme: 'outline',
      size: 'large',
      width: '100%',
      text: 'signin_with',
    }
  );

  // Handle credential response
  window.google.accounts.id.prompt((notification: any) => {
    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
      // Auto sign-in was skipped
    }
  });
}

// Declare global types for Google OAuth
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: any) => void }) => void;
          renderButton: (element: HTMLElement | null, config: any) => void;
          prompt: (callback: (notification: any) => void) => void;
        };
      };
    };
  }
}

