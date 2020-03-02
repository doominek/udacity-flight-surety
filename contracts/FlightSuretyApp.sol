pragma solidity ^0.5.16;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "../node_modules/openzeppelin-solidity/contracts/lifecycle/Pausable.sol";

import "./FlightSuretyAirlines.sol";

contract FlightSuretyApp is Ownable, Pausable, FlightSuretyAirlines {
    using SafeMath for uint256;

    // Flight status codees
    uint8 private constant STATUS_CODE_UNKNOWN = 0;
    uint8 private constant STATUS_CODE_ON_TIME = 10;
    uint8 private constant STATUS_CODE_LATE_AIRLINE = 20;
    uint8 private constant STATUS_CODE_LATE_WEATHER = 30;
    uint8 private constant STATUS_CODE_LATE_TECHNICAL = 40;
    uint8 private constant STATUS_CODE_LATE_OTHER = 50;

    struct Flight {
        bool isRegistered;
        uint8 statusCode;
        uint256 updatedTimestamp;
        address airline;
    }

    mapping(bytes32 => Flight) private flights;


    constructor(bytes32 name, address account, address dataContractAddress) FlightSuretyAirlines(name, account, dataContractAddress) public {
    }

    /**
     * @dev Called after oracle has updated flight status
     *
     */
    function processFlightStatus(address airline, string memory flight, uint256 timestamp, uint8 statusCode) internal {
        addFlight(airline, flight, timestamp, statusCode);
    }

    function addFlight(address airline, string memory flight, uint256 timestamp, uint8 statusCode) internal {
        bytes32 key = getFlightKey(airline, flight, timestamp);

        Flight storage flightData = flights[key];
        flightData.isRegistered = true;
        flightData.statusCode = statusCode;
        flightData.updatedTimestamp = now;
        flightData.airline = airline;
    }

    function getFlight(address airline, string calldata flight, uint256 timestamp) view external
    returns (bool isRegistered, uint8 statusCode, uint256 updatedTimestamp) {
        return findFlight(airline, flight, timestamp);
    }

    function findFlight(address airline, string memory flight, uint256 timestamp) view internal
    returns (bool isRegistered, uint8 statusCode, uint256 updatedTimestamp) {
        bytes32 key = getFlightKey(airline, flight, timestamp);
        Flight storage flightData = flights[key];

        return (flightData.isRegistered, flightData.statusCode, flightData.updatedTimestamp);
    }


    // Generate a request for oracles to fetch flight information
    function fetchFlightStatus(address airline, string calldata flight, uint256 timestamp) external {
        uint8 index = getRandomIndex(msg.sender, keccak256(abi.encode(airline, flight, timestamp)));

        // Generate a unique key for storing the request
        addOracleResponseInfo(index, airline, flight, timestamp, msg.sender);

        emit OracleRequest(index, airline, flight, timestamp);
    }

    function addOracleResponseInfo(uint8 index, address airline, string memory flight, uint256 timestamp, address requester) internal {
        bytes32 key = getOracleResponseInfoKey(index, airline, flight, timestamp);

        oracleResponses[key] = ResponseInfo({
            requester : requester,
            isOpen : true
            });
    }


    // region ORACLE MANAGEMENT

    // Incremented to add pseudo-randomness at various points
    uint8 private nonce = 0;

    // Fee to be paid when registering oracle
    uint256 public constant ORACLE_REGISTRATION_FEE = 1 ether;

    // Number of oracles that must respond for valid status
    uint256 private constant MIN_RESPONSES = 3;


    struct Oracle {
        bool isRegistered;
        uint8[3] indexes;
    }

    // Track all registered oracles
    mapping(address => Oracle) private oracles;

    // Model for responses from oracles
    struct ResponseInfo {
        address requester;                              // Account that requested status
        bool isOpen;                                    // If open, oracle responses are accepted
        mapping(uint8 => address[]) responses;          // Mapping key is the status code reported
        // This lets us group responses and identify
        // the response that majority of the oracles
    }

    // Track all oracle responses
    // Key = hash(index, flight, timestamp)
    mapping(bytes32 => ResponseInfo) private oracleResponses;

    // Event fired each time an oracle submits a response
    event FlightStatusInfo(address airline, string flight, uint256 timestamp, uint8 status);

    event OracleReport(address airline, string flight, uint256 timestamp, uint8 status);

    // Event fired when flight status request is submitted
    // Oracles track this and if they have a matching index
    // they fetch data and submit a response
    event OracleRequest(uint8 index, address airline, string flight, uint256 timestamp);


    // Register an oracle with the contract
    function registerOracle() external payable whenNotPaused {
        // Require registration fee
        require(msg.value >= ORACLE_REGISTRATION_FEE, "Registration fee is required");

        uint8[3] memory indexes = generateIndexes(msg.sender);

        registerOracle(msg.sender, indexes);
    }

    function registerOracle(address oracle, uint8[3] memory indexes) internal {
        oracles[oracle] = Oracle({
            isRegistered : true,
            indexes : indexes
            });
    }

    function getMyIndexes() view external returns (uint8[3] memory) {
        require(isOracleRegistered(msg.sender), "Not registered as an oracle");

        return getOracleIndexes(msg.sender);
    }

    function getOracleIndexes(address oracle) view internal returns (uint8[3] memory) {
        return oracles[oracle].indexes;
    }

    function isOracleRegistered(address oracle) view internal returns (bool) {
        return oracles[oracle].isRegistered;
    }

    function isIndexAssignedToOracle(uint8 index, address oracle) view internal returns (bool) {
        return (oracles[oracle].indexes[0] == index) || (oracles[oracle].indexes[1] == index) || (oracles[oracle].indexes[2] == index);
    }

    function isOracleResponseInfoOpen(uint8 index, address airline, string memory flight, uint256 timestamp) internal view returns (bool) {
        bytes32 key = getOracleResponseInfoKey(index, airline, flight, timestamp);
        return oracleResponses[key].isOpen;
    }

    function registerOracleResponse(uint8 index, address airline, string memory flight, uint256 timestamp, uint8 statusCode, address oracle) internal {
        bytes32 key = getOracleResponseInfoKey(index, airline, flight, timestamp);
        oracleResponses[key].responses[statusCode].push(oracle);
    }

    function getOracleResponseCountWithStatus(uint8 index, address airline, string memory flight, uint256 timestamp, uint8 statusCode) internal view returns (uint) {
        bytes32 key = getOracleResponseInfoKey(index, airline, flight, timestamp);
        return oracleResponses[key].responses[statusCode].length;
    }

    function closeOracleResponse(uint8 index, address airline, string memory flight, uint256 timestamp) internal {
        bytes32 key = getOracleResponseInfoKey(index, airline, flight, timestamp);
        oracleResponses[key].isOpen = false;
    }

    // Called by oracle when a response is available to an outstanding request
    // For the response to be accepted, there must be a pending request that is open
    // and matches one of the three Indexes randomly assigned to the oracle at the
    // time of registration (i.e. uninvited oracles are not welcome)
    function submitOracleResponse(uint8 index, address airline, string calldata flight, uint256 timestamp, uint8 statusCode) external whenNotPaused {
        require(isIndexAssignedToOracle(index, msg.sender), "Index does not match oracle request");

        bytes32 key = getOracleResponseInfoKey(index, airline, flight, timestamp);
        ResponseInfo storage responseInfo = oracleResponses[key];

        require(isOracleResponseInfoOpen(index, airline, flight, timestamp), "Flight or timestamp do not match oracle request");

        registerOracleResponse(index, airline, flight, timestamp, statusCode, msg.sender);
        emit OracleReport(airline, flight, timestamp, statusCode);

        // Information isn't considered verified until at least MIN_RESPONSES
        // oracles respond with the *** same *** information
        if (getOracleResponseCountWithStatus(index, airline, flight, timestamp, statusCode) >= MIN_RESPONSES) {
            closeOracleResponse(index, airline, flight, timestamp);

            // Handle flight status as appropriate
            processFlightStatus(airline, flight, timestamp, statusCode);
            emit FlightStatusInfo(airline, flight, timestamp, statusCode);
        }
    }

    function getOracleResponseInfoKey(uint8 index, address airline, string memory flight, uint256 timestamp) pure internal returns (bytes32) {
        return keccak256(abi.encode(index, airline, flight, timestamp));
    }

    function getFlightKey(address airline, string memory flight, uint256 timestamp) pure internal returns (bytes32) {
        return keccak256(abi.encode(airline, flight, timestamp));
    }

    // Returns array of three non-duplicating integers from 0-9
    function generateIndexes(address account) internal returns (uint8[3] memory) {
        uint8[3] memory indexes;
        indexes[0] = getRandomIndex(account, 0);

        indexes[1] = indexes[0];
        while (indexes[1] == indexes[0]) {
            indexes[1] = getRandomIndex(account, 0);
        }

        indexes[2] = indexes[1];
        while ((indexes[2] == indexes[0]) || (indexes[2] == indexes[1])) {
            indexes[2] = getRandomIndex(account, 0);
        }

        return indexes;
    }

    // Returns array of three non-duplicating integers from 0-9
    function getRandomIndex(address account, bytes32 mix) internal returns (uint8) {
        uint8 maxValue = 10;

        // Pseudo random number...the incrementing nonce adds variation
        uint8 random = uint8(uint256(keccak256(abi.encode(blockhash(block.number - nonce++), account, mix))) % maxValue);

        if (nonce > 250) {
            nonce = 0;
            // Can only fetch blockhashes for last 256 blocks so we adapt
        }

        return random;
    }

}   
