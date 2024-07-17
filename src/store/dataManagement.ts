// src/store/dataManagement.ts
import * as XLSX from "xlsx";
import { StateCreator } from "zustand";
import { Expense } from "../types";
import { getQuotaByOwnerName, shouldDisableRow } from "../utils/businessLogic";

const isLocalhost = window.location.hostname === "localhost";

const baseUrl = isLocalhost
  ? "http://localhost:8888"
  : "https://money-adjustment.netlify.app";

export interface DataManagementState {
  data: Expense[];
  pillSelections: { [key: number]: string };
  accrueSelections: { [key: number]: boolean };
  setData: (data: Expense[]) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  syncData: (groupId: string, expenseName: string) => void;
  saveData: (groupId: string, expenseName: string) => void;
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
      const response = await fetch(`${baseUrl}/.netlify/functions/sync-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groupId, expenseName }),
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
  saveData: async (groupId, expenseName) => {
    const { data } = get();
    try {
      const response = await fetch(`${baseUrl}/.netlify/functions/save-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groupId, expenseName, data }),
      });
      const result = await response.json();
      if (!response.ok) {
        console.error("Error saving data:", result);
      }
    } catch (error) {
      console.error("Error saving data:", error);
    }
  },
});

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

  return jsonData.slice(firstValidIndex).map((row) => {
    const date = row["Handelsbanken"];
    const where = row["__EMPTY_1"];
    const price = row["__EMPTY_2"];
    const accrue = shouldDisableRow({ where, price });
    return {
      date,
      owner: "Pedro",
      where,
      price,
      accrue,
      quota: 66,
    };
  });
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

  return filteredData.map((row) => {
    const date = row["Transaktionsspecifikationer"];
    const where = row["__EMPTY_1"];
    const price = row["__EMPTY_2"] * -1;
    const accrue = shouldDisableRow({ where, price });
    const owner = getOwnerName(row["__EMPTY"]);
    const quota = getQuotaByOwnerName(owner);

    return {
      owner,
      date,
      where,
      price,
      accrue,
      quota,
    };
  });
};
