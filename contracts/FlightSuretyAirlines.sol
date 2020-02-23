pragma solidity ^0.5.16;

import "../node_modules/openzeppelin-solidity/contracts/access/Roles.sol";

contract AirlineRole {
    using Roles for Roles.Role;

    event AirlineAdded(address indexed account);
    event AirlineRemoved(address indexed account);

    Roles.Role private airlineAccounts;

    constructor (address account) internal {
        _addAirline(account);
    }

    modifier onlyAirline() {
        require(isAirline(msg.sender), "AirlineRole: caller does not have the Airline role");
        _;
    }

    function isAirline(address account) public view returns (bool) {
        return airlineAccounts.has(account);
    }

    function addAirline(address account) public onlyAirline {
        _addAirline(account);
    }

    function renounceAirline() public {
        _removeAirline(msg.sender);
    }

    function _addAirline(address account) internal {
        airlineAccounts.add(account);
        emit AirlineAdded(account);
    }

    function _removeAirline(address account) internal {
        airlineAccounts.remove(account);
        emit AirlineRemoved(account);
    }
}

contract FlightSuretyAirlines is AirlineRole {

    constructor(address initialAirline) AirlineRole(initialAirline) public {
    }

    function registerAirline() external pure returns(bool success, uint256 votes)
    {
        return (success, 0);
    }
}
