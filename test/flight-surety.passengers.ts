import { FlightSuretyAppInstance } from '../generated/truffle/contracts';
import moment from 'moment';
import * as _ from 'lodash';

const FlightSuretyApp = artifacts.require('FlightSuretyApp');

enum FlightStatus {
    PAID, FOR_PAYOUT, REPAID
}

interface Insurance {
    flight: string;
    paidAmount: string;
    creditAmount: string;
    status: FlightStatus;
    lastModifiedDate: moment.Moment
}

function parseInsurance(data: any[]): Insurance {
    const [ flight, paidAmount, creditAmount, status, lastModifiedDate ] = data;
    return {
        flight,
        paidAmount,
        creditAmount,
        status: status.toNumber(),
        lastModifiedDate: moment.unix(lastModifiedDate)
    }
}

function parseInsurances(data: any[]) {
    return _.range(data[0].length)
            .map(idx => parseInsurance([ data[0][idx],
                                         data[1][idx],
                                         data[2][idx],
                                         data[3][idx],
                                         data[4][idx] ]));
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
                expect(insurance.status).to.be.eq(FlightStatus.PAID);
                expect(insurance.paidAmount.toString()).to.be.eq(paidFee.toString());
            });

            it('should increase contract balance with the amount paid', async () => {
                const finalBalance = await web3.eth.getBalance(contract.address);
                const balanceChange = web3.utils.toBN(finalBalance).sub(web3.utils.toBN(initialContractBalance));

                expect(balanceChange.toString()).to.be.eq(paidFee.toString());
            });
        });
    });

});
