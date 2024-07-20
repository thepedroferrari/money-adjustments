import { doc, getDoc } from "firebase/firestore";
import React, { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { auth, firebaseDb } from "./firebaseConfig";
import { useStore } from "./hooks/useStore";
import { isValidEmail } from "./utils/isValidEmail";
import { router } from "./router";

const App: React.FC = () => {
  const { setUser } = useStore();

  useEffect(() => {
    const checkAuthState = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDoc = await getDoc(doc(firebaseDb, "users", currentUser.uid));
        const groups = userDoc.data()?.groups || [];
        const userEmail = currentUser.email;
        if (!isValidEmail(userEmail)) {
          console.error("Invalid email in auth state check");
          return;
        }
        setUser({ uid: currentUser.uid, email: userEmail, groups });
      }
    };
    checkAuthState();
  }, [setUser]);

  return <RouterProvider router={router} />;
};

export default App;
