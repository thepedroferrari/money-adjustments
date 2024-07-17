import React, { useEffect, useState } from "react";
import { useStore } from "../hooks/useStore";
import { Link } from "react-router-dom";

const Dashboard: React.FC = () => {
  const user = useStore((state) => state.user);
  const [groups, setGroups] = useState<string[]>([]);

  useEffect(() => {
    const fetchGroups = async () => {
      if (user) {
        setGroups(user.groups);
      }
    };

    fetchGroups();
  }, [user]);

  if (!groups.length) {
    return <div>Loading group information...</div>;
  }

  return (
    <div>
      <h2>Dashboard</h2>
      <div>
        <h3>Groups</h3>
        <ul>
          {groups.map((groupId) => (
            <li key={groupId}>
              <Link to={`/group/${groupId}/expenses`}>{groupId}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
