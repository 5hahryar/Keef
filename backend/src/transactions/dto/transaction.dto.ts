export class TransactionDto {
  id?: number;
  title: string;
  description: string;
  amount: number;
  date: string;
  bank: string;
  category: string;
  type: string;
}

export class TransactionResponse {
  id: number;
  title: string;
  description: string;
  amount: number;
  date: string;
  bank: string;
  category: string;
  type: string;
}
