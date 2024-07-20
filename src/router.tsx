import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/Layout";
import Loading from "./components/Loading";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import { expensesLoader } from "./loaders/expensesLoader";

const AcceptInvitation = lazy(() => import("./pages/AcceptInvitation"));
const ExpensesTable = lazy(() => import("./pages/ExpensesTable"));
const GroupOverview = lazy(() => import("./pages/GroupOverview"));
const InviteMember = lazy(() => import("./pages/InviteMember"));
const Login = lazy(() => import("./pages/Login"));
const SetGroup = lazy(() => import("./pages/SetGroup"));
const Signup = lazy(() => import("./pages/Signup"));
const UserProfile = lazy(() => import("./pages/UserProfile"));

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />} errorElement={<ErrorBoundary />}>
      <Route element={<ProtectedRoute />}>
        <Route
          index
          element={
            <Suspense fallback={<Loading />}>
              <GroupOverview />
            </Suspense>
          }
        />
        <Route
          path="group-overview"
          element={
            <Suspense fallback={<Loading />}>
              <GroupOverview />
            </Suspense>
          }
        />
        <Route
          path="set-group"
          element={
            <Suspense fallback={<Loading />}>
              <SetGroup />
            </Suspense>
          }
        />
        <Route
          path="user/:userId"
          element={
            <Suspense fallback={<Loading />}>
              <UserProfile />
            </Suspense>
          }
        />
        <Route
          path="group/:groupId/expenses/:expenseName"
          element={
            <Suspense fallback={<Loading />}>
              <ExpensesTable />
            </Suspense>
          }
          loader={expensesLoader}
        />
        <Route
          path="group/:groupId/invite"
          element={
            <Suspense fallback={<Loading />}>
              <InviteMember />
            </Suspense>
          }
        />
        <Route
          path="invitation/:invitationId"
          element={
            <Suspense fallback={<Loading />}>
              <AcceptInvitation />
            </Suspense>
          }
        />
      </Route>
      <Route path="/login" element={<PublicRoute />}>
        <Route
          index
          element={
            <Suspense fallback={<Loading />}>
              <Login />
            </Suspense>
          }
        />
      </Route>
      <Route path="/signup" element={<PublicRoute />}>
        <Route
          index
          element={
            <Suspense fallback={<Loading />}>
              <Signup />
            </Suspense>
          }
        />
      </Route>
    </Route>,
  ),
);
