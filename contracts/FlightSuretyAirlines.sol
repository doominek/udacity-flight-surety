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

    constructor(bytes32 name, address account) AirlineRole(account) public {
        addToAirlines(name, account);
    }

    struct Airline {
        bytes32 name;
        address account;
        uint date;
    }

    Airline[] public airlines;

    enum VoteStatus {
        NONE,
        ACCEPT,
        REJECT
    }

    struct AirlineJoinRequest {
        bytes32 name;
        mapping(address => VoteStatus) votes;
        uint8 totalAccepted;
        uint8 totalRejected;
    }

    mapping(address => AirlineJoinRequest) public requests;

    modifier notVoted(address airline) {
        require(requests[airline].votes[msg.sender] == VoteStatus.NONE, "Already voted");
        _;
    }

    function registerAirline(bytes32 name, address account) public {
        if (airlines.length < 4) {
            addToAirlines(name, account);
            addAirline(account);
        } else {
            addToRequests(name, account);
            approveAirlineJoinRequest(account);
        }
    }

    function addToAirlines(bytes32 name, address account) private {
        Airline memory airline = Airline({
            name : name,
            account : account,
            date : now
            });
        airlines.push(airline);
    }

    function addToRequests(bytes32 name, address account) private {
        AirlineJoinRequest memory request = AirlineJoinRequest({
            name : name,
            totalAccepted : 0,
            totalRejected : 0
            });
        requests[account] = request;
    }

    function approveAirlineJoinRequest(address airline) public onlyAirline notVoted(airline) {
        AirlineJoinRequest storage request = requests[airline];
        request.votes[msg.sender] = VoteStatus.ACCEPT;
        request.totalAccepted += 1;
    }

    function rejectAirlineJoinRequest(address airline) public onlyAirline notVoted(airline) {
        AirlineJoinRequest storage request = requests[airline];
        request.votes[msg.sender] = VoteStatus.ACCEPT;
        request.totalRejected += 1;
    }

    function getAllAirlines() public view returns (bytes32[] memory _names, address[] memory _accounts, uint[] memory _dates) {
        bytes32[] memory names = new bytes32[](airlines.length);
        address[] memory accounts = new address[](airlines.length);
        uint[] memory dates = new uint[](airlines.length);

        for (uint i = 0; i < airlines.length; i++) {
            Airline storage airline = airlines[i];
            names[i] = bytes32(airline.name);
            accounts[i] = airline.account;
            dates[i] = airline.date;
        }

        return (names, accounts, dates);
    }
}
