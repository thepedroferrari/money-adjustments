import React, { useState, useEffect } from "react";
import { useDataContext } from "../context/DataContext";
import { pillOptions } from "../utils/businessLogic";
import "./AddTransactionForm.css";

const AddTransactionForm: React.FC = () => {
  const { data, setData } = useDataContext();

  const [newTransaction, setNewTransaction] = useState({
    date: "",
    owner: "",
    where: "",
    price: 0,
    pillSelection: "66%",
  });

  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    const { date, owner, where, price, pillSelection } = newTransaction;
    if (date && owner && where && price > 0 && pillSelection) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  }, [newTransaction]);

  const handleNewTransactionChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setNewTransaction({
      ...newTransaction,
      [name]: name === "price" ? parseFloat(value) : value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newEntry = {
      date: formData.get("date") as string,
      owner: formData.get("owner") as string,
      where: formData.get("where") as string,
      price: parseFloat(formData.get("price") as string),
      pillSelection: formData.get("pillSelection") as string,
    };
    const updatedData = [...data, newEntry];
    setData(updatedData);
    setNewTransaction({
      date: "",
      owner: "",
      where: "",
      price: 0,
      pillSelection: "66%",
    });
  };

  return (
    <form className="add-transaction-form" onSubmit={handleSubmit}>
      <h3>Add Transaction</h3>
      <input
        type="date"
        name="date"
        placeholder="Date"
        value={newTransaction.date}
        onChange={handleNewTransactionChange}
      />
      <input
        type="text"
        name="owner"
        placeholder="Owner"
        value={newTransaction.owner}
        onChange={handleNewTransactionChange}
      />
      <input
        type="text"
        name="where"
        placeholder="Where"
        value={newTransaction.where}
        onChange={handleNewTransactionChange}
      />
      <input
        type="number"
        name="price"
        placeholder="Price"
        value={newTransaction.price}
        onChange={handleNewTransactionChange}
      />
      <select
        name="pillSelection"
        value={newTransaction.pillSelection}
        onChange={handleNewTransactionChange}
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

export default AddTransactionForm;
