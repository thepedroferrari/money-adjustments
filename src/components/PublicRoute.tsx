import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useStore } from "../hooks/useStore";

const PublicRoute: React.FC = () => {
  const user = useStore((state) => state.user);

  if (user) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default PublicRoute;
