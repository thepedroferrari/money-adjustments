import React, { useEffect } from "react";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { auth, firebaseDb } from "./firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useStore } from "./hooks/useStore";
import GroupOverview from "./pages/GroupOverview";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Layout from "./components/Layout";
import SetGroup from "./pages/SetGroup";
import ExpensesTable from "./pages/ExpensesTable";
import UserProfile from "./pages/UserProfile";
import InviteMember from "./pages/InviteMember";
import AcceptInvitation from "./pages/AcceptInvitation";
import { isValidEmail } from "./utils/isValidEmail";

const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({
  element,
}) => {
  const user = useStore((state) => state.user);
  const groups = useStore((state) => state.groups);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!groups || groups.length === 0) {
    return <Navigate to="/set-group" />;
  }

  return element;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <ProtectedRoute element={<GroupOverview />} />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "signup",
        element: <Signup />,
      },
      {
        path: "group-overview",
        element: <ProtectedRoute element={<GroupOverview />} />,
      },
      {
        path: "set-group",
        element: <SetGroup />,
      },
      {
        path: "user/:userId",
        element: <ProtectedRoute element={<UserProfile />} />,
      },
      {
        path: "group/:groupId/expenses/:expenseName",
        element: <ProtectedRoute element={<ExpensesTable />} />,
      },
      {
        path: "group/:groupId/invite",
        element: <ProtectedRoute element={<InviteMember />} />,
      },
      {
        path: "invitation/:invitationId",
        element: <ProtectedRoute element={<AcceptInvitation />} />,
      },
    ],
  },
]);

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
