import React, { useState } from "react";
import { useStore } from "../hooks/useStore";
import { useNavigate } from "react-router-dom";

const Signup: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [groupIds, setGroupIds] = useState<string[]>([""]);
  const signUpWithEmail = useStore((state) => state.signUpWithEmail);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    await signUpWithEmail(email, password, groupIds);
    navigate("/");
  };

  const handleGroupChange = (index: number, value: string) => {
    const newGroupIds = [...groupIds];
    newGroupIds[index] = value;
    setGroupIds(newGroupIds);
  };

  const addGroupField = () => {
    setGroupIds([...groupIds, ""]);
  };

  return (
    <div>
      <h2>Signup</h2>
      <form onSubmit={handleSignup}>
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
        {groupIds.map((groupId, index) => (
          <input
            key={index}
            type="text"
            placeholder="Group Name"
            value={groupId}
            onChange={(e) => handleGroupChange(index, e.target.value)}
          />
        ))}
        <button type="button" onClick={addGroupField}>
          Add Group
        </button>
        <button type="submit">Signup</button>
      </form>
    </div>
  );
};

export default Signup;
