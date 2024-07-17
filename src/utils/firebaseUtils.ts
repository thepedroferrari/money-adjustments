import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, firebaseDb } from "../firebaseConfig";

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
};

export const logout = async () => {
  await signOut(auth);
};

export const createGroup = async (groupId: string, groupName: string) => {
  await setDoc(doc(firebaseDb, groupId), {
    group_settings: {
      group_name: groupName,
      disabledList: [],
    },
    expenses: {},
  });
};
