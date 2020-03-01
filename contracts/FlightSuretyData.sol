pragma solidity ^0.5.16;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "../node_modules/openzeppelin-solidity/contracts/access/Roles.sol";


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

contract FlightSuretyData is Ownable, AuthorizedCallerRole {
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

