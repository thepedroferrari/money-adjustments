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

  const [pillSelections, setPillSelections] = useState<{
    [key: number]: string;
  }>({});
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "original">(
    "original",
  );
  const [sortColumn, setSortColumn] = useState<keyof Expense>("date");
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

  const handlePillChange = (index: number, value: string) => {
    setPillSelections((prev) => ({ ...prev, [index]: value }));
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
    pillSelections,
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
