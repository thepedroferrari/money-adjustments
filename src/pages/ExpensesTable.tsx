import React, { useCallback } from "react";
import AddTransactionForm from "../components/AddTransactionForm";
import "../components/DataTable.css";
import DeleteIcon from "../components/DeleteIcon";
import FileUpload from "../components/FileUpload";
import Footer from "../components/Footer";
import {
  AscendingIcon,
  DescendingIcon,
  UnsortedIcon,
} from "../components/SortingIcons";
import { useExpenses } from "../hooks/useExpenses";
import { Expense } from "../types";
import { calculatePedroKarolin, pillOptions } from "../utils/businessLogic";
import { formatCurrency } from "../utils/formatCurrency";

const ExpensesTable: React.FC = () => {
  const {
    data,
    pillSelections,
    sortOrder,
    sortColumn,
    editIndex,
    editForm,
    handlePillChange,
    handleUpdateTransaction,
    handleDeleteTransaction,
    sortData,
    handleEditChange,
    startEdit,
    cancelEdit,
  } = useExpenses();

  const getSortIcon = useCallback(
    (column: string) => {
      if (sortColumn !== column) {
        return <UnsortedIcon />;
      }
      if (sortOrder === "asc") {
        return <AscendingIcon />;
      }
      if (sortOrder === "desc") {
        return <DescendingIcon />;
      }
      return <UnsortedIcon />;
    },
    [sortColumn, sortOrder],
  );

  return (
    <div className="table-container">
      <FileUpload />
      <table>
        <thead>
          <tr>
            <th onClick={() => sortData("owner")}>
              <div className="header-cell">
                <span>Owner</span>
                {getSortIcon("owner")}
              </div>
            </th>
            <th onClick={() => sortData("date")}>
              <div className="header-cell">
                <span>Date</span>
                {getSortIcon("date")}
              </div>
            </th>
            <th onClick={() => sortData("where")}>
              <div className="header-cell">
                <span>Where</span>
                {getSortIcon("where")}
              </div>
            </th>
            <th onClick={() => sortData("price")}>
              <div className="header-cell">
                <span>Price</span>
                {getSortIcon("price")}
              </div>
            </th>
            <th>
              <div className="header-cell">
                <span>Selection</span>
              </div>
            </th>
            <th>
              <div className="header-cell">
                <span>Pedro</span>
              </div>
            </th>
            <th>
              <div className="header-cell">
                <span>Karolin</span>
              </div>
            </th>
            <th>
              <div className="header-cell">
                <span>Actions</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => {
            if (index === editIndex) {
              return (
                <tr key={item.id}>
                  <td>
                    <input
                      type="text"
                      name="owner"
                      value={editForm.owner || ""}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      name="date"
                      value={editForm.date || ""}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="where"
                      value={editForm.where || ""}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="price"
                      value={editForm.price || 0}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <select
                      name="pillSelection"
                      value={editForm.pillSelection || "66%"}
                      onChange={handleEditChange}
                    >
                      {pillOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="number">
                    {calculatePedroKarolin(
                      editForm.price || 0,
                      editForm.pillSelection || "66%",
                    ).pedro.toFixed(2)}
                  </td>
                  <td className="number">
                    {calculatePedroKarolin(
                      editForm.price || 0,
                      editForm.pillSelection || "66%",
                    ).karolin.toFixed(2)}
                  </td>
                  <td>
                    <button
                      onClick={() =>
                        handleUpdateTransaction(index, editForm as Expense)
                      }
                    >
                      Save
                    </button>
                    <button onClick={cancelEdit}>Cancel</button>
                  </td>
                </tr>
              );
            }

            const { pedro, karolin } = calculatePedroKarolin(
              item.price,
              pillSelections[index] || "66%",
            );

            return (
              <tr key={item.id}>
                <td>{item.owner}</td>
                <td>{item.date}</td>
                <td>{item.where}</td>
                <td className="number">{formatCurrency(item.price)}</td>
                <td>
                  <select
                    value={pillSelections[index] || "66%"}
                    onChange={(e) => handlePillChange(index, e.target.value)}
                  >
                    {pillOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="number">{pedro.toFixed(2)}</td>
                <td className="number">{karolin.toFixed(2)}</td>
                <td>
                  <button onClick={() => startEdit(index, item)}>Edit</button>
                  <button onClick={() => handleDeleteTransaction(index)}>
                    <DeleteIcon />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <AddTransactionForm />
      <Footer />
    </div>
  );
};

export default ExpensesTable;
