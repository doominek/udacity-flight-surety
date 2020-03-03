import { FlightSuretyAppInstance } from '../generated/truffle/contracts';
import moment from 'moment';
import * as _ from 'lodash';

const FlightSuretyApp = artifacts.require('FlightSuretyApp');

interface Insurance {
    flight: string;
    amountPaid: string;
    amountForPayout: string;
    closed: boolean;
    lastModifiedDate: moment.Moment
}

function parseInsurance(data: any[]): Insurance {
    const [ flight, amountPaid, amountForPayout, closed, lastModifiedDate ] = data;
    return {
        flight,
        amountPaid,
        amountForPayout,
        closed,
        lastModifiedDate: moment.unix(lastModifiedDate)
    }
}

function parseInsurances(insurancesData: any[]) {
    return _.range(insurancesData[0].length)
            .map(idx => parseInsurance([ insurancesData[0][idx],
                                         insurancesData[1][idx],
                                         insurancesData[2][idx],
                                         insurancesData[3][idx],
                                         insurancesData[4][idx] ]));
}

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
                expect(insurance.closed).to.be.false;
                expect(insurance.amountPaid.toString()).to.be.eq(paidFee.toString());
            });

            it('should increase contract balance with the amount paid', async () => {
                const finalBalance = await web3.eth.getBalance(contract.address);
                const balanceChange = web3.utils.toBN(finalBalance).sub(web3.utils.toBN(initialContractBalance));

                expect(balanceChange.toString()).to.be.eq(paidFee.toString());
            });
        });
    });

});
