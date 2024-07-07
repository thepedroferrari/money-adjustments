import React from 'react';
import { useDataContext } from '../context/DataContext';
import './Footer.css';

const Footer: React.FC = () => {
  const { calculateTotals } = useDataContext();
  const { total, partialPedro, partialKarolin } = calculateTotals();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(Math.abs(value));
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
      </div>
    </div>
  );
};

export default Footer;
