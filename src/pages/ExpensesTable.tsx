// src/pages/ExpensesTable.tsx
import React from "react";
import { useExpenses } from "../hooks/useExpenses";
import { calculatePedroKarolin, pillOptions } from "../utils/businessLogic";
import { formatCurrency } from "../utils/formatCurrency";
import AddTransactionForm from "../components/AddTransactionForm";
import "../components/DataTable.css";
import { Expense } from "../types";
import {
  AscendingIcon,
  DescendingIcon,
  UnsortedIcon,
} from "../components/SortingIcons";
import FileUpload from "../components/FileUpload";
import { useParams } from "react-router-dom";
import Footer from "../components/Footer";
import DeleteIcon from "../components/DeleteIcon";

const ExpensesTable: React.FC = () => {
  const { groupId, expenseName } = useParams<{
    groupId: string;
    expenseName: string;
  }>();
  const {
    data,
    pillSelections,
    accrueSelections,
    sortOrder,
    sortColumn,
    editIndex,
    editForm,
    handlePillChange,
    handleAccrueChange,
    handleUpdateTransaction,
    handleDeleteTransaction,
    sortData,
    handleEditChange,
    startEdit,
    cancelEdit,
  } = useExpenses();

  const getSortIcon = (column: string) => {
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
  };

  return (
    <div className="table-container">
      <FileUpload />
      <table>
        <thead>
          <tr>
            <th>
              <div className="header-cell">
                <span>Accrue</span>
              </div>
            </th>
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
                <tr key={index}>
                  <td>
                    <input
                      type="checkbox"
                      name="accrue"
                      checked={editForm.accrue !== false}
                      onChange={(e) =>
                        handleEditChange({
                          ...e,
                          target: {
                            ...e.target,
                            name: "accrue",
                            value: e.target.checked ? "true" : "false",
                          },
                        })
                      }
                    />
                  </td>
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
              <tr key={index}>
                <td>
                  <input
                    type="checkbox"
                    checked={accrueSelections[index] !== false}
                    onChange={(e) =>
                      handleAccrueChange(index, e.target.checked)
                    }
                  />
                </td>
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
      {groupId && expenseName && (
        <AddTransactionForm groupId={groupId} expenseName={expenseName} />
      )}
      <Footer />
    </div>
  );
};

export default ExpensesTable;
