export const calculatePedroKarolin = (price: number, percentage: string) => {
  const percentValue = parseInt(percentage) / 100;
  const pedro = price * percentValue;
  const karolin = price - pedro;
  return { pedro, karolin };
};

export const shouldDisableRow = (item: { where: string; price: number }) => {
  const disableList = [
    "HUMBLEBUNDLE.C",
    "SL",
    "OPENAI *CHATGP",
    "American Expre",
    "TELE2",
    "Lysa",
  ];

  // Check for the presence of "Swedbank Pay" with -400 value (Haircut)
  const isSwedbankPayWith400 = item.where === "Swedbank Pay" && item.price === -400;
  
  // Exclude entries that loosely contain the word "saving"
  const containsSaving = /saving/i.test(item.where);

  return disableList.includes(item.where) || isSwedbankPayWith400 || containsSaving;
};


export const pillOptions = ['0%', '33%', '66%', '100%'];