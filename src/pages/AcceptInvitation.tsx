import React, { useEffect, useState } from "react";
import { useStore } from "../hooks/useStore";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { firebaseDb } from "../firebaseConfig";

interface Invitation {
  groupId: string;
  invitedBy: string;
  email: string;
  status: string;
}

const AcceptInvitation: React.FC = () => {
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const user = useStore((state) => state.user);
  const { invitationId } = useParams<{ invitationId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvitation = async () => {
      if (invitationId) {
        const invitationRef = doc(firebaseDb, "invitations", invitationId);
        const invitationDoc = await getDoc(invitationRef);
        if (invitationDoc.exists()) {
          setInvitation(invitationDoc.data() as Invitation);
        }
      }
    };

    fetchInvitation();
  }, [invitationId]);

  const handleAccept = async () => {
    if (user && invitation) {
      const groupRef = doc(firebaseDb, "groups", invitation.groupId);
      await updateDoc(groupRef, {
        members: arrayUnion(user.uid),
      });

      await updateDoc(doc(firebaseDb, "users", user.uid), {
        groups: arrayUnion(invitation.groupId),
      });

      // Update the invitation status
      if (invitationId) {
        await updateDoc(doc(firebaseDb, "invitations", invitationId), {
          status: "accepted",
        });
      }

      navigate("/group-overview");
    }
  };

  if (!invitation) {
    return <div>Loading invitation...</div>;
  }

  return (
    <div>
      <h2>Accept Invitation</h2>
      <p>Group: {invitation.groupId}</p>
      <p>Invited By: {invitation.invitedBy}</p>
      <button onClick={handleAccept}>Accept Invitation</button>
    </div>
  );
};

export default AcceptInvitation;
