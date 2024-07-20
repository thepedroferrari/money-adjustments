import React, { useCallback, useEffect, useState } from "react";
import { useStore } from "../hooks/useStore";
import { pillOptions } from "../utils/businessLogic";
import { v4 as uuidv4 } from "uuid";
import "./AddTransactionForm.css";
import { Expense } from "../types";

const initialTransaction = {
  date: "",
  owner: "",
  where: "",
  price: 0,
  pillSelection: "66%",
};

const AddTransactionForm = () => {
  const setData = useStore((state) => state.setData);
  const data = useStore((state) => state.data);
  const { formState, handleChange, resetForm, isFormValid } = useForm();

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const newExpense = {
        id: uuidv4(),
        ...formState,
        quota: parseInt(formState.pillSelection),
      } satisfies Expense;

      setData([...data, newExpense]);

      resetForm();
    },
    [data, formState, resetForm, setData],
  );

  return (
    <form className="add-transaction-form" onSubmit={handleSubmit}>
      <h3>Add Transaction</h3>
      <input
        type="date"
        name="date"
        placeholder="Date"
        value={formState.date}
        onChange={handleChange}
      />
      <input
        type="text"
        name="owner"
        placeholder="Owner"
        value={formState.owner}
        onChange={handleChange}
      />
      <input
        type="text"
        name="where"
        placeholder="Where"
        value={formState.where}
        onChange={handleChange}
      />
      <input
        type="number"
        name="price"
        placeholder="Price"
        value={formState.price}
        onChange={handleChange}
      />
      <select
        name="pillSelection"
        value={formState.pillSelection}
        onChange={handleChange}
      >
        {pillOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <button type="submit" disabled={!isFormValid}>
        Add Transaction
      </button>
    </form>
  );
};

const useForm = (
  initialState: typeof initialTransaction = initialTransaction,
) => {
  const [formState, setFormState] = useState(initialState);
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    const { date, owner, where, pillSelection, price } = formState;
    setIsFormValid(!!(date && owner && where && pillSelection && price));
  }, [formState]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormState((prevState) => ({
        ...prevState,
        [name]: name === "price" ? parseFloat(value) : value,
      }));
    },
    [],
  );

  const resetForm = useCallback(() => {
    setFormState(initialState);
  }, [initialState]);

  return { formState, handleChange, resetForm, isFormValid };
};

export default AddTransactionForm;
