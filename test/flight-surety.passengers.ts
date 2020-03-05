import { FlightSuretyAppInstance } from '../generated/truffle/contracts';
import moment from 'moment';
import * as _ from 'lodash';

const chai = require('chai');
const BN = require('bn.js');

chai.use(require('chai-bn')(BN));
const expect = chai.expect;


const FlightSuretyApp = artifacts.require('FlightSuretyApp');

enum InsuranceStatus {
    PAID, FOR_PAYOUT, REPAID
}

interface Insurance {
    flight: string;
    paidAmount: string;
    status: InsuranceStatus;
    lastModifiedDate: moment.Moment
}

function parseInsurance(data: any[]): Insurance {
    const [ flight, paidAmount, status, lastModifiedDate ] = data;
    return {
        flight,
        paidAmount,
        status: status.toNumber(),
        lastModifiedDate: moment.unix(lastModifiedDate)
    }
}

function parseInsurances(data: any[]) {
    return _.range(data[0].length)
            .map(idx => parseInsurance([ data[0][idx],
                                         data[1][idx],
                                         data[2][idx],
                                         data[3][idx] ]));
}

contract('FlightSuretyApp - Passengers', async (accounts) => {

    let contract: FlightSuretyAppInstance;

    const [
        owner,
        airline,
        passenger1,
        passenger2
    ] = accounts;

    const flight1 = web3.utils.soliditySha3(airline, 'DF-100', moment().unix());
    const flight2 = web3.utils.soliditySha3(airline, 'DF-200', moment().unix());

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

        describe('after successful purchase', () => {
            let initialContractBalance: string;
            const paidFee = web3.utils.toWei('1', 'ether');

            before(async () => {
                initialContractBalance = await web3.eth.getBalance(contract.address);

                await contract.purchaseInsurance(flight1, {
                    from: passenger1,
                    value: paidFee
                });


            });

            it('should register new insurance with the amount paid', async () => {
                const insurances = parseInsurances(await contract.getMyInsurances({ from: passenger1 }));

                expect(insurances).to.have.lengthOf(1);
                const insurance = insurances[0];
                expect(insurance.status).to.be.eq(InsuranceStatus.PAID);
                expect(insurance.paidAmount.toString()).to.be.eq(paidFee.toString());
            });

            it('should increase contract balance with the amount paid', async () => {
                const finalBalance = await web3.eth.getBalance(contract.address);
                const balanceChange = web3.utils.toBN(finalBalance).sub(web3.utils.toBN(initialContractBalance));

                expect(balanceChange.toString()).to.be.eq(paidFee.toString());
            });
        });
    });

    describe('when crediting insurees', () => {
        let insurance: Insurance;
        before(async () => {
            await contract.purchaseInsurance(flight2, {
                from: passenger2,
                value: web3.utils.toWei('1', 'ether')
            });

            await contract.creditInsured(flight1);

            const insurances = parseInsurances(await contract.getMyInsurances({ from: passenger1 }));
            insurance = insurances[0];
        });

        it('should change status of insurance to FOR_PAYOUT', async () => {
            expect(insurance.status).to.be.eq(InsuranceStatus.FOR_PAYOUT);
        });
    });

    describe('when payout requested', () => {
        let initialContractBalance: BN;
        let initialPassengerBalance: BN;
        const expectedPayout = new BN(web3.utils.toWei("1.5", "ether"));

        before(async () => {
            initialContractBalance = new BN(await web3.eth.getBalance(contract.address));
            initialPassengerBalance = new BN(await web3.eth.getBalance(passenger1));

            await contract.payoutAll({
                from: passenger1
            });
        });

        it('should transfer credit amount to passenger', async () => {
            const finalPassengerBalance = new BN(await web3.eth.getBalance(passenger1));

            const passengerBalanceChange = finalPassengerBalance.sub(initialPassengerBalance);

            const tolerance = new BN(web3.utils.toWei('0.002', 'ether'));
            expect(passengerBalanceChange).to.be.a.bignumber.that.is.closeTo(expectedPayout, tolerance);
        });

        it('should transfer credit amount from contract', async () => {
            const finalContractBalance = new BN(await web3.eth.getBalance(contract.address));

            const contractBalanceChange = initialContractBalance.sub(finalContractBalance);

            expect(contractBalanceChange).to.be.a.bignumber.that.is.eq(expectedPayout);
        });

        it('should update insurance status', async () => {
            const insurance = parseInsurances(await contract.getMyInsurances({ from: passenger1 }))[0];

            expect(insurance.status).to.be.eq(InsuranceStatus.REPAID);
        });
    });

});
