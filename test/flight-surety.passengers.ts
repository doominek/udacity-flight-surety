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

    const flight1 = {
        airline,
        flight: web3.utils.utf8ToHex('AB-100'),
        date: moment().unix()
    };
    const flight2 = web3.utils.utf8ToHex('AB-200');

    before('setup contract', async () => {
        contract = await FlightSuretyApp.deployed();
    });

    describe('when buying insurance', () => {
        it('should fail when not enough paid', async () => {
            try {
                await contract.buyInsurance(flight1.airline, flight1.flight, flight1.date, {
                    from: passenger1,
                    value: '100'
                });
                assert.fail('should throw error');
            } catch (e) {
                expect(e.reason).to.eq('Not enough');
            }
        });
    });

});
