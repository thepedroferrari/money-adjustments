import React from "react";
import { useStore } from "../hooks/useStore";
import { formatCurrency } from "../utils/formatCurrency";
import { useParams } from "react-router-dom";
import "./Footer.css";

const Footer: React.FC = () => {
  const calculateTotals = useStore((state) => state.calculateTotals);
  const { total, partialPedro, partialKarolin } = calculateTotals();
  const user = useStore((state) => state.user);
  const groups = useStore((state) => state.groups);
  const syncData = useStore((state) => state.syncData);
  const saveData = useStore((state) => state.saveData);

  const { expenseName } = useParams<{ expenseName: string }>();

  const handleSync = () => {
    if (user && groups && groups.length > 0 && expenseName) {
      syncData(groups[0], expenseName);
    }
  };

  const handleSave = () => {
    if (user && groups && groups.length > 0 && expenseName) {
      saveData(groups[0], expenseName);
    }
  };

  return (
    <div className="floating-footer">
      <div className="footer-content">
        <div className="footer-item">
          <span>Total: </span>
          <span className="number">{formatCurrency(total)}</span>
        </div>
        <div className="footer-item">
          <span>Partial Pedro: </span>
          <span className="number">{formatCurrency(partialPedro)}</span>
        </div>
        <div className="footer-item">
          <span>Partial Karolin: </span>
          <span className="number">{formatCurrency(partialKarolin)}</span>
        </div>
        <div className="footer-item">
          <button onClick={handleSync}>Sync</button>
          <button onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default Footer;
