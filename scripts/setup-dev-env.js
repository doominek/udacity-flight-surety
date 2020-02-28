const FlightSuretyApp = artifacts.require("FlightSuretyApp");

module.exports = async function(callback) {
    try { 
        const contract = await FlightSuretyApp.deployed();
        const accounts = await web3.eth.getAccounts();
    
        await contract.submitFundingFee({ from: accounts[1], value: web3.utils.toWei("1", "ether") });
    
        callback();
    } catch (e) {
        callback(e);
    }
}
