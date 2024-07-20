import { Expense } from "../types";

export const mergeExpenses = (
  existingExpenses: {
    [groupId: string]: { [expenseName: string]: Expense[] };
  } | null = {},
  groupId: string,
  expenseName: string,
  expense: Expense,
) => {
  const groupExpenses = existingExpenses?.[groupId] || {};
  const expenseList = groupExpenses[expenseName] || [];
  return {
    ...(existingExpenses || {}),
    [groupId]: {
      ...groupExpenses,
      [expenseName]: [...expenseList, expense],
    },
  };
};

export const updateExpenseInGroup = (
  existingExpenses: {
    [groupId: string]: { [expenseName: string]: Expense[] };
  } | null = {},
  groupId: string,
  expenseName: string,
  index: number,
  updatedExpense: Expense,
) => {
  const groupExpenses = existingExpenses?.[groupId] || {};
  const expenseList = groupExpenses[expenseName] || [];
  const updatedExpenseList = expenseList.map((expense, i) =>
    i === index ? updatedExpense : expense,
  );
  return {
    ...(existingExpenses || {}),
    [groupId]: {
      ...groupExpenses,
      [expenseName]: updatedExpenseList,
    },
  };
};

export const deleteExpenseFromGroup = (
  existingExpenses: {
    [groupId: string]: { [expenseName: string]: Expense[] };
  } | null = {},
  groupId: string,
  expenseName: string,
  index: number,
) => {
  const groupExpenses = existingExpenses?.[groupId] || {};
  const expenseList = groupExpenses[expenseName] || [];
  const updatedExpenseList = expenseList.filter((_, i) => i !== index);
  return {
    ...(existingExpenses || {}),
    [groupId]: {
      ...groupExpenses,
      [expenseName]: updatedExpenseList,
    },
  };
};
