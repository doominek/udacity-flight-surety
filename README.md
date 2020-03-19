# Flight Surety

Contains contract and apps for the FlightSurety project.

For dApp showcase please go [here](./src/dapp/docs/DOCUMENTATION.md)

## Running the project

The easiest way to run the project is to use the scripts provided in [package.json](package.json) file
in the following order:
```bash
npm run ganache
npm run test
npm run redeploy
npm run server
npm run dapp
```

Scripts description:
* __ganache__ - runs ganache server on port 8545 with some additional adjustments:
  * number of accounts is increased to 40
  * initial balance is increased to 200 ETH
  * mnemonic to generate accounts is set to: `above sadness level believe palm various soda clutch quiz early conduct connect`
    which can be used to import all the necessary accounts to MetaMask
* __test__ - runs test using Truffle
* __redeploy__ - responsible for preparing dev environment for work:
  * deploys contract to ganache
  * generates Typescript's typings for contracts
  * copies contract's deployment metadata to be available by dapp web app
  * prepopulates environment with some data, details [here](#test-data-setup) 
* __server__ - starts a NodeJS express app that runs Oracles and servers simple, REST-based API for flights management
* __dapp__ - starts React web app that uses FlightSuretyApp contract, docs for this app can be found [here](src/dapp/docs/DOCUMENTATION.md)

## FlightSuretyApp Contract

FlightSuretyApp contract is divided into two parts that contain logic and data. 
Each part is also divided into sub-parts that are responsible for managing Airlines, Oracles and Passengers.

The hierarchy is as follows:
```
Ownable, Pausable    AirlineRole
        ^               ^     
        |               | 

        FlightSuretyAirlines  ---------> FlightSuretyAirlinesData
               ^
               |
       FlightSuretyPassengers ---------> FlightSuretyPassengerData 
               ^
               |
        FlightSuretyOracles   ---------> FligthSuretyOraclesData
               ^
               |
         FlightSuretyApp      ---------> FlightSuretyData     
```

### Test Data Setup

By default Truffle's deploy [script](./migrations/2_deploy_contracts.js) sets up owner of the contract as the _account[0]_
and it registers first airline - _Lufthansa_ as _account[1]_ (in MetaMask this will be the first and second account).

To simplify development/testing additional [script](./scripts/setup-dev-env.js) has been created as external truffle script 
that prepopulates environment with the following additional airlines:
* WhizzAir - _account[3]_, funding fee paid
* Fly Emirates - _account[4]_, funding fee paid
* PLL Lot - _account[5]_, funding fee NOT paid
* Air Canada - _account[6]_, as it is the 5th airline it becomes first request that needs to be voted by other airlines

Account with index 2 (_account[2]_) can be used for testing passengers functionality 

By importing wallet in MetaMask from mnemonic `above sadness level believe palm various soda clutch quiz early conduct connect` and creating
new accounts we can easily use the above accounts while testing Dapp. 


## Libraries used

Language used for development of Truffle tests, dapp and server apps is __Typescript__ 
(to make things more interesting with that and for better developer experience... however not exactly easier as I soon found out).

This project uses the following tools and libraries:
* Contract
  * Solidity - 0.5.16
  * OpenZeppelin - 2.5.0, used to provide the following utilities:
    * Ownable - used for managing the owner of the contract
    * SafeMath - for math operations on uint256 data type
    * Pausable - for providing management of operational status
    * Roles - for providing management of airline roles
  * Truffle - 5.1.14 (tests and deployment)
  * [Typechain](https://github.com/ethereum-ts/TypeChain) - used to generate typings for contracts
  * web3 - 1.2.6, used to interact with ethereum network
* Server - `src/flights-api`
  * express - 4.17.1, used to host Oracles and provide REST API for flights management
* Dapp - `src/dapp`
  * react - 16.12.0, used to create SPA that interacts with FlightSuretyApp contract, generate with `create-react-app` starter 
  * react-router - for managing routing in the application
  * react-redux - for managing applications state (dev tools are enabled so store state can be inspected in any moment)
  * [react-semanti-ui](https://react.semantic-ui.com/) - library with ready components to make application look better
  * [react-toast-notifications](https://github.com/jossmac/react-toast-notifications) - for displaying notifications from the user's actions
  * lodash, moment.js - utility libraries 
