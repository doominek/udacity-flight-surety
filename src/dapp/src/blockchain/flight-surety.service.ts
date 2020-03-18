import Web3 from 'web3';
import { FlightSuretyApp as FlightSuretyAppContract } from '../../../../generated/web3/contracts/FlightSuretyApp';
import { Airline, Request } from '../types/airlines';
import { Flight, FlightStatus } from '../types/flights';
import { Insurance } from '../types/insurance';
import * as _ from 'lodash';
import moment from 'moment';

export class FlightSuretyService {
    constructor(private web3: Web3, private accounts: string[], private flightSuretyApp: FlightSuretyAppContract) {
    }

    get currentAccount(): string {
        return this.accounts[0];
    }

    async isAirline() {
        return this.flightSuretyApp.methods.isAirline(this.currentAccount).call();
    }

    async getAirlines(): Promise<Airline[]> {
        return this.flightSuretyApp.methods.getAllAirlines().call().then(result => this.parseAirlines(result));
    }

    async submitFundingFee() {
        const fundingFee = await this.flightSuretyApp.methods.AIRLINE_FUNDING_FEE().call();
        await this.flightSuretyApp.methods.submitFundingFee().send({ from: this.currentAccount, value: fundingFee });
    }

    async registerAirline(name: string, account: string) {
        const nameAsHex = this.web3.utils.utf8ToHex(name);
        await this.flightSuretyApp.methods.registerAirline(nameAsHex, account).send({ from: this.currentAccount })
    }

    async getRequests(): Promise<Request[]> {
        return this.flightSuretyApp.methods.getAllRequests().call().then(result => this.parseRequests(result));
    }

    async getFlights(): Promise<Flight[]> {
        return fetch('/api/flights')
            .then(response => response.json());
    }

    async updateFlightStatus(flightKey: string, newStatus: FlightStatus) {
        return fetch(`/api/flights/${flightKey}/update-status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });
    }

    async voteToAcceptRequest(requester: string) {
        await this.flightSuretyApp.methods.voteToAcceptRequest(requester).send({ from: this.currentAccount });
    }

    async voteToRejectRequest(requester: string) {
        await this.flightSuretyApp.methods.voteToRejectRequest(requester).send({ from: this.currentAccount });
    }

    async payout() {
        await this.flightSuretyApp.methods.payoutAll().send({ from: this.currentAccount });
    }

    async getMyInsurances(): Promise<Insurance[]> {
        return await this.flightSuretyApp.methods.getMyInsurances()
                         .call({ from: this.currentAccount })
                         .then(result => this.parseInsurances(result));
    }

    async fetchFlightStatus(flight: Flight) {
        await this.flightSuretyApp.methods.fetchFlightStatus(flight.airline.account, flight.code, moment(flight.date).unix())
                  .send({ from: this.currentAccount });
    }

    private parseInsurance(flight: string, paidAmount: string, creditAmount: string, status: string): Insurance {
        return {
            flight,
            paidAmount,
            creditAmount,
            status: parseInt(status)
        };
    }

    private parseInsurances(data: { flight: string[], paidAmount: string[], status: string[], creditAmount: string[] }): Insurance[] {
        return _.range(data?.flight?.length)
                .map(idx => this.parseInsurance(data.flight[idx],
                                                data.paidAmount[idx],
                                                data.creditAmount[idx],
                                                data.status[idx]));
    }

    private parseAirline(data: any[]): Airline {
        const [ name, account, date, paid ] = data;
        return {
            name: this.web3.utils.hexToUtf8(name),
            account,
            date: parseInt(date),
            paid
        }
    }

    private parseAirlines(airlinesData: { _names: string[]; _accounts: string[]; _dates: string[]; _paid: boolean[]; '0': string[]; '1': string[]; '2': string[]; '3': boolean[] }) {
        return _.range(airlinesData[0]?.length)
                .map(idx => this.parseAirline([ airlinesData[0][idx],
                                                airlinesData[1][idx],
                                                airlinesData[2][idx],
                                                airlinesData[3][idx] ]));
    }

    private parseRequests(requestsData: { _name: string[]; _account: string[]; _votesAccepted: string[]; _votesRejected: string[]; _status: string[] }): Request[] {
        if (!requestsData) {
            return [];
        }

        return _.range(requestsData?._name?.length)
                .map(idx => ({
                    name: this.web3.utils.hexToUtf8(requestsData._name[idx]),
                    account: requestsData._account[idx],
                    votesAccepted: parseInt(requestsData._votesAccepted[idx]),
                    votesRejected: parseInt(requestsData._votesRejected[idx]),
                    status: parseInt(requestsData._status[idx])
                }));
    }

    async purchaseInsurance(flightKey: string, value: string) {
        await this.flightSuretyApp.methods.purchaseInsurance(flightKey).send({ from: this.currentAccount, value });
    }
}
