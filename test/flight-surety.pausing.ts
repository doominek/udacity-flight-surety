import { FlightSuretyAppInstance } from '../generated/truffle/contracts';

import { expect } from 'chai';

const FlightSuretyApp = artifacts.require('FlightSuretyApp');

contract('FlightSuretyApp - pausing (operationl status)', async (accounts) => {
    let instance: FlightSuretyAppInstance;

    const [
        owner,
        firstAirline
    ] = accounts;

    before(async () => {
        instance = await FlightSuretyApp.deployed();
    });

    it('should be unpaused initially', async () => {
        const state = await instance.paused();

        expect(state, 'Contract should not be paused').to.be.false;
    });

    describe('after pausing', async () => {
        before(async () => {
            await instance.pause();
        });

        it('should be paused', async () => {
            const state = await instance.paused();

            expect(state, 'Contract should be paused').to.be.true;
        });

        it('should not allow calling registerOracle()', async () => {
            try {
                await instance.registerOracle();
                assert.fail('should throw error');
            } catch (e) {
                expect(e.reason).to.be.equal('Pausable: paused');
            }
        });

        it('should not allow to be unpaused by anyone besides pauser', async () => {
            try {
                await instance.unpause({ from: firstAirline });
                assert.fail('should throw error');
            } catch (e) {
                expect(e.reason).to.be.equal('PauserRole: caller does not have the Pauser role')
            }
        });

        describe('when unpausing', async () => {
            before(async () => {
                await instance.unpause({ from: owner });
            });

            it('should be unpaused again', async () => {
                const state = await instance.paused();

                expect(state, 'Contract should not be paused').to.be.false;
            });
        });
    });
});
