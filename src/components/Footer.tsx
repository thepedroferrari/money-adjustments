import React from "react";
import { useDataContext } from "../context/DataContext";
import "./Footer.css";
import { formatCurrency } from "../utils/formatCurrency";

const Footer: React.FC = () => {
  const { calculateTotals } = useDataContext();
  const { total, partialPedro, partialKarolin } = calculateTotals();

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
      </div>
    </div>
  );
};

export default Footer;
