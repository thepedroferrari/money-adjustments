// src/pages/InviteMember.tsx
import React, { useState } from "react";
import { useStore } from "../hooks/useStore";
import { useParams } from "react-router-dom";
import { inviteMember } from "../utils/firebaseFunctions";

interface InviteMemberProps {
  groupId?: string;
}

const InviteMember: React.FC<InviteMemberProps> = ({
  groupId: propGroupId,
}) => {
  const [email, setEmail] = useState("");
  const user = useStore((state) => state.user);
  const { groupId: paramGroupId } = useParams<{ groupId: string }>();
  const groupId = propGroupId || paramGroupId;

  const handleInvite = async () => {
    if (user && groupId) {
      try {
        await inviteMember(groupId, email, user.email);
        setEmail("");
      } catch (error) {
        console.error("Error inviting member:", error);
      }
    }
  };

  return (
    <div>
      <input
        type="email"
        placeholder="Member Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleInvite}>Send Invitation</button>
    </div>
  );
};

export default InviteMember;
