import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useStore } from "../hooks/useStore";
import Loading from "./Loading";

export default function ProtectedRoute() {
  const { user, isAuthInitialized } = useStore();
  const location = useLocation();

  // Show loading state while auth is initializing
  if (!isAuthInitialized) {
    return <Loading />;
  }

  // Redirect to login if user is not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render child routes if authenticated
  return <Outlet />;
}
