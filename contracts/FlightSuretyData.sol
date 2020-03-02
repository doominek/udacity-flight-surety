pragma solidity ^0.5.16;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "../node_modules/openzeppelin-solidity/contracts/access/Roles.sol";

import "./FlightSuretyInterfaces.sol";

contract FlightSuretyDataAirlines is FlightSuretyDataContract {
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

    function addAirline(bytes32 name, address account) external {
        airlineIndexByAccount[account] = airlines.length;
        Airline memory airline = Airline({
            name : name,
            account : account,
            date : now,
            paid : false
            });
        airlines.push(airline);
    }

    function numberOfAirlines() external view returns (uint) {
        return airlines.length;
    }

    function markFundingFeePaymentComplete(address airline) external {
        airlines[airlineIndexByAccount[airline]].paid = true;
    }

    function createRequest(bytes32 name, address requester) external {
        AirlineJoinRequest memory request = AirlineJoinRequest({
            name : name,
            totalAccepted : 0,
            totalRejected : 0,
            status : RequestStatus.PENDING
            });
        requests[requester] = request;
    }

    function voteToAcceptRequest(address requester) external {
        AirlineJoinRequest storage request = requests[requester];
        request.votes[msg.sender] = VoteStatus.ACCEPT;
        request.totalAccepted += 1;
    }

    function voteToRejectRequest(address requester) external {
        AirlineJoinRequest storage request = requests[requester];
        request.votes[msg.sender] = VoteStatus.REJECT;
        request.totalRejected += 1;
    }

    function acceptRequest(address requester) external {
        requests[requester].status = RequestStatus.ACCEPTED;

        airlineIndexByAccount[requester] = airlines.length;
        Airline memory airline = Airline({
            name : requests[requester].name,
            account : requester,
            date : now,
            paid : false
            });
        airlines.push(airline);
    }

    function rejectRequest(address requester) external {
        requests[requester].status = RequestStatus.REJECTED;
    }

    function requestAcceptancePercentage(address requester) external view returns (uint16) {
        return uint16(uint16(requests[requester].totalAccepted) * 100 / airlines.length);
    }

    function requestRejectionPercentage(address requester) external view returns (uint16) {
        return uint16(uint16(requests[requester].totalRejected) * 100 / airlines.length);
    }

    function requestNotVoted(address airline, address voter) external view returns (bool) {
        return requests[airline].votes[voter] == VoteStatus.NONE;
    }

    function isFundingFeePaid(address airline) external view returns (bool) {
        return airlines[airlineIndexByAccount[airline]].paid;
    }

    function requestIsPending(address airline) external view returns (bool) {
        return requests[airline].status == RequestStatus.PENDING;
    }

    function getAirline(address addr) external view returns (bytes32 name, address account, uint date, bool paid) {
        Airline storage airline = airlines[airlineIndexByAccount[addr]];

        return (airline.name, airline.account, airline.date, airline.paid);
    }

    function getAllAirlines() external view returns (bytes32[] memory _names, address[] memory _accounts, uint[] memory _dates, bool[] memory _paid) {
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


contract AuthorizedCallerRole {
    using Roles for Roles.Role;

    Roles.Role private authorizedCallers;

    modifier onlyAuthorizedCaller() {
        require(isAuthorizedCaller(msg.sender), "Caller is not authorized");
        _;
    }

    function isAuthorizedCaller(address account) public view returns (bool) {
        return authorizedCallers.has(account);
    }

    function addAuthorizedCaller(address account) internal {
        authorizedCallers.add(account);
    }

    function removeAuthorizedCaller(address account) internal {
        authorizedCallers.remove(account);
    }
}

contract FlightSuretyData is Ownable, AuthorizedCallerRole, FlightSuretyDataAirlines {
    using SafeMath for uint256;

    constructor() public {
    }

    /**
     * @dev Add an airline to the registration queue
     *      Can only be called from FlightSuretyApp contract
     *
     */
    function registerAirline() external pure {
    }


    /**
     * @dev Buy insurance for a flight
     *
     */
    function buy() external payable {
    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees() external pure {
    }


    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay() external pure {
    }

    /**
     * @dev Initial funding for the insurance. Unless there are too many delayed flights
     *      resulting in insurance payouts, the contract should be self-sustaining
     *
     */
    function fund() public payable {
    }

    function getFlightKey(address airline, string memory flight, uint256 timestamp) pure internal returns (bytes32){
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function() external payable {
        fund();
    }

    function authorizeCaller(address account) external onlyOwner {
        addAuthorizedCaller(account);
    }
}

