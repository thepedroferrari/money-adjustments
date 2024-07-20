export interface User {
  uid: string;
  email: string;
  groups: string[];
}

export interface Expense {
  id: string;
  date: string;
  owner: string;
  where: string;
  price: number;
  quota: number;
  pillSelection?: string;
}

export interface HandelsbankenCard {
  Handelsbanken: string;
  __EMPTY: string;
  __EMPTY_1: string;
  __EMPTY_2: number;
  __EMPTY_3: number;
}

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
