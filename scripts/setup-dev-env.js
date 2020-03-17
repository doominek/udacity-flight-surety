const FlightSuretyApp = artifacts.require("FlightSuretyApp");

module.exports = async function(callback) {
    try { 
        const contract = await FlightSuretyApp.deployed();
        const accounts = await web3.eth.getAccounts();

        const fundingFee = await contract.AIRLINE_FUNDING_FEE({ from: accounts[1] });

        await contract.submitFundingFee({ from: accounts[1], value: fundingFee });

        await contract.registerAirline(web3.utils.utf8ToHex('WhizzAir'), accounts[2], { from: accounts[1] });
        await contract.submitFundingFee({ from: accounts[2], value: fundingFee });

        await contract.registerAirline(web3.utils.utf8ToHex('Fly Emirates'), accounts[3], { from: accounts[1] });
        await contract.submitFundingFee({ from: accounts[3], value: fundingFee });

        await contract.registerAirline(web3.utils.utf8ToHex('PLL Lot'), accounts[4], { from: accounts[1] });
        await contract.registerAirline(web3.utils.utf8ToHex('Air Canada'), accounts[5], { from: accounts[1] });

        console.log('Setting up test data completed successfully!');

        callback();
    } catch (e) {
        console.error('Setting up test data failed!');
        callback(e);
    }
}
