import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useStore } from "../hooks/useStore";
import Loading from "./Loading";

export default function PublicRoute() {
  const { user, isAuthInitialized } = useStore();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  // Show loading state while auth is initializing
  if (!isAuthInitialized) {
    return <Loading />;
  }

  // Redirect to home or previous location if user is authenticated
  if (user) {
    return <Navigate to={from} replace />;
  }

  // Render child routes if not authenticated
  return <Outlet />;
}
