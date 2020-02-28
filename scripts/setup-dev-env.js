const FlightSuretyApp = artifacts.require("FlightSuretyApp");

module.exports = async function(callback) {
    const contract = await FlightSuretyApp.deployed();
    const accounts = await web3.eth.getAccounts();
    console.log(accounts);
    
    const isAirline = await contract.isAirline(accounts[1]);
    console.log(isAirline);
    
    callback();
}
