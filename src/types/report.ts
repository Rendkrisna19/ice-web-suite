// src/types/report.ts

export type TransactionStatus = 'completed' | 'processing' | 'cancelled';

export interface Transaction {
  id: number;
  time: string;
  customer: string;
  menu: string;
  total: number;
  status: TransactionStatus;
}

