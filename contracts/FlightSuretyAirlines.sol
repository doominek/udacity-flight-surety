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

    function assignAirlineRole(address account) public onlyAirline {
        _addAirline(account);
    }

    function renounceAirlineRole() public {
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

    uint constant AIRLINE_FUNDING_FEE = 10 ether;

    constructor(bytes32 name, address account) AirlineRole(account) public {
        addAirline(name, account);
    }

    struct Airline {
        bytes32 name;
        address account;
        uint date;
        bool paid;
    }

    Airline[] public airlines;
    mapping(address => uint) private airlineIndexByAccount;

    enum VoteStatus {
        NONE,
        ACCEPT,
        REJECT
    }

    enum RequestStatus {
        PENDING,
        ACCEPTED,
        REJECTED
    }

    struct AirlineJoinRequest {
        bytes32 name;
        mapping(address => VoteStatus) votes;
        uint8 totalAccepted;
        uint8 totalRejected;
        RequestStatus status;
    }

    mapping(address => AirlineJoinRequest) public requests;

    modifier notVoted(address airline) {
        require(requests[airline].votes[msg.sender] == VoteStatus.NONE, "Already voted.");
        _;
    }

    modifier pending(address airline) {
        require(requests[airline].status == RequestStatus.PENDING, "Must be in PENDING state.");
        _;
    }

    function registerAirline(bytes32 name, address account) public {
        if (airlines.length < 4) {
            addAirline(name, account);
            assignAirlineRole(account);
        } else {
            createRequest(name, account);
            acceptAirlineJoinRequest(account);
        }
    }

    function addAirline(bytes32 name, address account) internal {
        airlineIndexByAccount[account] = airlines.length;
        Airline memory airline = Airline({
            name : name,
            account : account,
            date : now,
            paid : false
            });
        airlines.push(airline);
    }

    function createRequest(bytes32 name, address requester) internal {
        AirlineJoinRequest memory request = AirlineJoinRequest({
            name : name,
            totalAccepted : 0,
            totalRejected : 0,
            status : RequestStatus.PENDING
            });
        requests[requester] = request;
    }

    function tryFinalizeRequest(AirlineJoinRequest storage request, address requester) internal {
        if (uint16(request.totalAccepted) * 100 / airlines.length >= 50) {
            request.status = RequestStatus.ACCEPTED;
            addAirline(request.name, requester);
            assignAirlineRole(requester);
        } else if (uint16(request.totalRejected) * 100 / airlines.length >= 50) {
            request.status = RequestStatus.REJECTED;
        }
    }

    function acceptAirlineJoinRequest(address requester) public onlyAirline notVoted(requester) pending(requester) {
        AirlineJoinRequest storage request = requests[requester];
        request.votes[msg.sender] = VoteStatus.ACCEPT;
        request.totalAccepted += 1;
        tryFinalizeRequest(request, requester);
    }

    function rejectAirlineJoinRequest(address requester) public onlyAirline notVoted(requester) pending(requester) {
        AirlineJoinRequest storage request = requests[requester];
        request.votes[msg.sender] = VoteStatus.REJECT;
        request.totalRejected += 1;
        tryFinalizeRequest(request, requester);
    }

    function submitFundingFee() payable external onlyAirline {
        require(msg.value == AIRLINE_FUNDING_FEE, "Incorrect funding fee.");
        Airline storage airline = airlines[airlineIndexByAccount[msg.sender]];

        require(!airline.paid, "Funding fee already submitted.");

        airline.paid = true;
    }

    function getAllAirlines() public view returns (bytes32[] memory _names, address[] memory _accounts, uint[] memory _dates, bool[] memory _paid) {
        bytes32[] memory names = new bytes32[](airlines.length);
        address[] memory accounts = new address[](airlines.length);
        uint[] memory dates = new uint[](airlines.length);
        bool[] memory paid = new bool[](airlines.length);

        for (uint i = 0; i < airlines.length; i++) {
            Airline storage airline = airlines[i];
            names[i] = bytes32(airline.name);
            accounts[i] = airline.account;
            dates[i] = airline.date;
            paid[i] = airline.paid;

        }

        return (names, accounts, dates, paid);
    }
}
