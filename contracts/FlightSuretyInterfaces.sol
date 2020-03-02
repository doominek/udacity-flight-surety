pragma solidity ^0.5.16;


interface FlightSuretyDataContract {

    function getAirline(address addr) external view returns (bytes32 name, address account, uint date, bool paid);

    function getAllAirlines() external view returns (bytes32[] memory _names, address[] memory _accounts, uint[] memory _dates, bool[] memory _paid);

    function addAirline(bytes32 name, address account) external;

    function numberOfAirlines() external view returns (uint);

    function isFundingFeePaid(address airline) external view returns (bool);

    function markFundingFeePaymentComplete(address airline) external;


    function createRequest(bytes32 name, address requester) external;

    function voteToAcceptRequest(address requester) external;

    function voteToRejectRequest(address requester) external;

    function acceptRequest(address requester) external;

    function rejectRequest(address requester) external;

    function requestAcceptancePercentage(address requester) external view returns (uint16);

    function requestRejectionPercentage(address requester) external view returns (uint16);

    function requestNotVoted(address airline, address voter) external view returns (bool);

    function requestIsPending(address airline) external view returns (bool);

}


interface FlightSuretyOraclesDataContract {
    function addFlight(address airline, string calldata flight, uint256 timestamp, uint8 statusCode) external;

    function getFlight(address airline, string calldata flight, uint256 timestamp) view external
    returns (bool isRegistered, uint8 statusCode, uint256 updatedTimestamp);

    function addOracleResponseInfo(uint8 index, address airline, string calldata flight, uint256 timestamp, address requester) external;

    function registerOracle(address oracle, uint8[3] calldata indexes) external;

    function getOracleIndexes(address oracle) view external returns (uint8[3] memory);

    function isOracleRegistered(address oracle) view external returns (bool);

    function isIndexAssignedToOracle(uint8 index, address oracle) view external returns (bool);

    function isOracleResponseInfoOpen(uint8 index, address airline, string calldata flight, uint256 timestamp) external view returns (bool);

    function registerOracleResponse(uint8 index, address airline, string calldata flight, uint256 timestamp, uint8 statusCode, address oracle) external;

    function getOracleResponseCountWithStatus(uint8 index, address airline, string calldata flight, uint256 timestamp, uint8 statusCode)
    external view returns (uint);

    function closeOracleResponse(uint8 index, address airline, string calldata flight, uint256 timestamp) external;

}
