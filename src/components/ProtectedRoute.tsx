import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useStore } from "../hooks/useStore";

const ProtectedRoute: React.FC = () => {
  const user = useStore((state) => state.user);
  const groups = useStore((state) => state.groups);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!groups || groups.length === 0) {
    return <Navigate to="/set-group" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
