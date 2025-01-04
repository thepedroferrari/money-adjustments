// src/store/userGroup.ts
import { collection, getDocs } from "firebase/firestore";
import { StateCreator } from "zustand";
import { firebaseDb } from "../firebaseConfig";
import { Expense, User } from "../types";
import {
  deleteExpenseFromGroup,
  mergeExpenses,
  updateExpenseInGroup,
} from "../utils/transformExpenses";

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

export const createUserGroupSlice: StateCreator<UserGroupState> = (set) => ({
  user: null,
  groups: null,
  expenses: null,
  setUser: (user, groups = null) => set(() => ({ user, groups })),
  setExpenses: (expenses) => set(() => ({ expenses })),
  fetchExpenses: async (groupId) => {
    try {
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

      set(() => ({ expenses: { [groupId]: expensesData } }));
    } catch (error) {
      console.error("Error fetching expenses", error);
    }
  },
  addExpense: (groupId, expenseName, expense) => {
    set((state) => ({
      expenses: mergeExpenses(state.expenses, groupId, expenseName, expense),
    }));
  },
  updateExpense: async (groupId, expenseName, index, updatedExpense) => {
    set((state) => ({
      expenses: updateExpenseInGroup(
        state.expenses,
        groupId,
        expenseName,
        index,
        updatedExpense,
      ),
    }));
  },
  deleteExpense: async (groupId, expenseName, index) => {
    set((state) => ({
      expenses: deleteExpenseFromGroup(
        state.expenses,
        groupId,
        expenseName,
        index,
      ),
    }));
  },
});
