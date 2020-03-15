pragma solidity ^0.5.16;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "../node_modules/openzeppelin-solidity/contracts/access/Roles.sol";

import "./FlightSuretyInterfaces.sol";


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


contract FlightSuretyAirlinesData is AuthorizedCallerRole, FlightSuretyAirlinesDataContract {
    struct Airline {
        bytes32 name;
        address account;
        uint256 date;
        bool paid;
    }

    Airline[] public airlines;
    mapping(address => uint256) private airlineIndexByAccount;

    enum VoteStatus {NONE, ACCEPT, REJECT}

    enum RequestStatus {PENDING, ACCEPTED, REJECTED}

    struct AirlineJoinRequest {
        bytes32 name;
        mapping(address => VoteStatus) votes;
        uint8 totalAccepted;
        uint8 totalRejected;
        RequestStatus status;
    }

    mapping(address => AirlineJoinRequest) public requests;
    address[] private requesters;

    function addAirline(bytes32 name, address account) external {
        airlineIndexByAccount[account] = airlines.length;
        Airline memory airline = Airline({name: name, account: account, date: now, paid: false});
        airlines.push(airline);
    }

    function numberOfAirlines() external view returns (uint256) {
        return airlines.length;
    }

    function markFundingFeePaymentComplete(address airline) external onlyAuthorizedCaller {
        airlines[airlineIndexByAccount[airline]].paid = true;
    }

    function createRequest(bytes32 name, address requester) external onlyAuthorizedCaller {
        AirlineJoinRequest memory request = AirlineJoinRequest({
            name: name,
            totalAccepted: 0,
            totalRejected: 0,
            status: RequestStatus.PENDING
        });
        requests[requester] = request;
        requesters.push(requester);
    }

    function voteToAcceptRequest(address requester, address approver) external onlyAuthorizedCaller {
        AirlineJoinRequest storage request = requests[requester];
        request.votes[approver] = VoteStatus.ACCEPT;
        request.totalAccepted += 1;
    }

    function voteToRejectRequest(address requester, address rejecter) external onlyAuthorizedCaller {
        AirlineJoinRequest storage request = requests[requester];
        request.votes[rejecter] = VoteStatus.REJECT;
        request.totalRejected += 1;
    }

    function acceptRequest(address requester) external onlyAuthorizedCaller {
        requests[requester].status = RequestStatus.ACCEPTED;

        airlineIndexByAccount[requester] = airlines.length;
        Airline memory airline = Airline({name: requests[requester].name, account: requester, date: now, paid: false});
        airlines.push(airline);
    }

    function rejectRequest(address requester) external onlyAuthorizedCaller {
        requests[requester].status = RequestStatus.REJECTED;
    }

    function requestAcceptancePercentage(address requester) external view returns (uint16) {
        return uint16((uint16(requests[requester].totalAccepted) * 100) / airlines.length);
    }

    function requestRejectionPercentage(address requester) external view returns (uint16) {
        return uint16((uint16(requests[requester].totalRejected) * 100) / airlines.length);
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

    function getAirline(address addr) external view returns (bytes32 name, address account, uint256 date, bool paid) {
        Airline storage airline = airlines[airlineIndexByAccount[addr]];

        return (airline.name, airline.account, airline.date, airline.paid);
    }

    function getAllAirlines()
        external
        view
        returns (bytes32[] memory _names, address[] memory _accounts, uint256[] memory _dates, bool[] memory _paid)
    {
        bytes32[] memory names = new bytes32[](airlines.length);
        address[] memory accounts = new address[](airlines.length);
        uint256[] memory dates = new uint256[](airlines.length);
        bool[] memory paid = new bool[](airlines.length);

        for (uint256 i = 0; i < airlines.length; i++) {
            Airline storage airline = airlines[i];
            names[i] = bytes32(airline.name);
            accounts[i] = airline.account;
            dates[i] = airline.date;
            paid[i] = airline.paid;
        }

        return (names, accounts, dates, paid);
    }

    function getAllRequests()
        external
        view
        returns (
            bytes32[] memory _name,
            address[] memory _account,
            uint8[] memory _votesAccepted,
            uint8[] memory _votesRejected,
            uint8[] memory _status
        )
    {
        bytes32[] memory name = new bytes32[](requesters.length);
        address[] memory account = new address[](requesters.length);
        uint8[] memory votesAccepted = new uint8[](requesters.length);
        uint8[] memory votesRejected = new uint8[](requesters.length);
        uint8[] memory status = new uint8[](requesters.length);

        for (uint256 i = 0; i < requesters.length; i++) {
            AirlineJoinRequest storage request = requests[requesters[i]];
            name[i] = bytes32(request.name);
            account[i] = requesters[i];
            votesAccepted[i] = request.totalAccepted;
            votesRejected[i] = request.totalRejected;
            status[i] = uint8(request.status);
        }

        return (name, account, votesAccepted, votesRejected, status);
    }
}


contract FlightSuretyOraclesData is FlightSuretyAirlinesData, FlightSuretyOraclesDataContract {
    struct Flight {
        bool isRegistered;
        uint8 statusCode;
        uint256 updatedTimestamp;
        address airline;
    }

    mapping(bytes32 => Flight) private flights;

    function addFlight(address airline, string calldata flight, uint256 timestamp, uint8 statusCode) external onlyAuthorizedCaller {
        bytes32 key = getFlightKey(airline, flight, timestamp);

        Flight storage flightData = flights[key];
        flightData.isRegistered = true;
        flightData.statusCode = statusCode;
        flightData.updatedTimestamp = now;
        flightData.airline = airline;
    }

    function getFlight(address airline, string calldata flight, uint256 timestamp)
        external
        view
        returns (bool isRegistered, uint8 statusCode, uint256 updatedTimestamp)
    {
        bytes32 key = getFlightKey(airline, flight, timestamp);
        Flight storage flightData = flights[key];

        return (flightData.isRegistered, flightData.statusCode, flightData.updatedTimestamp);
    }

    function addOracleResponseInfo(uint8 index, address airline, string calldata flight, uint256 timestamp, address requester)
        external
        onlyAuthorizedCaller
    {
        bytes32 key = getOracleResponseInfoKey(index, airline, flight, timestamp);

        oracleResponses[key] = ResponseInfo({requester: requester, isOpen: true});
    }

    struct Oracle {
        bool isRegistered;
        uint8[3] indexes;
    }

    // Track all registered oracles
    mapping(address => Oracle) private oracles;

    // Model for responses from oracles
    struct ResponseInfo {
        address requester; // Account that requested status
        bool isOpen; // If open, oracle responses are accepted
        mapping(uint8 => address[]) responses; // Mapping key is the status code reported
        // This lets us group responses and identify
        // the response that majority of the oracles
    }

    // Track all oracle responses
    // Key = hash(index, flight, timestamp)
    mapping(bytes32 => ResponseInfo) private oracleResponses;

    function registerOracle(address oracle, uint8[3] calldata indexes) external onlyAuthorizedCaller {
        oracles[oracle] = Oracle({isRegistered: true, indexes: indexes});
    }

    function getOracleIndexes(address oracle) external view returns (uint8[3] memory) {
        return oracles[oracle].indexes;
    }

    function isOracleRegistered(address oracle) external view returns (bool) {
        return oracles[oracle].isRegistered;
    }

    function isIndexAssignedToOracle(uint8 index, address oracle) external view returns (bool) {
        return (oracles[oracle].indexes[0] == index) || (oracles[oracle].indexes[1] == index) || (oracles[oracle].indexes[2] == index);
    }

    function isOracleResponseInfoOpen(uint8 index, address airline, string calldata flight, uint256 timestamp)
        external
        view
        returns (bool)
    {
        bytes32 key = getOracleResponseInfoKey(index, airline, flight, timestamp);
        return oracleResponses[key].isOpen;
    }

    function registerOracleResponse(
        uint8 index,
        address airline,
        string calldata flight,
        uint256 timestamp,
        uint8 statusCode,
        address oracle
    ) external onlyAuthorizedCaller {
        bytes32 key = getOracleResponseInfoKey(index, airline, flight, timestamp);
        oracleResponses[key].responses[statusCode].push(oracle);
    }

    function getOracleResponseCountWithStatus(uint8 index, address airline, string calldata flight, uint256 timestamp, uint8 statusCode)
        external
        view
        returns (uint256)
    {
        bytes32 key = getOracleResponseInfoKey(index, airline, flight, timestamp);
        return oracleResponses[key].responses[statusCode].length;
    }

    function closeOracleResponse(uint8 index, address airline, string calldata flight, uint256 timestamp) external onlyAuthorizedCaller {
        bytes32 key = getOracleResponseInfoKey(index, airline, flight, timestamp);
        oracleResponses[key].isOpen = false;
    }

    function getOracleResponseInfoKey(uint8 index, address airline, string memory flight, uint256 timestamp)
        internal
        pure
        returns (bytes32)
    {
        return keccak256(abi.encode(index, airline, flight, timestamp));
    }

    function getFlightKey(address airline, string memory flight, uint256 timestamp) internal pure returns (bytes32) {
        return keccak256(abi.encode(airline, flight, timestamp));
    }
}


contract FlightSuretyPassengersData is FlightSuretyOraclesData, FlightSuretyPassengersDataContract {
    using SafeMath for uint256;

    enum InsuranceStatus {PAID, FOR_PAYOUT, REPAID}

    struct Insurance {
        address insured;
        bytes32 flight;
        uint256 paidAmount;
        uint256 creditAmount;
        InsuranceStatus status;
        uint256 lastModifiedDate;
    }

    Insurance[] private insurances;

    mapping(address => uint256[]) private passengerInsurances;
    mapping(bytes32 => uint256[]) private flightInsurances;

    function addInsurance(bytes32 flightKey, address insured, uint256 paidAmount) external onlyAuthorizedCaller {
        Insurance memory insurance = Insurance({
            insured: insured,
            flight: flightKey,
            paidAmount: paidAmount,
            creditAmount: 0,
            status: InsuranceStatus.PAID,
            lastModifiedDate: now
        });
        insurances.push(insurance);
        passengerInsurances[insured].push(insurances.length - 1);
        flightInsurances[flightKey].push(insurances.length - 1);
    }

    function getAllInsurances(address insured)
        external
        view
        returns (bytes32[] memory flight, uint256[] memory paidAmount, uint256[] memory creditAmount, uint256[] memory status)
    {
        uint256 numOfInsurances = passengerInsurances[insured].length;
        bytes32[] memory flights = new bytes32[](numOfInsurances);
        uint256[] memory paidAmounts = new uint256[](numOfInsurances);
        uint256[] memory creditAmounts = new uint256[](numOfInsurances);
        uint256[] memory statuses = new uint256[](numOfInsurances);

        for (uint256 i = 0; i < numOfInsurances; i++) {
            Insurance storage insurance = insurances[passengerInsurances[insured][i]];
            flights[i] = insurance.flight;
            paidAmounts[i] = insurance.paidAmount;
            creditAmounts[i] = insurance.creditAmount;
            statuses[i] = uint256(insurance.status);
        }

        return (flights, paidAmounts, creditAmounts, statuses);
    }

    function setInsuranceForPayout(bytes32 flightKey, uint256 paidAmountPercentMultiplier) external onlyAuthorizedCaller {
        for (uint256 i = 0; i < flightInsurances[flightKey].length; i++) {
            Insurance storage insurance = insurances[flightInsurances[flightKey][i]];
            insurance.creditAmount = insurance.paidAmount.mul(paidAmountPercentMultiplier).div(100);
            insurance.status = InsuranceStatus.FOR_PAYOUT;
            insurance.lastModifiedDate = now;
        }
    }

    function totalAvailablePayoutAmount(address insured) external view returns (uint256) {
        uint256 result = 0;

        for (uint256 i = 0; i < passengerInsurances[insured].length; i++) {
            Insurance storage insurance = insurances[passengerInsurances[insured][i]];
            if (insurance.status == InsuranceStatus.FOR_PAYOUT) {
                result = result.add(insurance.creditAmount);
            }
        }

        return result;
    }

    function setInsurancesAsRepaid(address insured) external onlyAuthorizedCaller {
        for (uint256 i = 0; i < passengerInsurances[insured].length; i++) {
            Insurance storage insurance = insurances[passengerInsurances[insured][i]];
            if (insurance.status == InsuranceStatus.FOR_PAYOUT) {
                insurance.status = InsuranceStatus.REPAID;
                insurance.lastModifiedDate = now;
            }
        }
    }
}


contract FlightSuretyData is Ownable, FlightSuretyPassengersData {
    function fund() public payable {}

    function() external payable {
        fund();
    }

    function authorizeCaller(address account) external onlyOwner {
        addAuthorizedCaller(account);
    }
}
