pragma solidity ^0.5.16;

import "./FlightSuretyInterfaces.sol";


contract FlightSuretyPassengers {
    struct Insurance {
        address insured;
        bytes32 flight;
        uint256 amountPaid;
        uint256 amountForPayout;
        bool closed;
        uint256 lastModifiedDate;
    }

    mapping(address => Insurance[]) insurances;

    uint256 private constant MAX_INSURANCE_FEE = 1 ether;

    function purchaseInsurance(bytes32 flightKey) external payable {
        require(msg.value <= MAX_INSURANCE_FEE, "Maximum allowed insurance fee is 1 ether.");

        Insurance memory insurance = Insurance({
            insured: msg.sender,
            flight: flightKey,
            amountPaid: msg.value,
            amountForPayout: 0,
            closed: false,
            lastModifiedDate: now
        });
        insurances[msg.sender].push(insurance);
    }

    function getMyInsurances()
        external
        view
        returns (
            bytes32[] memory flight,
            uint256[] memory amountPaid,
            uint256[] memory amountForPayout,
            bool[] memory closed,
            uint256[] memory lastModifiedDate
        )
    {
        Insurance[] storage sendersInsurances = insurances[msg.sender];
        bytes32[] memory flights = new bytes32[](sendersInsurances.length);
        uint256[] memory amountsPaid = new uint256[](sendersInsurances.length);
        uint256[] memory amountsForPayout = new uint256[](sendersInsurances.length);
        bool[] memory closedStatuses = new bool[](sendersInsurances.length);
        uint256[] memory lastModifiedDates = new uint256[](sendersInsurances.length);

        for (uint256 i = 0; i < sendersInsurances.length; i++) {
            Insurance storage insurance = sendersInsurances[i];
            flights[i] = insurance.flight;
            amountsPaid[i] = insurance.amountPaid;
            amountsForPayout[i] = insurance.amountForPayout;
            closedStatuses[i] = insurance.closed;
            lastModifiedDates[i] = insurance.lastModifiedDate;
        }

        return (flights, amountsPaid, amountsForPayout, closedStatuses, lastModifiedDates);
    }

    function getFlightKey(address airline, string memory flight, uint256 timestamp) internal pure returns (bytes32) {
        return keccak256(abi.encode(airline, flight, timestamp));
    }
}
