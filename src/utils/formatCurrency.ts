export const formatCurrency = (value: number) => {
  const formattedValue = new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value));

  return value < 0 ? `- ${formattedValue}` : formattedValue;
};
