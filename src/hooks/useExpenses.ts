// src/hooks/useExpenses.ts
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
  const updateExpense = useStore((state) => state.updateExpense);
  const addExpense = useStore((state) => state.addExpense);
  const deleteExpense = useStore((state) => state.deleteExpense); // Add deleteExpense
  const setData = useStore((state) => state.setData);

  const [pillSelections, setPillSelections] = useState<{
    [key: number]: string;
  }>({});
  const [accrueSelections, setAccrueSelections] = useState<{
    [key: number]: boolean;
  }>({});
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "original">(
    "original",
  );
  const [sortColumn, setSortColumn] = useState<keyof Expense>("date");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Expense>>({});

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

  const handlePillChange = (index: number, value: string) => {
    setPillSelections((prev) => ({ ...prev, [index]: value }));
  };

  const handleAccrueChange = (index: number, checked: boolean) => {
    setAccrueSelections((prev) => ({ ...prev, [index]: checked }));
  };

  const handleUpdateTransaction = (index: number, updatedExpense: Expense) => {
    if (groupId && expenseName) {
      updateExpense(groupId, expenseName, index, updatedExpense);
      const newData = data.map((expense, i) =>
        i === index ? updatedExpense : expense,
      );
      setData(newData);
      setEditIndex(null);
      setEditForm({});
    }
  };

  const handleDeleteTransaction = (index: number) => {
    if (groupId && expenseName) {
      const newData = data.filter((_, i) => i !== index);
      setData(newData);
      deleteExpense(groupId, expenseName, index); // Use deleteExpense instead of updateExpense
    }
  };

  const sortData = (column: keyof Expense) => {
    let sortedData;
    if (sortOrder === "original" || sortColumn !== column) {
      sortedData = [...data].sort((a, b) => {
        if (a[column] === undefined) return 1;
        if (b[column] === undefined) return -1;
        return a[column] > b[column] ? 1 : -1;
      });
      setSortOrder("asc");
    } else if (sortOrder === "asc") {
      sortedData = [...data].sort((a, b) => {
        if (a[column] === undefined) return 1;
        if (b[column] === undefined) return -1;
        return a[column] < b[column] ? 1 : -1;
      });
      setSortOrder("desc");
    } else {
      sortedData = data;
      setSortOrder("original");
    }
    setSortColumn(column);
    setData(sortedData);
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
    pillSelections,
    accrueSelections,
    sortOrder,
    sortColumn,
    editIndex,
    editForm,
    expenseName,
    addExpense,
    handlePillChange,
    handleAccrueChange,
    handleUpdateTransaction,
    handleDeleteTransaction, // Include handleDeleteTransaction in the return object
    sortData,
    handleEditChange,
    startEdit,
    cancelEdit,
  };
};
