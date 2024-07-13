import { create } from "zustand";
import * as XLSX from "xlsx";
import {
  calculatePedroKarolin,
  shouldDisableRow,
} from "../utils/businessLogic";

export interface Expense {
  date: string;
  where: string;
  owner: string;
  price: number;
}

interface StoreState {
  data: Expense[];
  pillSelections: { [key: number]: string };
  accrueSelections: { [key: number]: boolean };
  sortOrder: "asc" | "desc" | "original";
  sortColumn: keyof Expense;
  setData: (data: Expense[]) => void;
  handlePillChange: (index: number, value: string) => void;
  handleAccrueChange: (index: number, checked: boolean) => void;
  deleteTransaction: (index: number) => void;
  calculateTotals: () => {
    total: number;
    partialPedro: number;
    partialKarolin: number;
  };
  sortData: (column: keyof Expense) => void;
  resetData: () => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  syncData: (expenseName: string) => void;
  saveData: (expenseName: string) => void;
}

const isLocalhost = window.location.hostname === "localhost";

const baseUrl = isLocalhost
  ? "http://localhost:8888"
  : "https://money-adjustment.netlify.app";

export const useStore = create<StoreState>((set, get) => ({
  data: [],
  pillSelections: {},
  accrueSelections: {},
  sortOrder: "original",
  sortColumn: "date",
  setData: (data) => {
    const initialPillSelections: { [key: number]: string } = {};
    const initialAccrueSelections: { [key: number]: boolean } = {};
    data.forEach((item, index) => {
      initialPillSelections[index] = "66%";
      initialAccrueSelections[index] = item.price <= 0;
      if (shouldDisableRow(item)) {
        initialAccrueSelections[index] = false;
      }
    });
    set({
      data,
      pillSelections: initialPillSelections,
      accrueSelections: initialAccrueSelections,
    });
  },
  handlePillChange: (index, value) => {
    set((state) => ({
      pillSelections: { ...state.pillSelections, [index]: value },
    }));
  },
  handleAccrueChange: (index, checked) => {
    set((state) => ({
      accrueSelections: { ...state.accrueSelections, [index]: checked },
    }));
  },
  deleteTransaction: (index) => {
    set((state) => ({
      data: state.data.filter((_, i) => i !== index),
    }));
  },
  calculateTotals: () => {
    const { data, pillSelections, accrueSelections } = get();
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
  },
  sortData: (column) => {
    const { data, sortOrder, sortColumn } = get();
    if (sortOrder === "original" || sortColumn !== column) {
      const sortedData = [...data].sort((a, b) =>
        a[column] > b[column] ? 1 : -1,
      );
      set({ data: sortedData, sortOrder: "asc", sortColumn: column });
    } else if (sortOrder === "asc") {
      const sortedData = [...data].sort((a, b) =>
        a[column] < b[column] ? 1 : -1,
      );
      set({ data: sortedData, sortOrder: "desc" });
    } else {
      // Reset to original sort
      set((state) => ({ data: state.data, sortOrder: "original" }));
    }
  },
  resetData: () => {
    set((state) => ({ data: state.data }));
  },
  handleFileUpload: (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const data = new Uint8Array(arrayBuffer);
        const binaryStr = data.reduce(
          (acc, byte) => acc + String.fromCharCode(byte),
          "",
        );
        const workbook = XLSX.read(binaryStr, { type: "binary" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as ValidCards;

        if (jsonData.length === 0) {
          return;
        }

        if (isHandelsbankenCard(jsonData)) {
          set((state) => ({
            data: [...state.data, ...handleHandelsbankenCard(jsonData)],
          }));
        }

        if (isAmexPlatinumCard(jsonData)) {
          set((state) => ({
            data: [...state.data, ...handleAmexPlatinumCard(jsonData)],
          }));
        }
      };
      reader.readAsArrayBuffer(file);
    }
  },

  syncData: async (expenseName) => {
    try {
      const response = await fetch(`${baseUrl}/.netlify/functions/sync-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ expenseName }),
      });
      const result = await response.json();
      if (response.ok) {
        const data = result.data;
        set({ data });
      } else {
        console.error("Error syncing data:", result);
      }
    } catch (error) {
      console.error("Error syncing data:", error);
    }
  },

  saveData: async (expenseName) => {
    try {
      const data = get().data;
      const response = await fetch(`${baseUrl}/.netlify/functions/save-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ expenseName, data }),
      });
      const result = await response.json();
      if (!response.ok) {
        console.error("Error saving data:", result);
      }
    } catch (error) {
      console.error("Error saving data:", error);
    }
  },
}));

type ValidCards = HandelsbankenCard[] | AmexPlatinumCard[];

const getOwnerName = (str: string): string => {
  if (str === "P FERRARI MARTINS") {
    return "Pedro";
  }
  if (str === "S E FRENNERT") {
    return "Karolin";
  }
  return str;
};

interface HandelsbankenCard {
  Handelsbanken: string;
  __EMPTY: string;
  __EMPTY_1: string;
  __EMPTY_2: number;
  __EMPTY_3: number;
}

function isHandelsbankenCard(
  card: HandelsbankenCard[] | AmexPlatinumCard[],
): card is HandelsbankenCard[] {
  return (card as HandelsbankenCard[])[0]["Handelsbanken"] !== undefined;
}

const handleHandelsbankenCard = (jsonData: HandelsbankenCard[]): Expense[] => {
  const firstValidIndex = jsonData.findIndex((row) => {
    const price = row["__EMPTY_2"];
    return typeof price === "number" && !isNaN(price);
  });

  return jsonData.slice(firstValidIndex).map((row) => ({
    date: row["Handelsbanken"],
    owner: "Pedro",
    where: row["__EMPTY_1"],
    price: row["__EMPTY_2"],
  }));
};

interface AmexPlatinumCard {
  Transaktionsspecifikationer: string;
  __EMPTY: string;
  __EMPTY_1: string;
  __EMPTY_2: number | string | undefined;
  __EMPTY_3: string;
  __EMPTY_4: string;
  __EMPTY_5: string;
  __EMPTY_6: string;
  __EMPTY_7: string;
  __EMPTY_8: string;
  __EMPTY_9: string;
}

function isAmexPlatinumCard(
  card: HandelsbankenCard[] | AmexPlatinumCard[],
): card is AmexPlatinumCard[] {
  return (
    (card as AmexPlatinumCard[])[0]["Transaktionsspecifikationer"] !== undefined
  );
}

const handleAmexPlatinumCard = (jsonData: AmexPlatinumCard[]): Expense[] => {
  const filteredData = jsonData.filter((row) => {
    return (
      !Object.values(row).includes("BETALNING MOTTAGEN, TACK") &&
      typeof row["__EMPTY_2"] === "number"
    );
  }) as (AmexPlatinumCard & { __EMPTY_2: number })[];

  return filteredData.map((row) => ({
    date: row["Transaktionsspecifikationer"],
    owner: getOwnerName(row["__EMPTY"]),
    where: row["__EMPTY_4"],
    price: row["__EMPTY_2"] * -1,
  }));
};
