import Web3Utils from 'web3-utils';
import moment from 'moment';

const Web3EthAbi = require('web3-eth-abi')

export enum FlightStatus {
    UNKNOWN = 0,
    ON_TIME = 10,
    LATE_AIRLINE = 20,
    LATE_WEATHER = 30,
    LATE_TECHNICAL = 40,
    LATE_OTHER = 50
}

export class Airline {
    constructor(public readonly name: string,
                public readonly account: string) {
    }
}

export class Flight {
    public readonly key: string;

    constructor(public readonly airline: Airline,
                public readonly code: string,
                public readonly date: moment.Moment,
                public status: FlightStatus) {
        this.key = flightKey(airline.account, code, date.unix());
    }
}

export const flightKey = (airline: string, code: string, date: number) => {
    return Web3Utils.keccak256(Web3EthAbi.encodeParameters([ 'address', 'string', 'uint256' ],
                                                           [ airline, code, date ]));
};
