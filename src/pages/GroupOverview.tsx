// src/pages/GroupOverview.tsx
import React, { useEffect, useState } from "react";
import { useStore } from "../hooks/useStore";
import { Link } from "react-router-dom";
import { getDocs, collection } from "firebase/firestore";
import { firebaseDb } from "../firebaseConfig";
import { addExpenseSet } from "../utils/firebaseFunctions";
import InviteMember from "./InviteMember";
import "./GroupOverview.css";

const GroupOverview: React.FC = () => {
  const user = useStore((state) => state.user);
  const [groupExpenses, setGroupExpenses] = useState<
    { groupId: string; expenses: string[] }[]
  >([]);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [newExpenseId, setNewExpenseId] = useState<string>("");

  useEffect(() => {
    const fetchGroupsAndExpenses = async () => {
      if (user) {
        try {
          const groupData = await Promise.all(
            user.groups.map(async (groupId: string) => {
              const expensesSnapshot = await getDocs(
                collection(firebaseDb, "groups", groupId, "expenses"),
              );
              const expenseNames = expensesSnapshot.docs.map((doc) => doc.id);
              return { groupId, expenses: expenseNames };
            }),
          );
          setGroupExpenses(groupData);
        } catch (error) {
          console.error("Error fetching groups and expenses:", error);
        }
      }
    };

    fetchGroupsAndExpenses();
  }, [user]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroup(expandedGroup === groupId ? null : groupId);
  };

  const handleAddExpenseId = async (groupId: string) => {
    if (newExpenseId.trim() === "") return;
    try {
      await addExpenseSet(groupId, newExpenseId);
      setNewExpenseId("");
      if (!user) throw new Error("User not found");

      // Refresh the list of expenses for this group
      const updatedGroupExpenses = await Promise.all(
        user.groups.map(async (groupId: string) => {
          const expensesSnapshot = await getDocs(
            collection(firebaseDb, "groups", groupId, "expenses"),
          );
          const expenseNames = expensesSnapshot.docs.map((doc) => doc.id);
          return { groupId, expenses: expenseNames };
        }),
      );
      setGroupExpenses(updatedGroupExpenses);
    } catch (error) {
      console.error("Error adding new expense ID:", error);
    }
  };

  if (!groupExpenses.length) {
    return <div>Loading group and expense information...</div>;
  }

  return (
    <>
      <h2>Group Overview</h2>
      <dl className="group-overview-sections">
        {groupExpenses.map(({ groupId, expenses }, index) => (
          <div key={groupId} className="group-overview-section">
            <dt>
              <details
                open={
                  expandedGroup === groupId ||
                  (index === 0 && expandedGroup === null)
                }
                onClick={() => toggleGroup(groupId)}
              >
                <summary>{groupId}</summary>
                <dd>
                  <h4>Expenses</h4>
                  <ul>
                    {expenses.map((expenseName) => (
                      <li key={expenseName}>
                        <Link to={`/group/${groupId}/expenses/${expenseName}`}>
                          {expenseName}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div>
                    <input
                      type="text"
                      placeholder="New Expense Set"
                      value={newExpenseId}
                      onChange={(e) => setNewExpenseId(e.target.value)}
                    />
                    <button onClick={() => handleAddExpenseId(groupId)}>
                      Add Expense Set
                    </button>
                  </div>

                  <h4>Other Features</h4>
                  <ul>
                    <li>
                      <Link to={`/group/${groupId}/feature1`}>Feature 1</Link>
                    </li>
                    <li>
                      <Link to={`/group/${groupId}/feature2`}>Feature 2</Link>
                    </li>
                    <li>
                      <Link to={`/group/${groupId}/feature3`}>Feature 3</Link>
                    </li>
                  </ul>

                  <h4>Invite Members</h4>
                  <InviteMember groupId={groupId} />
                </dd>
              </details>
            </dt>
          </div>
        ))}
      </dl>
    </>
  );
};

export default GroupOverview;
