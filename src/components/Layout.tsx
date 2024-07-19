import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useStore } from "../hooks/useStore";
import Invitations from "../pages/Invitations";
import "./Layout.css";

const Layout: React.FC = () => {
  const user = useStore((state) => state.user);
  const logout = useStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="app">
      <nav>
        <Link to="/">Home</Link>
        <ul></ul>
        {user ? (
          <div>
            <Link to={`/user/${user.uid}`}>{user.email.split("@")[0]}</Link>
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <div>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </div>
        )}
      </nav>
      {user && <Invitations />}
      <div className="content">
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
