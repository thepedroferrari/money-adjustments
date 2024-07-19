import { Expense } from "../types";
import { getQuotaByOwnerName, shouldDisableRow } from "./businessLogic";

export type ValidCards = HandelsbankenCard[] | AmexPlatinumCard[];

const getOwnerName = (str: string): string => {
  if (str === "P FERRARI MARTINS") {
    return "Pedro";
  }
  if (str === "S E FRENNERT") {
    return "Karolin";
  }
  return str;
};

export interface HandelsbankenCard {
  Handelsbanken: string;
  __EMPTY: string;
  __EMPTY_1: string;
  __EMPTY_2: number;
  __EMPTY_3: number;
}

export function isHandelsbankenCard(
  card: HandelsbankenCard[] | AmexPlatinumCard[],
): card is HandelsbankenCard[] {
  return (card as HandelsbankenCard[])[0]["Handelsbanken"] !== undefined;
}

export const handleHandelsbankenCard = (
  jsonData: HandelsbankenCard[],
): Expense[] => {
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

export interface AmexPlatinumCard {
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

export function isAmexPlatinumCard(
  card: HandelsbankenCard[] | AmexPlatinumCard[],
): card is AmexPlatinumCard[] {
  return (
    (card as AmexPlatinumCard[])[0]["Transaktionsspecifikationer"] !== undefined
  );
}

export const handleAmexPlatinumCard = (
  jsonData: AmexPlatinumCard[],
): Expense[] => {
  const filteredData = jsonData.filter((row) => {
    return (
      !Object.values(row).includes("BETALNING MOTTAGEN, TACK") &&
      typeof row["__EMPTY_2"] === "number"
    );
  }) as (AmexPlatinumCard & { __EMPTY_2: number })[];

  return filteredData.map((row) => {
    const date = row["Transaktionsspecifikationer"];
    const where = row["__EMPTY_4"];
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
