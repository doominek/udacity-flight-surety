export interface Airline {
    name: string;
    account: string;
    date: number;
    paid: boolean;
}

export enum RequestStatus {
    PENDING,
    ACCEPTED,
    REJECTED
}

export interface Request {
    name: string;
    account: string;
    votesAccepted: number;
    votesRejected: number;
    status: RequestStatus
}

