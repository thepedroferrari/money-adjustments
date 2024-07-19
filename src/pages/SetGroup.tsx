// src/pages/SetGroup.tsx
import React, { useState } from "react";
import { useStore } from "../hooks/useStore";
import { useNavigate } from "react-router-dom";
import { setGroup } from "../utils/firebaseFunctions";

const SetGroup: React.FC = () => {
  const [groupId, setGroupId] = useState("");
  const setUserGroup = useStore((state) => state.setUser);
  const user = useStore((state) => state.user);
  const navigate = useNavigate();

  const handleSetGroup = async () => {
    if (user && groupId) {
      try {
        await setGroup(groupId, user.uid);
        setUserGroup(user, [...(user.groups || []), groupId]);
        navigate("/group-overview");
      } catch (error) {
        console.error("Error setting group:", error);
      }
    }
  };

  return (
    <div>
      <h2>Set or Join a Group</h2>
      <input
        type="text"
        placeholder="Group Name"
        value={groupId}
        onChange={(e) => setGroupId(e.target.value)}
      />
      <button onClick={handleSetGroup}>Set Group</button>
    </div>
  );
};

export default SetGroup;
