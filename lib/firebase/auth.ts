import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  linkWithCredential,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export const login = async (email: string, password: string) => {
  if (!auth) throw new Error("Auth not initialized");
  return await signInWithEmailAndPassword(auth, email, password);
};

export const register = async (email: string, password: string) => {
  if (!auth) throw new Error("Auth not initialized");
  return await createUserWithEmailAndPassword(auth, email, password);
};

export const logout = async () => {
  if (!auth) throw new Error("Auth not initialized");
  return await signOut(auth);
};

export const loginWithGoogle = async () => {
  if (!auth) throw new Error("Auth not initialized");
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: "select_account",
  });
  return await signInWithPopup(auth, provider);
};

export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !auth) {
      resolve(null);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

