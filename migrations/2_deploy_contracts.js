const FlightSuretyApp = artifacts.require("FlightSuretyApp");
const FlightSuretyData = artifacts.require("FlightSuretyData");

module.exports = async (deployer, network, accounts) => {
    await deployer.deploy(FlightSuretyData);
    await FlightSuretyData.deployed();
    await deployer.deploy(FlightSuretyApp, web3.utils.utf8ToHex("Lufthansa"), accounts[1]);
};
