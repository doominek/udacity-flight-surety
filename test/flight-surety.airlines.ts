import { FlightSuretyAppInstance } from '../generated/truffle/contracts';
import { expect } from 'chai';
import * as _ from 'lodash';

const FlightSuretyApp = artifacts.require('FlightSuretyApp');

interface Airline {
    name: string;
    account: string;
    date: Date;
    paid: boolean;
}

function parseAirline(data: any[]): Airline {
    const [ name, account, date, paid ] = data;
    return {
        name: web3.utils.hexToUtf8(name),
        account,
        date: new Date(date.toNumber() * 1000),
        paid
    }
}

function parseAirlines(airlinesData: any[]) {
    return _.range(airlinesData[0].length)
            .map(idx => parseAirline([ airlinesData[0][idx],
                                       airlinesData[1][idx],
                                       airlinesData[2][idx],
                                       airlinesData[3][idx] ]));
}

contract('FlightSuretyApp - Airlines', async (accounts) => {
    let instance: FlightSuretyAppInstance;

    const [
        owner,
        firstAirline,
        secondAirline,
        thirdAirline,
        fourthAirline,
        firstCandidateAirline,
        secondCandidateAirline,
        thirdCandidateAirline
    ] = accounts;

    const fundingFee = web3.utils.toWei('1', 'ether');

    before(async () => {
        instance = await FlightSuretyApp.deployed();
    });

    describe('when contract initialized', () => {
        it('first airline should be registered automatically', async () => {
            const isAirline = await instance.isAirline(firstAirline);
            expect(isAirline).to.be.true;
        });

        it('first airline should wait for submitting funding', async () => {
            const airline = parseAirline(await instance.getAirline(firstAirline));

            expect(airline.paid).to.be.false;
        });

        it('should accept submitting funding fee', async () => {
            await instance.submitFundingFee({ from: firstAirline, value: fundingFee });

            const airline = parseAirline(await instance.getAirline(firstAirline));

            expect(airline.paid).to.be.true;
        })
    });

    describe('when registering new airlines', () => {
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

        it('should not require voting when not more than 4 airlines', async () => {
            await instance.registerAirline(web3.utils.utf8ToHex('WhizzAir'), secondAirline, { from: firstAirline });
            await instance.registerAirline(web3.utils.utf8ToHex('Air Canada'), thirdAirline, { from: firstAirline });
            await instance.registerAirline(web3.utils.utf8ToHex('PLL Lot'), fourthAirline, { from: firstAirline });

            const airlines = parseAirlines(await instance.getAllAirlines());

            expect(airlines).to.have.lengthOf(4);
            _.range(1, 4).forEach(newAirlinesIdx => {
                expect(airlines[1].paid).to.be.false;
            });
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

    describe('(multiparty consensus)', () => {
        describe('when registering 5th airline', () => {
            it('should be accepted after 2 requests approved', async () => {
                await instance.registerAirline(web3.utils.utf8ToHex('New Airline - 1'), firstCandidateAirline, { from: firstAirline });

                const isAirline = await instance.isAirline(secondCandidateAirline);
                expect(isAirline).to.be.false;

                await instance.voteToAcceptRequest(firstCandidateAirline, { from: secondAirline });

                const airlines = parseAirlines(await instance.getAllAirlines());
                expect(airlines).to.have.lengthOf(5, 'should be 5 airlines');

                const newAirline = _.last(airlines) as Airline;
                expect(newAirline.account).to.equal(firstCandidateAirline);
                expect(newAirline.paid).to.be.false;
                expect(newAirline.name).to.equal('New Airline - 1');
            });
        });

        describe('when registering 6th airline', () => {
            it('should be accepted after 3 requests approved', async () => {
                await instance.registerAirline(web3.utils.utf8ToHex('New Airline - 2'), secondCandidateAirline, { from: firstAirline });

                const isAirline = await instance.isAirline(secondCandidateAirline);

                expect(isAirline).to.be.false;

                await instance.voteToAcceptRequest(secondCandidateAirline, { from: secondAirline });
                await instance.voteToAcceptRequest(secondCandidateAirline, { from: thirdAirline });

                const airlines = parseAirlines(await instance.getAllAirlines());

                expect(airlines).to.have.lengthOf(6, 'should be 6 airlines');

                const newAirline = _.last(airlines) as Airline;

                expect(newAirline.account).to.equal(secondCandidateAirline);
                expect(newAirline.paid).to.be.false;
                expect(newAirline.name).to.equal('New Airline - 2');
            });
        });

        describe('when registering 7th airline', () => {
            it('should be rejected after 3 requests rejected', async () => {
                await instance.registerAirline(web3.utils.utf8ToHex('New Airline - 3'), thirdCandidateAirline, { from: firstAirline });

                const isAirline = await instance.isAirline(thirdCandidateAirline);

                expect(isAirline).to.be.false;

                await instance.voteToRejectRequest(thirdCandidateAirline, { from: secondAirline });
                await instance.voteToRejectRequest(thirdCandidateAirline, { from: thirdAirline });
                await instance.voteToRejectRequest(thirdCandidateAirline, { from: fourthAirline });

                const airlines = parseAirlines(await instance.getAllAirlines());

                expect(airlines).to.have.lengthOf(6, 'should be 6 airlines');
            });

            it('should not allow voting for request that is completed', async () => {
                try {
                    await instance.voteToRejectRequest(thirdCandidateAirline, { from: firstCandidateAirline });
                    assert.fail('should throw error');
                } catch (e) {
                    assert.equal(e.reason, 'Must be in PENDING state.');
                }
            });
        });
    });


});
