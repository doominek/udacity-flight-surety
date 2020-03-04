pragma solidity ^0.5.16;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";


contract FlightSuretyPassengers {
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

    mapping(address => uint256[]) passengerInsurances;
    mapping(bytes32 => uint256[]) flightInsurances;

    uint256 private constant MAX_INSURANCE_FEE = 1 ether;
    uint256 private constant DELAYED_FLIGHT_PRC_MULTIPLIER = 150;

    function addInsurance(bytes32 flightKey, address insured, uint256 paidAmount) internal {
        Insurance memory insurance = Insurance({
            insured: insured,
            flight: flightKey,
            paidAmount: paidAmount,
            creditAmount: 0,
            status: InsuranceStatus.PAID,
            lastModifiedDate: now
            });
        insurances.push(insurance);
        passengerInsurances[msg.sender].push(insurances.length - 1);
        flightInsurances[flightKey].push(insurances.length - 1);
    }

    function purchaseInsurance(bytes32 flightKey) external payable {
        require(msg.value <= MAX_INSURANCE_FEE, "Maximum allowed insurance fee is 1 ether.");

        addInsurance(flightKey, msg.sender, msg.value);
    }

    function getAllInsurancesForInsured(address insured)
        internal
        view
        returns (
            bytes32[] memory flight,
            uint256[] memory paidAmount,
            InsuranceStatus[] memory status,
            uint256[] memory lastModifiedDate
        )
    {
        uint256 numOfInsurances = passengerInsurances[insured].length;
        bytes32[] memory flights = new bytes32[](numOfInsurances);
        uint256[] memory paidAmounts = new uint256[](numOfInsurances);
        InsuranceStatus[] memory statuses = new InsuranceStatus[](numOfInsurances);
        uint256[] memory lastModifiedDates = new uint256[](numOfInsurances);

        for (uint256 i = 0; i < numOfInsurances; i++) {
            Insurance storage insurance = insurances[passengerInsurances[insured][i]];
            flights[i] = insurance.flight;
            paidAmounts[i] = insurance.paidAmount;
            statuses[i] = insurance.status;
            lastModifiedDates[i] = insurance.lastModifiedDate;
        }

        return (flights, paidAmounts, statuses, lastModifiedDates);
    }

    function getMyInsurances()
    external
    view
    returns (
        bytes32[] memory flight,
        uint256[] memory paidAmount,
        InsuranceStatus[] memory status,
        uint256[] memory lastModifiedDate
    ) {
        return getAllInsurancesForInsured(msg.sender);
    }

    function setInsuranceForPayout(bytes32 flightKey, uint256 paidAmountPercentMultiplier) internal {
        for (uint256 i = 0; i < flightInsurances[flightKey].length; i++) {
            Insurance storage insurance = insurances[flightInsurances[flightKey][i]];
            insurance.creditAmount = insurance.paidAmount.mul(paidAmountPercentMultiplier).div(100);
            insurance.status = InsuranceStatus.FOR_PAYOUT;
            insurance.lastModifiedDate = now;
        }
    }

    function creditInsured(bytes32 flightKey) external {
        setInsuranceForPayout(flightKey, DELAYED_FLIGHT_PRC_MULTIPLIER);
    }

    function totalAvailablePayoutAmount(address insured) internal view returns (uint256) {
        uint256 result = 0;

        for (uint256 i = 0; i < passengerInsurances[insured].length; i++) {
            Insurance storage insurance = insurances[passengerInsurances[insured][i]];
            if (insurance.status == InsuranceStatus.FOR_PAYOUT) {
                result = result.add(insurance.creditAmount);
            }
        }

        return result;
    }

    function setInsurancesAsRepaid(address insured) internal {
        for (uint256 i = 0; i < passengerInsurances[insured].length; i++) {
            Insurance storage insurance = insurances[passengerInsurances[insured][i]];
            if (insurance.status == InsuranceStatus.FOR_PAYOUT) {
                insurance.status = InsuranceStatus.REPAID;
                insurance.lastModifiedDate = now;
            }
        }
    }

    function payoutAll() external {
        uint256 payoutTotal = totalAvailablePayoutAmount(msg.sender);
        setInsurancesAsRepaid(msg.sender);

        msg.sender.transfer(payoutTotal);
    }
}
