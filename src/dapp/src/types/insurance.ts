import moment from 'moment';

export enum InsuranceStatus {
  PAID,
  FOR_PAYOUT,
  REPAID
}

export interface Insurance {
  flight: string;
  paidAmount: string;
  status: InsuranceStatus;
  lastModifiedDate: moment.Moment
}
