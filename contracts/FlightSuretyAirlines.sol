pragma solidity ^0.5.16;

import "../node_modules/openzeppelin-solidity/contracts/access/Roles.sol";
import "../node_modules/openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";

import "./FlightSuretyInterfaces.sol";


contract FlightSuretyAppBase is Ownable, Pausable {
    using SafeMath for uint256;
}


contract AirlineRole {
    using Roles for Roles.Role;

    event AirlineAdded(address indexed account);
    event AirlineRemoved(address indexed account);

    Roles.Role private airlineAccounts;

    constructor(address account) internal {
        _addAirline(account);
    }

    modifier onlyAirline() {
        require(isAirline(msg.sender), "AirlineRole: caller does not have the Airline role");
        _;
    }

    function isAirline(address account) public view returns (bool) {
        return airlineAccounts.has(account);
    }

    function assignAirlineRole(address account) internal onlyAirline {
        _addAirline(account);
    }

    function renounceAirlineRole() internal {
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


contract FlightSuretyAirlines is FlightSuretyAppBase, AirlineRole {
    uint256 public constant AIRLINE_FUNDING_FEE = 5 ether;
    uint8 private constant MIN_AIRLINES_NUMBER_FOR_CONSENSUS = 4;
    uint8 private constant MIN_CONSENSUS_PERCENTAGE = 50;

    FlightSuretyAirlinesDataContract private flightSuretyAirlinesData;

    constructor(bytes32 name, address account, address dataContractAddress) public AirlineRole(account) {
        flightSuretyAirlinesData = FlightSuretyAirlinesDataContract(dataContractAddress);
        flightSuretyAirlinesData.addAirline(name, account);
    }

    modifier notVoted(address airline) {
        require(flightSuretyAirlinesData.requestNotVoted(airline, msg.sender), "Already voted.");
        _;
    }

    modifier pending(address airline) {
        require(flightSuretyAirlinesData.requestIsPending(airline), "Must be in PENDING state.");
        _;
    }

    modifier whenFundingFeePaid() {
        require(flightSuretyAirlinesData.isFundingFeePaid(msg.sender), "Funding fee not paid");
        _;
    }

    function registerAirline(bytes32 name, address account) public onlyAirline whenFundingFeePaid whenNotPaused {
        if (flightSuretyAirlinesData.numberOfAirlines() < MIN_AIRLINES_NUMBER_FOR_CONSENSUS) {
            flightSuretyAirlinesData.addAirline(name, account);
            assignAirlineRole(account);
        } else {
            flightSuretyAirlinesData.createRequest(name, account);
            flightSuretyAirlinesData.voteToAcceptRequest(account, msg.sender);
        }
    }

    function tryFinalizeRequest(address requester) internal {
        if (flightSuretyAirlinesData.requestAcceptancePercentage(requester) >= MIN_CONSENSUS_PERCENTAGE) {
            flightSuretyAirlinesData.acceptRequest(requester);
            assignAirlineRole(requester);
        } else if (flightSuretyAirlinesData.requestRejectionPercentage(requester) >= MIN_CONSENSUS_PERCENTAGE) {
            flightSuretyAirlinesData.rejectRequest(requester);
        }
    }

    function voteToAcceptRequest(address requester) public onlyAirline notVoted(requester) pending(requester) whenNotPaused {
        flightSuretyAirlinesData.voteToAcceptRequest(requester, msg.sender);
        tryFinalizeRequest(requester);
    }

    function voteToRejectRequest(address requester) public onlyAirline notVoted(requester) pending(requester) whenNotPaused {
        flightSuretyAirlinesData.voteToRejectRequest(requester, msg.sender);
        tryFinalizeRequest(requester);
    }

    function submitFundingFee() external payable onlyAirline whenNotPaused {
        require(msg.value == AIRLINE_FUNDING_FEE, "Incorrect funding fee.");
        require(!flightSuretyAirlinesData.isFundingFeePaid(msg.sender), "Funding fee already submitted.");

        flightSuretyAirlinesData.markFundingFeePaymentComplete(msg.sender);
    }

    function getAirline(address addr) external view returns (bytes32 name, address account, uint256 date, bool paid) {
        return flightSuretyAirlinesData.getAirline(addr);
    }

    function getAllAirlines()
        public
        view
        returns (bytes32[] memory _names, address[] memory _accounts, uint256[] memory _dates, bool[] memory _paid)
    {
        return flightSuretyAirlinesData.getAllAirlines();
    }

    function getAllRequests()
        public
        view
        returns (
            bytes32[] memory _name,
            address[] memory _account,
            uint8[] memory _votesAccepted,
            uint8[] memory _votesRejected,
            uint8[] memory _status
        )
    {
        return flightSuretyAirlinesData.getAllRequests();
    }
}
