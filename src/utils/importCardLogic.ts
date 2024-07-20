import { v4 as uuidv4 } from "uuid";
import type { AmexPlatinumCard, Expense, HandelsbankenCard } from "../types";
import { getQuotaByOwnerName } from "./businessLogic";

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
    return {
      id: uuidv4(),
      date,
      owner: "Pedro",
      where,
      price,
      quota: 66,
    };
  });
};

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
    const owner = getOwnerName(row["__EMPTY"]);
    const quota = getQuotaByOwnerName(owner);

    return {
      id: uuidv4(),
      owner,
      date,
      where,
      price,
      quota,
    };
  });
};
