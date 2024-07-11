import React from "react";
import { DataRow, useDataContext } from "../context/DataContext";
import { calculatePedroKarolin, pillOptions } from "../utils/businessLogic";
import { formatCurrency } from "../utils/formatCurrency";
import AddTransactionForm from "./AddTransactionForm";
import "./DataTable.css";
import DeleteIcon from "./DeleteIcon";
import { AscendingIcon, DescendingIcon, UnsortedIcon } from "./SortingIcons";

const DataTable: React.FC = () => {
  const {
    data,
    pillSelections,
    accrueSelections,
    handlePillChange,
    handleAccrueChange,
    deleteTransaction,
    sortData,
    resetData,
    sortOrder,
    sortColumn,
  } = useDataContext();

  const handleSort = (column: keyof DataRow) => {
    sortData(column);
  };

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
      <table>
        <thead>
          <tr>
            <th>
              <div className="header-cell">
                <span>Accrue</span>
              </div>
            </th>
            <th onClick={() => handleSort("owner")}>
              <div className="header-cell">
                <span>Owner</span>
                {getSortIcon("owner")}
              </div>
            </th>
            <th onClick={() => handleSort("date")}>
              <div className="header-cell">
                <span>Date</span>
                {getSortIcon("date")}
              </div>
            </th>
            <th onClick={() => handleSort("where")}>
              <div className="header-cell">
                <span>Where</span>
                {getSortIcon("where")}
              </div>
            </th>
            <th onClick={() => handleSort("price")}>
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
                  <DeleteIcon onClick={() => deleteTransaction(index)} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <AddTransactionForm />
    </div>
  );
};

export default DataTable;
