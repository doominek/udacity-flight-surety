pragma solidity ^0.5.16;

import "../node_modules/openzeppelin-solidity/contracts/access/Roles.sol";
import "./FlightSuretyInterfaces.sol";

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

    uint private constant AIRLINE_FUNDING_FEE = 1 ether;
    uint16 private constant MIN_CONSENSUS_PERCENTAGE = 50;

    FlightSuretyDataContract private flightSuretyData;

    constructor(bytes32 name, address account, address dataContractAddress) AirlineRole(account) public {
        flightSuretyData = FlightSuretyDataContract(dataContractAddress);
        flightSuretyData.addAirline(name, account);
    }

    modifier notVoted(address airline) {
        require(flightSuretyData.requestNotVoted(airline, msg.sender), "Already voted.");
        _;
    }

    modifier pending(address airline) {
        require(flightSuretyData.requestIsPending(airline), "Must be in PENDING state.");
        _;
    }

    modifier whenFundingFeePaid() {
        require(flightSuretyData.isFundingFeePaid(msg.sender), "Funding fee not paid");
        _;
    }

    function registerAirline(bytes32 name, address account) public onlyAirline whenFundingFeePaid {
        if (flightSuretyData.numberOfAirlines() < 4) {
            flightSuretyData.addAirline(name, account);
            assignAirlineRole(account);
        } else {
            flightSuretyData.createRequest(name, account);
            flightSuretyData.voteToAcceptRequest(account);
        }
    }

    function tryFinalizeRequest(address requester) internal {
        if (flightSuretyData.requestAcceptancePercentage(requester) >= MIN_CONSENSUS_PERCENTAGE) {
            flightSuretyData.acceptRequest(requester);
            assignAirlineRole(requester);
        } else if (flightSuretyData.requestRejectionPercentage(requester) >= MIN_CONSENSUS_PERCENTAGE) {
            flightSuretyData.rejectRequest(requester);
        }
    }

    function voteToAcceptRequest(address requester) public onlyAirline notVoted(requester) pending(requester) {
        flightSuretyData.voteToAcceptRequest(requester);
        tryFinalizeRequest(requester);
    }

    function voteToRejectRequest(address requester) public onlyAirline notVoted(requester) pending(requester) {
        flightSuretyData.voteToRejectRequest(requester);
        tryFinalizeRequest(requester);
    }

    function submitFundingFee() payable external onlyAirline {
        require(msg.value == AIRLINE_FUNDING_FEE, "Incorrect funding fee.");
        require(!flightSuretyData.isFundingFeePaid(msg.sender), "Funding fee already submitted.");

        flightSuretyData.markFundingFeePaymentComplete(msg.sender);
    }

    function getAirline(address addr) external view returns (bytes32 name, address account, uint date, bool paid) {
        return flightSuretyData.getAirline(addr);
    }

    function getAllAirlines() public view returns (bytes32[] memory _names, address[] memory _accounts, uint[] memory _dates, bool[] memory _paid) {
        return flightSuretyData.getAllAirlines();
    }
}


