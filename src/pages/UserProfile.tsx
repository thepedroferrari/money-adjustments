// src/pages/UserProfile.tsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useStore } from "../hooks/useStore";
import { saveUserProfile } from "../utils/firebaseFunctions";
import { getDoc, doc } from "firebase/firestore";
import { firebaseDb } from "../firebaseConfig";

const UserProfile: React.FC = () => {
  const { userId: paramUserId } = useParams();
  const user = useStore((state) => state.user);
  // const groups = useStore((state) => state.groups);
  const userId = user?.uid || paramUserId;

  const [formData, setFormData] = useState({
    displayName: "",
    profilePicture: "",
    age: "",
    userGroups: [] as string[],
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        const userDoc = await getDoc(doc(firebaseDb, "users", userId));
        if (userDoc.exists()) {
          const data = userDoc.data() as {
            displayName: string;
            profilePicture: string;
            age: string;
            userGroups: string[];
          };
          setFormData({
            displayName: data.displayName || "",
            profilePicture: data.profilePicture || "",
            age: data.age || "",
            userGroups: data.userGroups || [],
          });
        }
      }
    };

    fetchUserData();
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "userGroups" ? value.split(",").map((g) => g.trim()) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userId) {
      try {
        await saveUserProfile(userId, formData);
      } catch (error) {
        console.error("Error saving user profile:", error);
      }
    }
  };

  return (
    <div>
      <h2>User Profile</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Display Name:</label>
          <input
            type="text"
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Profile Picture URL:</label>
          <input
            type="text"
            name="profilePicture"
            value={formData.profilePicture}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Age:</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>User Groups:</label>
          <input
            type="text"
            name="userGroups"
            value={formData.userGroups.join(", ")}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Save</button>
      </form>
    </div>
  );
};

export default UserProfile;
