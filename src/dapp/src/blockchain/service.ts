import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import * as _ from 'lodash';
import FlightSuretyApp from '../contracts/FlightSuretyApp.json';
import { FlightSuretyApp as FlightSuretyAppContract } from '../../../../generated/web3/contracts/FlightSuretyApp';


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
            console.warn("No web3 instance available. Falling back to local environment");
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
