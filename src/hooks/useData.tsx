import { useDataContext } from "../context/DataContext";
import * as XLSX from "xlsx";
import { DataRow } from "../context/DataContext";

type ValidCards = HandelsbankenCard[] | AmexPlatinumCard[];

export const useData = () => {
  const { data: ctxData, setData } = useDataContext();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        console.log(jsonData);

        if (jsonData.length === 0) {
          return;
        }

        if (isHandelsbankenCard(jsonData)) {
          return setData([...ctxData, ...handleHandelsbankenCard(jsonData)]);
        }

        if (isAmexPlatinumCard(jsonData)) {
          return setData([...ctxData, ...handleAmexPlatinumCard(jsonData)]);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return { handleFileUpload };
};

const getOwnerName = (str: string) => {
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

const handleHandelsbankenCard = (jsonData: HandelsbankenCard[]): DataRow[] => {
  // Find the first index where price is a valid number
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
  Transaktionsspecifikationer: string; // date
  __EMPTY: string; // name
  __EMPTY_1: string;
  __EMPTY_2: number | string | undefined; // price
  __EMPTY_3: string;
  __EMPTY_4: string; // where
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

const handleAmexPlatinumCard = (jsonData: AmexPlatinumCard[]): DataRow[] => {
  // Remove row containing previous card payment
  const filteredData = jsonData.filter((rows) => {
    return (
      // we need to filter out rows containing the string "BETALNING MOTTAGEN, TACK"
      !Object.values(rows).find((val) => val === "BETALNING MOTTAGEN, TACK") &&
      // we need to filter out undefined / string values in price
      typeof rows["__EMPTY_2"] === "number"
    );
  }) as (AmexPlatinumCard & { __EMPTY_2: number })[];

  return filteredData.map((row) => ({
    date: row["Transaktionsspecifikationer"],
    owner: getOwnerName(row["__EMPTY"]),
    where: row["__EMPTY_4"],
    price: row["__EMPTY_2"] * -1,
  }));
};
