import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import {
  calculatePedroKarolin,
  shouldDisableRow,
} from "../utils/businessLogic";

export interface DataRow {
  date: string;
  where: string;
  owner: string;
  price: number;
}

export interface DataContextType {
  data: DataRow[];
  pillSelections: { [key: number]: string };
  accrueSelections: { [key: number]: boolean };
  setData: (data: DataRow[]) => void;
  handlePillChange: (index: number, value: string) => void;
  handleAccrueChange: (index: number, checked: boolean) => void;
  calculateTotals: () => {
    total: number;
    partialPedro: number;
    partialKarolin: number;
  };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [data, setData] = useState<DataRow[]>([]);
  const [pillSelections, setPillSelections] = useState<{
    [key: number]: string;
  }>({});
  const [accrueSelections, setAccrueSelections] = useState<{
    [key: number]: boolean;
  }>({});

  useEffect(() => {
    const initialPillSelections: { [key: number]: string } = {};
    const initialAccrueSelections: { [key: number]: boolean } = {};

    data.forEach((item, index) => {
      initialPillSelections[index] = "66%";
      initialAccrueSelections[index] = item.price <= 0;
      if (shouldDisableRow(item)) {
        initialAccrueSelections[index] = false;
      }
    });

    setPillSelections(initialPillSelections);
    setAccrueSelections(initialAccrueSelections);
  }, [data]);

  const handlePillChange = (index: number, value: string) => {
    setPillSelections((prev) => ({
      ...prev,
      [index]: value,
    }));
  };

  const handleAccrueChange = (index: number, checked: boolean) => {
    setAccrueSelections((prev) => ({
      ...prev,
      [index]: checked,
    }));
  };

  const calculateTotals = () => {
    let total = 0;
    let partialPedro = 0;
    let partialKarolin = 0;

    data.forEach((item, index) => {
      if (accrueSelections[index] !== false) {
        const { pedro, karolin } = calculatePedroKarolin(
          item.price,
          pillSelections[index] || "66%",
        );
        total += item.price;
        partialPedro += pedro;
        partialKarolin += karolin;
      }
    });

    return { total, partialPedro, partialKarolin };
  };

  return (
    <DataContext.Provider
      value={{
        data,
        pillSelections,
        accrueSelections,
        setData,
        handlePillChange,
        handleAccrueChange,
        calculateTotals,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useDataContext must be used within a DataProvider");
  }
  return context;
};
