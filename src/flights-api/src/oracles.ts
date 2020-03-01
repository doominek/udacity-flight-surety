import FlightSuretyApp from '../../../build/contracts/FlightSuretyApp.json';
import { FlightSuretyApp as FlightSuretyAppContract } from '../../../generated/web3/contracts/FlightSuretyApp';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import * as _ from 'lodash';

const MAX_NUMBER_OF_ORACLES = 20;
let oracles = [];

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

    for (let idx = 0; idx < MAX_NUMBER_OF_ORACLES; idx++) {
        const account = accounts[20 + idx];

        await contract.methods.registerOracle().send({ from: account, value: fee, gas: "0x6691b7" });
        const indexes = await contract.methods.getMyIndexes().call({ from: account });

        oracles.push({ idx, account: account, indexes });
    }

    console.log("oracles => ", oracles);

    return contract;
};

export {
    connect,
    registerOracles
};
