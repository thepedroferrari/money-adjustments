// src/store/userGroup.ts
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { StateCreator } from "zustand";
import { firebaseDb } from "../firebaseConfig";
import { Expense, User } from "../types";

export interface UserGroupState {
  user: User | null;
  groups: string[] | null;
  expenses: { [key: string]: Expense[] } | null;
  setUser: (user: User | null, groups?: string[] | null) => void;
  setExpenses: (expenses: { [key: string]: Expense[] }) => void;
  fetchExpenses: (groupId: string) => Promise<void>;
  addExpense: (groupId: string, expenseName: string, expense: Expense) => void;
  updateExpense: (
    groupId: string,
    expenseName: string,
    index: number,
    expense: Expense,
  ) => void;
  deleteExpense: (groupId: string, expenseName: string, index: number) => void;
}

export const createUserGroupSlice: StateCreator<UserGroupState> = (
  set,
  get,
) => ({
  user: null,
  groups: null,
  expenses: null,
  setUser: (user, groups = null) => set({ user, groups }),
  setExpenses: (expenses) => set({ expenses }),
  fetchExpenses: async (groupId) => {
    const expensesRef = collection(firebaseDb, `groups/${groupId}/expenses`);
    const expensesSnapshot = await getDocs(expensesRef);
    const expensesData: { [key: string]: Expense[] } = {};
    expensesSnapshot.forEach((doc) => {
      const expenseData = doc.data();
      expensesData[doc.id] = expenseData.expenses || [];
    });

    set({ expenses: expensesData });
  },
  addExpense: async (groupId, expenseName, expense) => {
    const { expenses } = get();
    const updatedExpenses = {
      ...expenses,
      [expenseName]: [...(expenses?.[expenseName] || []), expense],
    };
    set({ expenses: updatedExpenses });
    await updateDoc(
      doc(firebaseDb, `groups/${groupId}/expenses`, expenseName),
      { expenses: updatedExpenses[expenseName] }, // update only the specific expenseName document
    );
  },
  updateExpense: async (groupId, expenseName, index, updatedExpense) => {
    const { expenses } = get();
    const updatedExpenses = {
      ...expenses,
      [expenseName]:
        expenses?.[expenseName]?.map((expense, i) =>
          i === index ? updatedExpense : expense,
        ) || [], // default to an empty array if expenses[expenseName] is undefined
    };
    set({ expenses: updatedExpenses });
    await updateDoc(
      doc(firebaseDb, `groups/${groupId}/expenses`, expenseName),
      { expenses: updatedExpenses[expenseName] }, // update only the specific expenseName document
    );
  },
  deleteExpense: async (groupId, expenseName, index) => {
    const { expenses } = get();
    const updatedExpenses = {
      ...expenses,
      [expenseName]:
        expenses?.[expenseName]?.filter((_, i) => i !== index) || [], // default to an empty array if expenses[expenseName] is undefined
    };
    set({ expenses: updatedExpenses });
    await updateDoc(
      doc(firebaseDb, `groups/${groupId}/expenses`, expenseName),
      { expenses: updatedExpenses[expenseName] }, // update only the specific expenseName document
    );
  },
});
