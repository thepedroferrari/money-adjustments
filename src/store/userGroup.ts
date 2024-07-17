// src/store/userGroup.ts
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { StateCreator } from "zustand";
import { firebaseDb } from "../firebaseConfig";
import { Expense, User } from "../types";

export interface UserGroupState {
  user: User | null;
  groups: string[] | null;
  expenses: { [groupId: string]: { [expenseName: string]: Expense[] } } | null;
  setUser: (user: User | null, groups?: string[] | null) => void;
  setExpenses: (expenses: {
    [groupId: string]: { [expenseName: string]: Expense[] };
  }) => void;
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
    const expensesData: { [expenseName: string]: Expense[] } = {};
    expensesSnapshot.forEach((doc) => {
      const expenseData = doc.data() as { [expenseName: string]: Expense[] };
      Object.keys(expenseData).forEach((expenseName) => {
        if (!expensesData[expenseName]) {
          expensesData[expenseName] = [];
        }
        expensesData[expenseName].push(...expenseData[expenseName]);
      });
    });

    set({ expenses: { [groupId]: expensesData } });
  },
  addExpense: async (groupId, expenseName, expense) => {
    const { expenses } = get();
    const updatedExpenses = {
      ...expenses,
      [groupId]: {
        ...expenses?.[groupId],
        [expenseName]: [...(expenses?.[groupId]?.[expenseName] || []), expense],
      },
    };
    set({ expenses: updatedExpenses });
    await updateDoc(
      doc(firebaseDb, `groups/${groupId}/expenses`, expenseName),
      {
        expenses: updatedExpenses[groupId][expenseName], // update only the specific expenseName document
      },
    );
  },
  updateExpense: async (groupId, expenseName, index, updatedExpense) => {
    const { expenses } = get();
    const groupExpenses = expenses?.[groupId] || {};
    const expenseList = groupExpenses[expenseName] || [];
    const updatedExpenseList = expenseList.map((expense, i) =>
      i === index ? updatedExpense : expense,
    );
    const updatedGroupExpenses = {
      ...groupExpenses,
      [expenseName]: updatedExpenseList,
    };
    const updatedExpenses = {
      ...expenses,
      [groupId]: updatedGroupExpenses,
    };
    set({ expenses: updatedExpenses });
    await updateDoc(
      doc(firebaseDb, `groups/${groupId}/expenses`, expenseName),
      {
        expenses: updatedGroupExpenses[expenseName], // update only the specific expenseName document
      },
    );
  },
  deleteExpense: async (groupId, expenseName, index) => {
    const { expenses } = get();
    const groupExpenses = expenses?.[groupId] || {};
    const expenseList = groupExpenses[expenseName] || [];
    const updatedExpenseList = expenseList.filter((_, i) => i !== index);
    const updatedGroupExpenses = {
      ...groupExpenses,
      [expenseName]: updatedExpenseList,
    };
    const updatedExpenses = {
      ...expenses,
      [groupId]: updatedGroupExpenses,
    };
    set({ expenses: updatedExpenses });
    await updateDoc(
      doc(firebaseDb, `groups/${groupId}/expenses`, expenseName),
      {
        expenses: updatedGroupExpenses[expenseName], // update only the specific expenseName document
      },
    );
  },
});
