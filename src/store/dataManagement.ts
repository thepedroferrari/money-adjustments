import * as XLSX from "xlsx";
import { StateCreator } from "zustand";
import { Expense } from "../types";
import { shouldDisableRow } from "../utils/businessLogic";
import {
  addExpenseSet,
  deleteExpenseSet,
  saveData,
  syncData,
} from "../utils/firebaseFunctions";
import {
  handleAmexPlatinumCard,
  handleHandelsbankenCard,
  isAmexPlatinumCard,
  isHandelsbankenCard,
  ValidCards,
} from "../utils/importCardLogic";

export interface DataManagementState {
  data: Expense[];
  pillSelections: { [key: number]: string };
  accrueSelections: { [key: number]: boolean };
  setData: (data: Expense[]) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  syncData: (groupId: string, expenseName: string) => void;
  saveData: (groupId: string, expenseName: string) => void;
  addExpenseSet: (groupId: string, expenseName: string) => void;
  deleteExpenseSet: (groupId: string, expenseName: string) => void;
}

export const createDataManagementSlice: StateCreator<DataManagementState> = (
  set,
  get,
) => ({
  data: [],
  pillSelections: {},
  accrueSelections: {},
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

        console.log({
          jsonData,
        });

        if (jsonData.length === 0) {
          return;
        }

        let updatedData: Expense[] = [];
        if (isHandelsbankenCard(jsonData)) {
          updatedData = handleHandelsbankenCard(jsonData);
        } else if (isAmexPlatinumCard(jsonData)) {
          updatedData = handleAmexPlatinumCard(jsonData);
        }

        console.log({ updatedData });
        set((state) => ({
          data: [...state.data, ...updatedData],
        }));
      };
      reader.readAsArrayBuffer(file);
    }
  },
  syncData: async (groupId, expenseName) => {
    try {
      const result = await syncData(groupId, expenseName);
      const data = result.data;
      set({ data });
    } catch (error) {
      console.error("Error syncing data:", error);
    }
  },
  saveData: async (groupId, expenseName) => {
    const { data } = get();
    try {
      await saveData(groupId, expenseName, data);
    } catch (error) {
      console.error("Error saving data:", error);
    }
  },
  addExpenseSet: async (groupId, expenseName) => {
    try {
      await addExpenseSet(groupId, expenseName);
      // Optionally fetch and update the group expenses
    } catch (error) {
      console.error("Error adding expense set:", error);
    }
  },
  deleteExpenseSet: async (groupId, expenseName) => {
    try {
      await deleteExpenseSet(groupId, expenseName);
      // Optionally fetch and update the group expenses
    } catch (error) {
      console.error("Error deleting expense set:", error);
    }
  },
});
