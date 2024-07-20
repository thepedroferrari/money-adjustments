import { PEDRO_DEFAULT_QUOTA } from "../constants";
import { Expense } from "../types";

export const calculatePedroKarolin = (price: number, percentage: string) => {
  const percentValue = parseInt(percentage) / 100;
  const pedro = price * percentValue;
  const karolin = price - pedro;
  return { pedro, karolin };
};

export const shouldDisableRow = ({ where, price }: Partial<Expense>) => {
  const disableList = [
    "HUMBLEBUNDLE.C",
    "SL",
    "OPENAI *CHATGP",
    "American Expre",
    "TELE2",
    "Lysa",
  ];

  // Check for the presence of "Swedbank Pay" with -400 value (Haircut)
  const isSwedbankPayWith400 = where === "Swedbank Pay" && price === -400;

  // Exclude entries that loosely contain the word "saving"
  const containsSaving = where && /saving/i.test(where);

  return (
    (where && disableList.includes(where)) ||
    isSwedbankPayWith400 ||
    containsSaving
  );
};

export const pillOptions = ["0%", "25%", "33%", "50%", "66%", "75%", "100%"];

export const getQuotaByOwnerName = (owner: string) => {
  if (owner === "Pedro") {
    return PEDRO_DEFAULT_QUOTA;
  }
  if (owner === "Karolin") {
    return 100 - PEDRO_DEFAULT_QUOTA;
  }
  return 100;
};
