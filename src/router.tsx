import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import AcceptInvitation from "./pages/AcceptInvitation";
import ExpensesTable from "./pages/ExpensesTable";
import GroupOverview from "./pages/GroupOverview";
import InviteMember from "./pages/InviteMember";
import Login from "./pages/Login";
import SetGroup from "./pages/SetGroup";
import Signup from "./pages/Signup";
import UserProfile from "./pages/UserProfile";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <ProtectedRoute />,
        children: [
          { index: true, element: <GroupOverview /> },
          { path: "group-overview", element: <GroupOverview /> },
          { path: "set-group", element: <SetGroup /> },
          { path: "user/:userId", element: <UserProfile /> },
          {
            path: "group/:groupId/expenses/:expenseName",
            element: <ExpensesTable />,
          },
          { path: "group/:groupId/invite", element: <InviteMember /> },
          { path: "invitation/:invitationId", element: <AcceptInvitation /> },
        ],
      },
      {
        path: "/login",
        element: <PublicRoute />,
        children: [{ index: true, element: <Login /> }],
      },
      {
        path: "/signup",
        element: <PublicRoute />,
        children: [{ index: true, element: <Signup /> }],
      },
    ],
  },
]);
