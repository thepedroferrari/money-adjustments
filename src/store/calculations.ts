import { StateCreator } from "zustand";
import { Expense } from "../types";
import { calculatePedroKarolin } from "../utils/businessLogic";

export interface CalculationState {
  data: Expense[];
  sortOrder: "asc" | "desc" | "original";
  sortColumn: keyof Expense;
  handlePillChange: (id: string, value: string) => void;
  deleteTransaction: (index: number) => void;
  calculateTotals: () => {
    total: number;
    partialPedro: number;
    partialKarolin: number;
  };
  sortData: (column: keyof Expense) => void;
  resetData: () => void;
}

export const createCalculationSlice: StateCreator<CalculationState> = (
  set,
  get,
) => ({
  data: [],
  sortOrder: "original",
  sortColumn: "date",
  handlePillChange: (id, value) => {
    set((state) => ({
      data: state.data.map((expense) =>
        expense.id === id ? { ...expense, pillSelection: value } : expense,
      ),
    }));
  },
  deleteTransaction: (index) => {
    set((state) => ({
      data: state.data.filter((_, i) => i !== index),
    }));
  },
  calculateTotals: () => {
    const { data } = get();
    let total = 0;
    let partialPedro = 0;
    let partialKarolin = 0;

    data.forEach((item) => {
      const { pedro, karolin } = calculatePedroKarolin(
        item.price,
        item.pillSelection || "66%",
      );
      total += item.price;
      partialPedro += pedro;
      partialKarolin += karolin;
    });

    return { total, partialPedro, partialKarolin };
  },
  sortData: (column) => {
    const { data, sortOrder, sortColumn } = get();
    if (sortOrder === "original" || sortColumn !== column) {
      const sortedData = [...data].sort((a, b) => {
        if (a[column] === undefined) return 1;
        if (b[column] === undefined) return -1;
        return a[column] > b[column] ? 1 : -1;
      });
      set({ data: sortedData, sortOrder: "asc", sortColumn: column });
    } else if (sortOrder === "asc") {
      const sortedData = [...data].sort((a, b) => {
        if (a[column] === undefined) return 1;
        if (b[column] === undefined) return -1;
        return a[column] < b[column] ? 1 : -1;
      });
      set({ data: sortedData, sortOrder: "desc" });
    } else {
      // Reset to original sort
      set((state) => ({ data: state.data, sortOrder: "original" }));
    }
  },

  resetData: () => {
    set((state) => ({ data: state.data }));
  },
});
