import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import * as _ from 'lodash';
import FlightSuretyApp from '../contracts/FlightSuretyApp.json';
import { FlightSuretyApp as FlightSuretyAppContract } from '../../../../generated/web3/contracts/FlightSuretyApp';
import { Airline, Request } from '../types/airlines';


declare global {
    interface Window {
        ethereum: any;
    }
}


class FlightSuretyService {
    constructor(private web3: Web3, private accounts: string[], private flightSuretyApp: FlightSuretyAppContract) {
    }

    get defaultAccount(): string {
        return this.accounts[0];
    }

    async isAirline() {
        return this.flightSuretyApp.methods.isAirline(this.defaultAccount).call();
    }

    async getAirlines(): Promise<Airline[]> {
        return this.flightSuretyApp.methods.getAllAirlines().call().then(result => this.parseAirlines(result));
    }

    async submitFundingFee() {
        const fundingFee = await this.flightSuretyApp.methods.AIRLINE_FUNDING_FEE().call();
        await this.flightSuretyApp.methods.submitFundingFee().send({ from: this.defaultAccount, value: fundingFee });
    }

    async registerAirline(name: string, account: string) {
        const nameAsHex = this.web3.utils.utf8ToHex(name);
        await this.flightSuretyApp.methods.registerAirline(nameAsHex, account).send({ from: this.defaultAccount })
    }

    async getRequests(): Promise<Request[]> {
        return this.flightSuretyApp.methods.getAllRequests().call().then(result => this.parseRequests(result));
    }

    async voteToAcceptRequest(requester: string) {
        await this.flightSuretyApp.methods.voteToAcceptRequest(requester).send({ from: this.defaultAccount });
    }

    async voteToRejectRequest(requester: string) {
        await this.flightSuretyApp.methods.voteToRejectRequest(requester).send({ from: this.defaultAccount });
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
        return _.range(airlinesData[0].length)
                .map(idx => this.parseAirline([ airlinesData[0][idx],
                                                airlinesData[1][idx],
                                                airlinesData[2][idx],
                                                airlinesData[3][idx] ]));
    }

    private parseRequests(requestsData: { _name: string[]; _account: string[]; _votesAccepted: string[]; _votesRejected: string[]; _status: string[] }): Request[] {
        if (!requestsData) {
            return [];
        }

        return _.range(requestsData._name.length)
                .map(idx => ({
                    name: this.web3.utils.hexToUtf8(requestsData._name[idx]),
                    account: requestsData._account[idx],
                    votesAccepted: parseInt(requestsData._votesAccepted[idx]),
                    votesRejected: parseInt(requestsData._votesRejected[idx]),
                    status: parseInt(requestsData._status[idx])
                }));
    }
}

class FlightSuretyServiceFactory {

    static async create() {
        const web3 = await this.setupWeb3();
        const contract = await this.getFlightSuretyContract(web3);
        const accounts = await web3.eth.getAccounts();
        return new FlightSuretyService(web3, accounts, contract);
    }

    private static async setupWeb3(): Promise<Web3> {
        let web3: Web3;

        if (window.ethereum) {
            web3 = new Web3(window.ethereum);
            await window.ethereum.enable();
        } else {
            const provider = new Web3.providers.WebsocketProvider('ws://127.0.0.1:8545');
            web3 = new Web3(provider);
            console.warn('No web3 instance available. Falling back to local environment');
        }

        return web3;
    }

    private static async getFlightSuretyContract(web3: Web3): Promise<FlightSuretyAppContract> {
        const network = await web3.eth.net.getId();
        const address = _.get(FlightSuretyApp.networks, `${network}.address`);
        return new web3.eth.Contract(FlightSuretyApp.abi as AbiItem[], address) as FlightSuretyAppContract;
    }
}

let flightSuretyService: FlightSuretyService;

const connect = async () => {
    const service = await FlightSuretyServiceFactory.create();
    flightSuretyService = service;
};

export {
    flightSuretyService,
    connect
}
