// Firebase Admin SDK (for server-side only)
// This file should only be imported in server components/API routes

let adminApp: any = null;
let adminAuth: any = null;
let adminDb: any = null;

export function getAdminApp() {
  if (typeof window !== "undefined") {
    throw new Error("Firebase Admin can only be used on the server");
  }

  if (adminApp) {
    return { adminApp, adminAuth, adminDb };
  }

  try {
    const admin = require("firebase-admin");
    const { initializeApp: initializeAdminApp, getApps: getAdminApps, cert } = admin;
    const { getAuth: getAdminAuth } = require("firebase-admin/auth");
    const { getFirestore: getAdminFirestore } = require("firebase-admin/firestore");

    // Check if we have service account credentials
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      : null;

    if (serviceAccount) {
      adminApp =
        getAdminApps().length === 0
          ? initializeAdminApp({
              credential: cert(serviceAccount),
              projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            })
          : getAdminApps()[0];
    } else if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      // Fallback: Use default credentials
      adminApp =
        getAdminApps().length === 0
          ? initializeAdminApp({
              projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            })
          : getAdminApps()[0];
    }

    if (adminApp) {
      adminAuth = getAdminAuth(adminApp);
      adminDb = getAdminFirestore(adminApp);
    }
  } catch (error) {
    console.warn("Firebase Admin not initialized:", error);
  }

  return { adminApp, adminAuth, adminDb };
}



