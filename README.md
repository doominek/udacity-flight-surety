# Flight Surety

## Running the project

The easiest way to run the project is to use the scripts provided in [package.json](package.json) file
in the following order:
```bash
npm run ganache
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
* __redeploy__ - responsible for preparing dev environment for work:
  * deploys contract to ganache
  * generates Typescript's typings for contracts
  * copies contract's deployment metadata to be available by dapp web app
  * prepopulates environment with some data, details [here](#test-data-setup) 
* __server__ - starts a NodeJS express app that runs Oracles and servers simple, REST-based API for flights management
* __dapp__ - starts React web app that uses FlightSuretyApp contract

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
