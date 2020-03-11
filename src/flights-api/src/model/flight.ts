import moment from 'moment';

export enum FlightStatus {
    UNKNOWN = 0,
    ON_TIME = 10,
    LATE_AIRLINE = 20,
    LATE_WEATHER = 30,
    LATE_TECHNICAL = 40,
    LATE_OTHER = 50
}

export class Airline {
    constructor(private readonly name: string,
                private readonly account: string) {
    }
}

export class Flight {
    constructor(private readonly airline: Airline,
                private readonly code: string,
                private readonly date: moment.Moment,
                public status: FlightStatus) {
    }
}
