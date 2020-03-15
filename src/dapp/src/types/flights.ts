import { Airline } from './airlines';

export enum FlightStatus {
    UNKNOWN = 0,
    ON_TIME = 10,
    LATE_AIRLINE = 20,
    LATE_WEATHER = 30,
    LATE_TECHNICAL = 40,
    LATE_OTHER = 50
}

export interface Flight {
    key: string;
    airline: Airline,
    code: string,
    date: string,
    status: FlightStatus
}
