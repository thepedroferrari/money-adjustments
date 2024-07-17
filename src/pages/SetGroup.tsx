import React, { useState } from "react";
import { useStore } from "../hooks/useStore";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, collection } from "firebase/firestore";
import { firebaseDb } from "../firebaseConfig";

const SetGroup: React.FC = () => {
  const [groupId, setGroupId] = useState("");
  const setUserGroup = useStore((state) => state.setUser);
  const user = useStore((state) => state.user);
  const navigate = useNavigate();

  const handleSetGroup = async () => {
    if (user && groupId) {
      const groupRef = doc(firebaseDb, "groups", groupId);
      const groupDoc = await getDoc(groupRef);

      if (!groupDoc.exists()) {
        // Create the group if it doesn't exist
        await setDoc(groupRef, {
          group_name: groupId,
          members: [user.uid],
        });

        // Create the expenses sub-collection
        const expensesRef = collection(
          firebaseDb,
          `groups/${groupId}/expenses`,
        );
        // Add an empty document to initialize the sub-collection
        await setDoc(doc(expensesRef, "init"), {});
      } else {
        // If the group exists, add the user to the members list if not already present
        const groupData = groupDoc.data();
        if (groupData && !groupData.members.includes(user.uid)) {
          await setDoc(
            groupRef,
            { members: [...groupData.members, user.uid] },
            { merge: true },
          );
        }
      }

      // Set the group for the user
      await setDoc(
        doc(firebaseDb, "users", user.uid),
        { groups: [groupId] },
        { merge: true },
      );
      setUserGroup(user, [groupId]);
      navigate("/dashboard");
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
