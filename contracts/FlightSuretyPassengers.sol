pragma solidity ^0.5.16;

import "./FlightSuretyInterfaces.sol";


contract FlightSuretyPassengers {
    enum InsuranceStatus { PAID, FOR_PAYOUT, REPAID }

    struct Insurance {
        address insured;
        bytes32 flight;
        uint256 paidAmount;
        uint256 creditAmount;
        InsuranceStatus status;
        uint256 lastModifiedDate;
    }

    Insurance[] private insurances;

    mapping(address => uint256[]) passengerInsurances;

    uint256 private constant MAX_INSURANCE_FEE = 1 ether;

    function purchaseInsurance(bytes32 flightKey) external payable {
        require(msg.value <= MAX_INSURANCE_FEE, "Maximum allowed insurance fee is 1 ether.");

        Insurance memory insurance = Insurance({
            insured: msg.sender,
            flight: flightKey,
            paidAmount: msg.value,
            creditAmount: 0,
            status: InsuranceStatus.PAID,
            lastModifiedDate: now
        });
        insurances.push(insurance);
        passengerInsurances[msg.sender].push(insurances.length - 1);
    }

    function getMyInsurances()
        external
        view
        returns (
            bytes32[] memory flight,
            uint256[] memory paidAmount,
            uint256[] memory creditAmount,
            InsuranceStatus[] memory status,
            uint256[] memory lastModifiedDate
        )
    {
        uint256 numOfInsurances = passengerInsurances[msg.sender].length;
        bytes32[] memory flights = new bytes32[](numOfInsurances);
        uint256[] memory paidAmounts = new uint256[](numOfInsurances);
        uint256[] memory creditAmounts = new uint256[](numOfInsurances);
        InsuranceStatus[] memory statuses = new InsuranceStatus[](numOfInsurances);
        uint256[] memory lastModifiedDates = new uint256[](numOfInsurances);

        for (uint256 i = 0; i < numOfInsurances; i++) {
            Insurance storage insurance = insurances[passengerInsurances[msg.sender][i]];
            flights[i] = insurance.flight;
            paidAmounts[i] = insurance.paidAmount;
            creditAmounts[i] = insurance.creditAmount;
            statuses[i] = insurance.status;
            lastModifiedDates[i] = insurance.lastModifiedDate;
        }

        return (flights, paidAmounts, creditAmounts, statuses, lastModifiedDates);
    }

    function getFlightKey(address airline, string memory flight, uint256 timestamp) internal pure returns (bytes32) {
        return keccak256(abi.encode(airline, flight, timestamp));
    }
}
