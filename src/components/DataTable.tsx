import React from 'react';
import { useDataContext } from '../context/DataContext';
import { pillOptions, calculatePedroKarolin } from '../utils/businessLogic';
import './DataTable.css';

const DataTable: React.FC = () => {
  const { data, pillSelections, accrueSelections, handlePillChange, handleAccrueChange } = useDataContext();

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Accrue</th>
            <th>Date</th>
            <th>Where</th>
            <th>Price</th>
            <th>Selection</th>
            <th>Pedro</th>
            <th>Karolin</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => {
            const { pedro, karolin } = calculatePedroKarolin(item.price, pillSelections[index] || '66%');
            return (
              <tr key={index}>
                <td>
                  <input
                    type="checkbox"
                    checked={accrueSelections[index] !== false}
                    onChange={(e) => handleAccrueChange(index, e.target.checked)}
                  />
                </td>
                <td>{item.date}</td>
                <td>{item.where}</td>
                <td className="number">{item.price}</td>
                <td>
                  <select
                    value={pillSelections[index] || '66%'}
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
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
