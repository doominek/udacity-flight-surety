const FlightSuretyApp = artifacts.require("FlightSuretyApp");
const FlightSuretyData = artifacts.require("FlightSuretyData");

module.exports = async (deployer, network, accounts) => {
    await deployer.deploy(FlightSuretyData);
    await deployer.deploy(FlightSuretyApp, web3.utils.utf8ToHex("Lufthansa"), accounts[1]);

    const dataInstance = await FlightSuretyData.deployed();
    const appInstance = await FlightSuretyApp.deployed();

    await dataInstance.authorizeCaller(appInstance.address);
};
