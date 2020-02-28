import { FlightSuretyAppInstance } from '../generated/contracts';
import * as _ from 'lodash';

const FlightSuretyApp = artifacts.require('FlightSuretyApp');

contract('FlightSuretyApp - Oracles', async (accounts) => {

    let contract: FlightSuretyAppInstance;

    const STATUS_CODE_UNKNOWN = 0;
    const STATUS_CODE_ON_TIME = 10;
    const STATUS_CODE_LATE_AIRLINE = 20;
    const STATUS_CODE_LATE_WEATHER = 30;
    const STATUS_CODE_LATE_TECHNICAL = 40;
    const STATUS_CODE_LATE_OTHER = 50;

    const [
        owner,
        airline,
        firstOracle
    ] = accounts;

    const oracles = accounts.slice(5, 10);

    before('setup contract', async () => {
        contract = await FlightSuretyApp.deployed();

        // Watch contract events
        const STATUS_CODE_UNKNOWN = 0;
        const STATUS_CODE_ON_TIME = 10;
        const STATUS_CODE_LATE_AIRLINE = 20;
        const STATUS_CODE_LATE_WEATHER = 30;
        const STATUS_CODE_LATE_TECHNICAL = 40;
        const STATUS_CODE_LATE_OTHER = 50;

    });

    describe('when registering oracle', () => {
        it('should fail when no fee send', async () => {
            try {
                await contract.registerOracle({ from: firstOracle, value: '0' });
                assert.fail('should throw error');
            } catch (e) {
                expect(e.reason).to.eq('Registration fee is required');
            }
        });

        it('should generate 3 random indexes for oracle', async () => {
            const fee = await contract.ORACLE_REGISTRATION_FEE();

            await contract.registerOracle({ from: firstOracle, value: fee });
            let indexes = await contract.getMyIndexes({ from: firstOracle });

            expect(indexes).to.have.lengthOf(3);
        });
    });

    describe('when requesting flight status', () => {
        it('should generate a random index for oracle', async () => {
            const flight = 'ND1309'; // Course number
            const timestamp = Math.floor(Date.now() / 1000);

            const result = await contract.fetchFlightStatus(airline, flight, timestamp);

            expect(result.logs).to.have.lengthOf(1);

            const log = result.logs[0];
            expect(log.event).to.eq('OracleRequest');
            expect(log.args['airline']).to.eq(airline);
            expect(log.args['flight']).to.eq(flight);
            expect(log.args['index']).to.be.not.null;
        })
    });

    describe('when submitting oracle response', () => {
        let firstOracleIndexes: any[];
        const timestamp = Math.floor(Date.now() / 1000);
        const flight = 'FL';

        before(async () => {
            firstOracleIndexes = await contract.getMyIndexes({ from: firstOracle });
        });

        it('should fail when index not assigned to oracle', async () => {
            const firstNotMatchingIdx = _.range(20)
                                         .find(num => firstOracleIndexes.every(idx => idx.toNumber() !== num));

            try {
                await contract.submitOracleResponse(firstNotMatchingIdx,
                                                    airline,
                                                    flight,
                                                    timestamp,
                                                    STATUS_CODE_ON_TIME,
                                                    { from: firstOracle });
                assert.fail('should throw error');
            } catch (e) {
                expect(e.reason).to.be.eq('Index does not match oracle request');
            }
        });

        it('should fail when flight do not match oracle request', async () => {
            try {
                await contract.submitOracleResponse(firstOracleIndexes[0],
                                                    airline,
                                                    flight,
                                                    timestamp,
                                                    STATUS_CODE_ON_TIME,
                                                    { from: firstOracle });
                assert.fail('should throw error');
            } catch (e) {
                expect(e.reason).to.be.eq('Flight or timestamp do not match oracle request');
            }
        });

        it('should be accepted when data matches existing request', async () => {
            let requiredOracleIdx: any;
            let flightName;
            let timestamp = Date.now();
            let i = 1;

            do {
                // WORKAROUND: due to random nature of fetching flight status
                // we're creating fetch flight request until it can be accepted for "firstOracle" to simplify test
                flightName = `${flight}/${i}`;
                timestamp = Math.floor(Date.now() / 1000);

                const result = await contract.fetchFlightStatus(airline, flightName, timestamp);
                requiredOracleIdx = result.logs[0].args['index'];
                i++;
            } while (!firstOracleIndexes.some(idx => idx.eq(requiredOracleIdx)));

            await contract.submitOracleResponse(requiredOracleIdx,
                                                airline,
                                                flightName,
                                                timestamp,
                                                STATUS_CODE_ON_TIME,
                                                { from: firstOracle });
        }).timeout(2000);
    });
});
