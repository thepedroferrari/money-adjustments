import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useStore } from "./useStore";
import { Expense } from "../types";

export const useExpenses = () => {
  const { groupId, expenseName } = useParams<{
    groupId: string;
    expenseName: string;
  }>();
  const expenses = useStore((state) => state.expenses);
  const data = useStore((state) => state.data);
  const fetchExpenses = useStore((state) => state.fetchExpenses);
  const setData = useStore((state) => state.setData);
  const handlePillChangeInStore = useStore((state) => state.handlePillChange);
  const sortOrder = useStore((state) => state.sortOrder);
  const sortColumn = useStore((state) => state.sortColumn);
  const sortDataInStore = useStore((state) => state.sortData);

  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Expense>>({});
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    date: "",
    where: "",
    owner: "",
    price: 0,
  });

  useEffect(() => {
    if (!groupId) return;
    if (!expenses) {
      fetchExpenses(groupId);
    } else if (expenses && expenseName && expenses[groupId]) {
      setData(expenses[groupId][expenseName] || []);
    }
  }, [groupId, expenses, expenseName, fetchExpenses, setData]);

  useEffect(() => {
    if (!groupId) return;
    if (expenses && expenseName && expenses[groupId]) {
      setData(expenses[groupId][expenseName] || []);
    }
  }, [expenses, expenseName, groupId, setData]);

  const handlePillChange = (id: string, value: string) => {
    handlePillChangeInStore(id, value);
  };

  const handleUpdateTransaction = (index: number, updatedExpense: Expense) => {
    const newData = data.map((expense, i) =>
      i === index ? updatedExpense : expense,
    );
    setData(newData);
    setEditIndex(null);
    setEditForm({});
  };

  const handleDeleteTransaction = (index: number) => {
    const newData = data.filter((_, i) => i !== index);
    setData(newData);
  };

  const handleAddExpense = () => {
    if (
      newExpense.date &&
      newExpense.where &&
      newExpense.owner &&
      newExpense.price
    ) {
      const newData = [...data, newExpense as Expense];
      setData(newData);
      setNewExpense({ date: "", where: "", owner: "", price: 0 });
    }
  };

  const sortData = (column: keyof Expense) => {
    sortDataInStore(column);
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) : value,
    }));
  };

  const handleNewExpenseChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setNewExpense((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) : value,
    }));
  };

  const startEdit = (index: number, expense: Expense) => {
    setEditIndex(index);
    setEditForm(expense);
  };

  const cancelEdit = () => {
    setEditIndex(null);
    setEditForm({});
  };

  return {
    data,
    sortOrder,
    sortColumn,
    editIndex,
    editForm,
    newExpense,
    expenseName,
    addExpense: handleAddExpense,
    handlePillChange,
    handleUpdateTransaction,
    handleDeleteTransaction,
    handleEditChange,
    handleNewExpenseChange,
    sortData,
    startEdit,
    cancelEdit,
  };
};
