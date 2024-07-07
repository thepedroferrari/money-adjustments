import { useDataContext } from '../context/DataContext';
import * as XLSX from 'xlsx';
import { DataRow } from '../context/DataContext';

export const useData = () => {
  const { setData } = useDataContext();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const data = new Uint8Array(arrayBuffer);
        const binaryStr = data.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Find the first index where price is a valid number
        const firstValidIndex = jsonData.findIndex((row: any) => {
          const price = row['__EMPTY_2'];
          return typeof price === 'number' && !isNaN(price);
        });

        // Remove all items before the first valid index
        const validData: DataRow[] = jsonData.slice(firstValidIndex).map((row: any) => ({
          date: row['Handelsbanken'],
          where: row['__EMPTY_1'],
          price: row['__EMPTY_2'],
        }));

        setData(validData);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return { handleFileUpload };
};
