export class CreateLoanDto {
  name: string;
  numberOfInstallments: number;
  installmentAmount: number;
  numberOfDueDay: number;
  firstPaymentDate?: string;
}

export class LoanResponse {
  id: string;
  name: string;
  numberOfInstallments: number;
  installmentAmount: number;
  numberOfDueDay: number;
  isPaid: boolean;
}

export type InstallmentStatus = 'pending' | 'paid' | 'overdue';

export class InstallmentResponse {
  id: string;
  amount: number;
  dueDate: Date;
  installmentNumber: number;
  status: InstallmentStatus;
  loan?: LoanResponse;
}

export class LoanDetailResponse extends LoanResponse {
  installments: InstallmentResponse[];
}
