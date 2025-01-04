import React, { useState } from "react";
import { useStore } from "../hooks/useStore";
import { useNavigate, useLocation } from "react-router-dom";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signInWithEmail, signInWithGoogle } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await signInWithEmail(email, password);
    navigate(from, { replace: true });
  };

  const handleGoogleLogin = async () => {
    await signInWithGoogle();
    navigate(from, { replace: true });
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleEmailLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login with Email</button>
      </form>
      <button onClick={handleGoogleLogin}>Login with Google</button>
    </div>
  );
};

export default Login;
