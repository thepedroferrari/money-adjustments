export interface User {
  uid: string;
  email: string;
  groups: string[];
}

export interface Expense {
  date: string;
  owner: string;
  where: string;
  price: number;
  accrue: boolean;
  quota: number;
  pillSelection?: string;
}
