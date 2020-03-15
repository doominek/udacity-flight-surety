pragma solidity ^0.5.16;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

import "./FlightSuretyAirlines.sol";
import "./FlightSuretyInterfaces.sol";


contract FlightSuretyPassengers is FlightSuretyAirlines {
    FlightSuretyPassengersDataContract private flightSuretyPassengersData;

    constructor(bytes32 name, address account, address dataContractAddress)
        public
        FlightSuretyAirlines(name, account, dataContractAddress)
    {
        flightSuretyPassengersData = FlightSuretyPassengersDataContract(dataContractAddress);
    }

    uint256 private constant MAX_INSURANCE_FEE = 1 ether;
    uint256 private constant DELAYED_FLIGHT_PRC_MULTIPLIER = 150;

    function purchaseInsurance(bytes32 flightKey) external payable whenNotPaused {
        require(msg.value <= MAX_INSURANCE_FEE, "Maximum allowed insurance fee is 1 ether.");

        flightSuretyPassengersData.addInsurance(flightKey, msg.sender, msg.value);
    }

    function getMyInsurances()
        external
        view
        returns (bytes32[] memory flight, uint256[] memory paidAmount, uint256[] memory creditAmount, uint256[] memory status)
    {
        return flightSuretyPassengersData.getAllInsurances(msg.sender);
    }

    function creditInsured(bytes32 flightKey) public whenNotPaused {
        flightSuretyPassengersData.setInsuranceForPayout(flightKey, DELAYED_FLIGHT_PRC_MULTIPLIER);
    }

    function payoutAll() external whenNotPaused {
        uint256 payoutTotal = flightSuretyPassengersData.totalAvailablePayoutAmount(msg.sender);
        flightSuretyPassengersData.setInsurancesAsRepaid(msg.sender);

        msg.sender.transfer(payoutTotal);
    }
}
