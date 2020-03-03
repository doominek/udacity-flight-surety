import { FlightSuretyAppInstance } from '../generated/truffle/contracts';
import moment from 'moment';

const FlightSuretyApp = artifacts.require('FlightSuretyApp');

contract('FlightSuretyApp - Passengers', async (accounts) => {

    let contract: FlightSuretyAppInstance;

    const [
        owner,
        airline,
        passenger1
    ] = accounts;

    const flight1 = web3.utils.soliditySha3(airline, 'DF-100', moment().unix());

    before('setup contract', async () => {
        contract = await FlightSuretyApp.deployed();
    });

    describe('when buying insurance', () => {
        it('should fail when more than 1 ether paid', async () => {
            try {
                await contract.purchaseInsurance(flight1, {
                    from: passenger1,
                    value: web3.utils.toWei('1.1', 'ether')
                });
                assert.fail('should throw error');
            } catch (e) {
                expect(e.reason).to.eq('Maximum allowed insurance fee is 1 ether.');
            }
        });
    });

});
