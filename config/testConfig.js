const FlightSuretyApp = artifacts.require("FlightSuretyApp");
const FlightSuretyData = artifacts.require("FlightSuretyData");

const Config = async function(accounts) {
    
    const owner = accounts[0];
    const firstAirline = accounts[1];

    const flightSuretyData = await FlightSuretyData.deployed();
    const flightSuretyApp = await FlightSuretyApp.deployed();

    return {
        owner,
        firstAirline,
        flightSuretyData,
        flightSuretyApp
    }
};

module.exports = {
    Config: Config
};
