// src/components/AddTransactionForm.tsx
import React, { useCallback, useEffect, useState } from "react";
import { useStore } from "../hooks/useStore";
import { pillOptions } from "../utils/businessLogic";
import "./AddTransactionForm.css";

const initialTransaction = {
  date: "",
  owner: "",
  where: "",
  price: 0,
  pillSelection: "66%",
};

const AddTransactionForm: React.FC<{
  groupId: string;
  expenseName: string;
}> = ({ groupId, expenseName }) => {
  const addExpense = useStore((state) => state.addExpense);

  const { formState, handleChange, resetForm, isFormValid } = useForm();

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!expenseName) {
        throw new Error("No expense name provided");
      }

      const newEntry = {
        ...formState,
        accrue: true,
        quota: parseInt(formState.pillSelection),
      };
      addExpense(groupId, expenseName, newEntry);
      resetForm();
    },
    [formState, groupId, expenseName, addExpense, resetForm],
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
    const { date, owner, where, price, pillSelection } = formState;
    setIsFormValid(!!(date && owner && where && price > 0 && pillSelection));
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
