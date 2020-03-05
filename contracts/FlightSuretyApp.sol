pragma solidity ^0.5.16;

import "./FlightSuretyAirlines.sol";
import "./FlightSuretyInterfaces.sol";
import "./FlightSuretyPassengers.sol";


contract FlightSuretyApp is FlightSuretyPassengers {
    FlightSuretyOraclesDataContract flightSuretyOraclesData;

    constructor(bytes32 name, address account, address dataContractAddress)
        public
        FlightSuretyPassengers(name, account, dataContractAddress)
    {
        flightSuretyOraclesData = FlightSuretyOraclesDataContract(dataContractAddress);
    }

    /**
     * @dev Called after oracle has updated flight status
     *
     */
    function processFlightStatus(address airline, string memory flight, uint256 timestamp, uint8 statusCode) internal {
        flightSuretyOraclesData.addFlight(airline, flight, timestamp, statusCode);
    }

    function getFlight(address airline, string calldata flight, uint256 timestamp)
        external
        view
        returns (bool isRegistered, uint8 statusCode, uint256 updatedTimestamp)
    {
        return flightSuretyOraclesData.getFlight(airline, flight, timestamp);
    }

    // Generate a request for oracles to fetch flight information
    function fetchFlightStatus(address airline, string calldata flight, uint256 timestamp) external {
        uint8 index = getRandomIndex(msg.sender, keccak256(abi.encode(airline, flight, timestamp)));

        // Generate a unique key for storing the request
        flightSuretyOraclesData.addOracleResponseInfo(index, airline, flight, timestamp, msg.sender);

        emit OracleRequest(index, airline, flight, timestamp);
    }

    uint8 private nonce = 0;

    // Fee to be paid when registering oracle
    uint256 public constant ORACLE_REGISTRATION_FEE = 1 ether;

    // Number of oracles that must respond for valid status
    uint256 private constant MIN_RESPONSES = 3;

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

        flightSuretyOraclesData.registerOracle(msg.sender, indexes);
    }

    function getMyIndexes() external view returns (uint8[3] memory) {
        require(flightSuretyOraclesData.isOracleRegistered(msg.sender), "Not registered as an oracle");

        return flightSuretyOraclesData.getOracleIndexes(msg.sender);
    }

    // Called by oracle when a response is available to an outstanding request
    // For the response to be accepted, there must be a pending request that is open
    // and matches one of the three Indexes randomly assigned to the oracle at the
    // time of registration (i.e. uninvited oracles are not welcome)
    function submitOracleResponse(uint8 index, address airline, string calldata flight, uint256 timestamp, uint8 statusCode)
        external
        whenNotPaused
    {
        require(flightSuretyOraclesData.isIndexAssignedToOracle(index, msg.sender), "Index does not match oracle request");

        require(
            flightSuretyOraclesData.isOracleResponseInfoOpen(index, airline, flight, timestamp),
            "Flight or timestamp do not match oracle request"
        );

        flightSuretyOraclesData.registerOracleResponse(index, airline, flight, timestamp, statusCode, msg.sender);
        emit OracleReport(airline, flight, timestamp, statusCode);

        // Information isn't considered verified until at least MIN_RESPONSES
        // oracles respond with the *** same *** information
        if (flightSuretyOraclesData.getOracleResponseCountWithStatus(index, airline, flight, timestamp, statusCode) >= MIN_RESPONSES) {
            flightSuretyOraclesData.closeOracleResponse(index, airline, flight, timestamp);

            // Handle flight status as appropriate
            processFlightStatus(airline, flight, timestamp, statusCode);
            emit FlightStatusInfo(airline, flight, timestamp, statusCode);
        }
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
