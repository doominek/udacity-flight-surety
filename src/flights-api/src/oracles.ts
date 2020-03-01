import FlightSuretyApp from '../../../build/contracts/FlightSuretyApp.json';
import { FlightSuretyApp as FlightSuretyAppContract } from '../../../generated/web3/contracts/FlightSuretyApp';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import * as _ from 'lodash';

class FlightStatusOracles {
    private oracles: FlightStatusOracle[] = [];

    constructor() {
    }

    add(oracle: FlightStatusOracle) {
        this.oracles.push(oracle);
    }

    findWithIndex(idx: number): FlightStatusOracle[] {
        return this.oracles
                   .filter(o => o.indexes.some(i => i === idx));
    }

    toString() {
        return this.oracles;
    }
}

class FlightStatusOracle {
    constructor(private readonly id: number,
                public readonly account: string,
                public readonly indexes: number[]) {
    }

    toString(): string {
        return `FlightStatusOracle(id=${this.id},account=${this.account},indexes${this.indexes})`;
    }
}

const NUMBER_OF_ORACLES = 20;
const MIN_NUMBER_OF_REQUIRED_RESPONSES = 3;
const MAX_GAS_AMOUNT = '0x6691b7';
const oracles: FlightStatusOracles = new FlightStatusOracles();

const connect = async () => {
    const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));

    const accounts = await web3.eth.getAccounts();
    web3.eth.defaultAccount = accounts[0];

    const network = await web3.eth.net.getId();
    const address = _.get(FlightSuretyApp.networks, `${network}.address`);
    const contract = new web3.eth.Contract(FlightSuretyApp.abi as AbiItem[], address) as FlightSuretyAppContract;

    return {
        contract,
        accounts,
        web3
    }
};

const registerOracles = async (contract: FlightSuretyAppContract, accounts: string[]) => {
    const fee = await contract.methods.ORACLE_REGISTRATION_FEE().call();

    for (let idx = 0; idx < NUMBER_OF_ORACLES; idx++) {
        const account = accounts[20 + idx];

        await contract.methods.registerOracle().send({ from: account, value: fee, gas: MAX_GAS_AMOUNT });
        const indexes = await contract.methods.getMyIndexes().call({ from: account });

        oracles.add(new FlightStatusOracle(idx, account, indexes.map(i => parseInt(i, 10))));
    }
};

interface OracleRequestEventData {
    index: string;
    airline: string;
    flight: string;
    timestamp: string;
}

const subscribeToOracleRequestEvents = async (contract: FlightSuretyAppContract) => {
    async function submitFlightStatusResponse(event: OracleRequestEventData) {
        const idx = parseInt(event.index, 10);
        const matchedOracles = _.take(oracles.findWithIndex(idx),
                                      MIN_NUMBER_OF_REQUIRED_RESPONSES);
        for (let oracle of matchedOracles) {
            await contract.methods.submitOracleResponse(idx,
                                                        event.airline,
                                                        event.flight,
                                                        event.timestamp,
                                                        10)
                          .send({ from: oracle.account, gas: MAX_GAS_AMOUNT });
        }
    }

    contract.events.OracleRequest({ fromBlock: 'latest' },
                                  async (error, result) => {
                                      if (error) {
                                          console.error(error);
                                      } else {
                                          await submitFlightStatusResponse(result.returnValues);
                                      }
                                  });
};

export {
    connect,
    registerOracles,
    subscribeToOracleRequestEvents
};
