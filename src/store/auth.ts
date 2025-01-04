// src/store/auth.ts
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { StateCreator } from "zustand";
import { auth, firebaseDb, googleProvider } from "../firebaseConfig";
import { User } from "../types";
import { isValidEmail } from "../utils/isValidEmail";
import { useStore } from "../hooks/useStore";
import { setGroup, saveUserProfile } from "../utils/firebaseFunctions";

export interface AuthState {
  user: User | null;
  groups: string[] | null;
  isAuthInitialized: boolean;
  setUser: (user: User | null, groups?: string[] | null) => void;
  setAuthInitialized: (initialized: boolean) => void;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    groupIds: string[],
  ) => Promise<void>;
  logout: () => Promise<void>;
}

export const createAuthSlice: StateCreator<AuthState> = (set) => ({
  user: null,
  groups: null,
  isAuthInitialized: false,
  setUser: (user, groups = null) => set(() => ({ user, groups })),
  setAuthInitialized: (initialized) =>
    set(() => ({ isAuthInitialized: initialized })),
  signInWithEmail: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const userDoc = await getDoc(
        doc(firebaseDb, "users", userCredential.user.uid),
      );
      const groups = userDoc.data()?.groups || [];
      const userEmail = userCredential.user.email;
      if (!isValidEmail(userEmail)) {
        throw new Error("Invalid email");
      }
      set(() => ({
        user: { uid: userCredential.user.uid, email: userEmail, groups },
        groups,
      }));
    } catch (error) {
      console.error("Error signing in with email:", error);
    }
  },
  signInWithGoogle: async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userDoc = await getDoc(doc(firebaseDb, "users", user.uid));
      const groups = userDoc.data()?.groups || [];
      const userEmail = user.email;
      if (!isValidEmail(userEmail)) {
        throw new Error("Invalid email");
      }
      set(() => ({
        user: { uid: user.uid, email: userEmail, groups },
        groups,
      }));
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  },
  signUpWithEmail: async (email, password, groupIds) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await saveUserProfile(userCredential.user.uid, {
        userName: email.split("@")[0], // Placeholder for username
        groups: groupIds,
        picture: "",
        email: userCredential.user.email,
        disabledList: [],
      });
      for (const groupId of groupIds) {
        await setGroup(groupId, userCredential.user.uid);
      }
      const userEmail = userCredential.user.email;
      if (!isValidEmail(userEmail)) {
        throw new Error("Invalid email");
      }
      set(() => ({
        user: {
          uid: userCredential.user.uid,
          email: userEmail,
          groups: groupIds,
        },
        groups: groupIds,
      }));
    } catch (error) {
      console.error("Error signing up with email:", error);
    }
  },
  logout: async () => {
    await signOut(auth);
    set(() => ({ user: null, groups: null }));
  },
});

// Listen for auth state changes
onAuthStateChanged(auth, async (user) => {
  const { setUser, setAuthInitialized } = useStore.getState();

  try {
    if (user) {
      const userDoc = await getDoc(doc(firebaseDb, "users", user.uid));
      const groups = userDoc.data()?.groups || [];
      const userEmail = user.email;
      if (!isValidEmail(userEmail)) {
        console.error("Invalid email in auth state change");
        setUser(null, null);
      } else {
        setUser({ uid: user.uid, email: userEmail, groups }, groups);
      }
    } else {
      setUser(null, null);
    }
  } catch (error) {
    console.error("Error in auth state change:", error);
    setUser(null, null);
  } finally {
    setAuthInitialized(true);
  }
});
