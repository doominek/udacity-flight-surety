pragma solidity ^0.5.16;

import "./FlightSuretyAirlines.sol";
import "./FlightSuretyInterfaces.sol";
import "./FlightSuretyPassengers.sol";
import "./FlightSuretyOracles.sol";


contract FlightSuretyApp is FlightSuretyOracles {
    constructor(bytes32 name, address account, address dataContractAddress)
        public
        FlightSuretyOracles(name, account, dataContractAddress)
    {}
}
