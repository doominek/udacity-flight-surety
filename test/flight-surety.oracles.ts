import { FlightSuretyAppInstance } from '../generated/contracts';
import exp = require('constants');

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
        oracle,
        firstOracle
    ] = accounts;

    const oracles = accounts.slice(5,10);

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
                assert.fail("should throw error");
            } catch (e) {
                expect(e.reason).to.eq("Registration fee is required");
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

            const result = await contract.fetchFlightStatus(oracle, flight, timestamp);

            expect(result.logs).to.have.lengthOf(1);

            const log = result.logs[0];
            expect(log.event).to.eq('OracleRequest');
            expect(log.args['airline']).to.eq(oracle);
            expect(log.args['flight']).to.eq(flight);
            expect(log.args['index']).to.be.not.null;
        })
    });

    describe('when submitting response', () => {
        before(async () => {});

        it.skip('can request flight status', async () => {

            // ARRANGE
            const flight = 'ND1309'; // Course number
            const timestamp = Math.floor(Date.now() / 1000);

            // Submit a request for oracles to get status information for a flight
            const result = await contract.fetchFlightStatus(oracle, flight, timestamp);
            const requiredOracleIdx = result.logs[0].args['index'];
            // ACT

            // Since the Index assigned to each test account is opaque by design
            // loop through all the accounts and for each account, all its Indexes (indices?)
            // and submit a response. The contract will reject a submission if it was
            // not requested so while sub-optimal, it's a good test of that feature
            for (const oracle of oracles) {
                // Get oracle information
                const oracleIndexes = await contract.getMyIndexes({ from: oracle });
                console.log(oracleIndexes);

                for (let idx of oracleIndexes) {
                    if (!idx.eq(requiredOracleIdx)) {
                        console.log(`Inappropriate index: ${idx}. Required: ${requiredOracleIdx}`);
                        continue;
                    }
                    try {
                        // Submit a response...it will only be accepted if there is an Index match
                        await contract.submitOracleResponse(idx,
                                                            oracle,
                                                            flight,
                                                            timestamp,
                                                            STATUS_CODE_ON_TIME,
                                                            { from: oracle });
                        console.log(`Success for: ${oracle} and idx: ${idx}`);

                    } catch (e) {
                        // Enable this when debugging
                        console.log(e);
                        console.log('Error', idx.toNumber(), flight, timestamp);
                    }
                }
            }


        });
    });




});
