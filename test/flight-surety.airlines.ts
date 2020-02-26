import { FlightSuretyAppInstance } from '../generated/contracts';
import { expect } from 'chai';

const FlightSuretyApp = artifacts.require('FlightSuretyApp');

contract('FlightSuretyApp - Airlines', async (accounts) => {
    let instance: FlightSuretyAppInstance;

    const [
        owner,
        firstAirline,
        secondAirline,
        thirdAirline,
        fourthAirline,
        firstCandidateAirline,
        secondCandidateAirline
    ] = accounts;

    before(async () => {
        instance = await FlightSuretyApp.deployed();
    });

    describe('when contract initialized', () => {
        it('first airline should be registered automatically', async () => {
            const isAirline = await instance.isAirline(firstAirline);
            expect(isAirline).to.be.true;
        });
    });

    describe('when registering new airline', () => {
        it('should be allowed only for other airlines', async () => {
            try {
                await instance.registerAirline(
                    web3.utils.utf8ToHex('Virgin'), firstCandidateAirline,
                    { from: owner });
                assert.fail('should throw error');
            } catch (e) {
                assert.equal(e.reason, 'AirlineRole: caller does not have the Airline role')
            }
        });

        it('should be allowed only when funding fee paid', async () => {
            try {
                await instance.registerAirline(
                    web3.utils.utf8ToHex('Virgin'), firstCandidateAirline,
                    { from: secondAirline });
                assert.fail('should throw error');
            } catch (e) {
                assert.equal(e.reason, 'Funding fee not paid')
            }
        });
    });

    describe('when registering 5th airline', () => {
        it('should be accepted after 2 requests approved', async () => {
            await instance.registerAirline(web3.utils.utf8ToHex('PLL Lot - 1'), firstCandidateAirline, { from: firstAirline });
            await instance.acceptAirlineJoinRequest(firstCandidateAirline, { from: secondAirline });

            const airlines = await instance.getAllAirlines();

            expect(airlines[ 0 ]).to.have.lengthOf(5, 'should be 5 airlines');
        });
    });

    describe.skip('when registering 6th airline', () => {
        it('should be accepted after 3 requests approved', async () => {
            await instance.registerAirline(web3.utils.utf8ToHex('PLL Lot - 2'), secondCandidateAirline, { from: firstAirline });
            await instance.acceptAirlineJoinRequest(secondCandidateAirline, { from: secondAirline });
            await instance.acceptAirlineJoinRequest(secondCandidateAirline, { from: thirdAirline });

            let airlines: any = await instance.getAllAirlines();

            expect(airlines[ 0 ]).to.have.lengthOf(6);

            await instance.submitFundingFee({ from: secondCandidateAirline, value: web3.utils.toWei('1', 'ether') });

            airlines = await instance.getAllAirlines();

            console.log(airlines);
            expect(airlines[ 3 ][ 5 ]).to.be.true;
        });
    });

});
