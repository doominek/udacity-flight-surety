import { FlightSuretyAppInstance } from '../generated/contracts';

const FlightSuretyApp = artifacts.require('FlightSuretyApp');
import { expect } from 'chai';

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

    describe('when registering 5th airline', () => {
        it('should be accepted after 2 requests approved', async () => {
            await instance.registerAirline(web3.utils.utf8ToHex('PLL Lot - 1'), firstCandidateAirline, { from: firstAirline });
            await instance.approveAirlineJoinRequest(firstCandidateAirline, { from: secondAirline });

            const airlines = await instance.getAllAirlines();

            expect(airlines[ 0 ]).to.have.lengthOf(5, 'should be 5 airlines');
        });
    });

    describe('when registering 6th airline', () => {
        it('should be accepted after 3 requests approved', async () => {
            await instance.registerAirline(web3.utils.utf8ToHex('PLL Lot - 2'), secondCandidateAirline, { from: firstAirline });
            await instance.approveAirlineJoinRequest(secondCandidateAirline, { from: secondAirline });
            await instance.approveAirlineJoinRequest(secondCandidateAirline, { from: thirdAirline });

            const airlines = await instance.getAllAirlines();

            expect(airlines[ 0 ]).to.have.lengthOf(6);
        });
    })

});
