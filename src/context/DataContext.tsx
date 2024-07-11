import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
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
  deleteTransaction: (index: number) => void;
  calculateTotals: () => {
    total: number;
    partialPedro: number;
    partialKarolin: number;
  };
  sortData: (column: keyof DataRow) => void;
  resetData: () => void;
  sortOrder: "asc" | "desc" | "original";
  sortColumn: keyof DataRow;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [data, setData] = useState<DataRow[]>([]);
  const originalDataRef = useRef<DataRow[]>([]);
  const [pillSelections, setPillSelections] = useState<{
    [key: number]: string;
  }>({});
  const [accrueSelections, setAccrueSelections] = useState<{
    [key: number]: boolean;
  }>({});
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "original">(
    "original",
  );
  const [sortColumn, setSortColumn] = useState<keyof DataRow>("date");

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

    // Initialize original data ref
    if (originalDataRef.current.length === 0) {
      originalDataRef.current = data;
    }
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

  const deleteTransaction = (index: number) => {
    setData((prevData) => prevData.filter((_, i) => i !== index));
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

  const sortData = (column: keyof DataRow) => {
    if (sortOrder === "original" || sortColumn !== column) {
      setSortOrder("asc");
      setSortColumn(column);
      const sortedData = [...data].sort((a, b) =>
        a[column] > b[column] ? 1 : -1,
      );
      setData(sortedData);
    } else if (sortOrder === "asc") {
      setSortOrder("desc");
      const sortedData = [...data].sort((a, b) =>
        a[column] < b[column] ? 1 : -1,
      );
      setData(sortedData);
    } else if (sortOrder === "desc") {
      setSortOrder("original");
      setData(originalDataRef.current);
    }
  };

  const resetData = () => {
    setData(originalDataRef.current);
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
        deleteTransaction,
        calculateTotals,
        sortData,
        resetData,
        sortOrder,
        sortColumn,
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
