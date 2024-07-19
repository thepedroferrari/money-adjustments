import React, { useEffect, useState } from "react";
import { useStore } from "../hooks/useStore";
import { Link } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { firebaseDb } from "../firebaseConfig";

interface Invitation {
  id: string;
  groupId: string;
  invitedBy: string;
  email: string;
  status: string;
}

const Invitations: React.FC = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const user = useStore((state) => state.user);

  useEffect(() => {
    const fetchInvitations = async () => {
      if (user) {
        const invitationsRef = collection(firebaseDb, "invitations");
        const q = query(
          invitationsRef,
          where("email", "==", user.email),
          where("status", "==", "pending"),
        );
        const querySnapshot = await getDocs(q);
        const fetchedInvitations = querySnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as Invitation,
        );
        setInvitations(fetchedInvitations);
      }
    };

    fetchInvitations();
  }, [user]);

  if (invitations.length === 0) {
    return null;
  }

  return (
    <div className="invitations">
      <h4>Invitations</h4>
      <ul>
        {invitations.map((invitation) => (
          <li key={invitation.id}>
            <Link to={`/invitation/${invitation.id}`}>
              Join {invitation.groupId} (Invited by {invitation.invitedBy})
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Invitations;
