export enum InsuranceStatus {
  PAID,
  FOR_PAYOUT,
  REPAID
}

export interface Insurance {
  flight: string;
  paidAmount: string;
  creditAmount: string;
  status: InsuranceStatus;
}
