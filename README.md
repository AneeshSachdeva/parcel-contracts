# Parcel

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, a sample script that deploys that contract, and an example of a task implementation, which simply lists the available accounts.

Try running some of the following tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
node scripts/sample-script.js
npx hardhat help
```

## Setup

Add a `.env` file in the project root with the following optional variables:
```
# Compiler
SOLIDITY_VERSION=string

# hardhat-gas-reporter
REPORT_GAS=bool
COINMARKETCAP_API_KEY=string
CURRENCY=string
```
See [hardhat-gas-reporter documentation](https://www.npmjs.com/package/hardhat-gas-reporter) for more details on environment variables.

You can obtain a coinmarketcap API key [here](https://pro.coinmarketcap.com/)

## Testing

Follow these instructions to run an [Optimism](https://www.optimism.io/about) dev node locally and connect to it from hardhat:
1. [Run dev node](https://community.optimism.io/docs/developers/l2/dev-node.html)
2. [Connect hardhat to node]

```shell
>> npx hardhat test

  Parcel factory
    Deployment
      ✓ Parcel deploys naively and sets correct sender
      ✓ Factory deploys and sets admin as owner
      ✓ Factory creates parcel clone
    Parcel receives assets
      ✓ Receives ETH
      ✓ Receives ERC-20 tokens
      ✓ Receives ERC-721
    Parcel opens
      ✓ Receive assets using the correct secret
    Security
      ✓ Admin can pause factory
      ✓ Paused factory does not produce clones
      ✓ Admin can unpause factory

·--------------------------------------|----------------------------|-------------|-----------------------------·
|         Solc version: 0.8.4          ·  Optimizer enabled: false  ·  Runs: 200  ·  Block limit: 30000000 gas  │
·······································|····························|·············|······························
|  Methods                             ·               80 gwei/gas                ·       3809.12 usd/eth       │
··················|····················|··············|·············|·············|···············|··············
|  Contract       ·  Method            ·  Min         ·  Max        ·  Avg        ·  # calls      ·  usd (avg)  │
··················|····················|··············|·············|·············|···············|··············
|  Parcel         ·  addTokens         ·           -  ·          -  ·     127106  ·            1  ·      38.73  │
··················|····················|··············|·············|·············|···············|··············
|  Parcel         ·  initialize        ·           -  ·          -  ·      68480  ·            1  ·      20.87  │
··················|····················|··············|·············|·············|···············|··············
|  Parcel         ·  lock              ·           -  ·          -  ·      29316  ·            1  ·       8.93  │
··················|····················|··············|·············|·············|···············|··············
|  Parcel         ·  open              ·           -  ·          -  ·     119090  ·            1  ·      36.29  │
··················|····················|··············|·············|·············|···············|··············
|  ParcelFactory  ·  createParcel      ·           -  ·          -  ·     117270  ·            2  ·      35.74  │
··················|····················|··············|·············|·············|···············|··············
|  ParcelFactory  ·  pause             ·           -  ·          -  ·      28104  ·            1  ·       8.56  │
··················|····················|··············|·············|·············|···············|··············
|  ParcelFactory  ·  unpause           ·           -  ·          -  ·      28102  ·            1  ·       8.56  │
··················|····················|··············|·············|·············|···············|··············
|  TestNFT        ·  mint              ·           -  ·          -  ·      91424  ·            1  ·      27.86  │
··················|····················|··············|·············|·············|···············|··············
|  TestNFT        ·  safeTransferFrom  ·           -  ·          -  ·     136630  ·            1  ·      41.64  │
··················|····················|··············|·············|·············|···············|··············
|  TestToken      ·  approve           ·           -  ·          -  ·      46821  ·            1  ·      14.27  │
··················|····················|··············|·············|·············|···············|··············
|  TestToken      ·  faucet            ·       51951  ·      69063  ·      60507  ·            2  ·      18.44  │
··················|····················|··············|·············|·············|···············|··············
|  Deployments                         ·                                          ·  % of limit   ·             │
·······································|··············|·············|·············|···············|··············
|  Parcel                              ·           -  ·          -  ·    1988293  ·        6.6 %  ·     605.89  │
·······································|··············|·············|·············|···············|··············
|  ParcelFactory                       ·           -  ·          -  ·    2748950  ·        9.2 %  ·     837.69  │
·······································|··············|·············|·············|···············|··············
|  TestNFT                             ·           -  ·          -  ·    2251924  ·        7.5 %  ·     686.23  │
·······································|··············|·············|·············|···············|··············
|  TestToken                           ·           -  ·          -  ·    1300678  ·        4.3 %  ·     396.36  │
·--------------------------------------|--------------|-------------|-------------|---------------|-------------·
```
```shell
>> npx hardhat --network optimistic test

  Parcel factory
    Deployment
      ✓ Parcel deploys naively and sets correct sender (2164197 gas)
      ✓ Factory deploys and sets admin as owner (2834130 gas)
      ✓ Factory creates parcel clone (2887920 gas)
    Parcel receives assets
      ✓ Receives ETH (187003 gas)
      ✓ Receives ERC-20 tokens (216860 gas)
      ✓ Receives ERC-721 (263636 gas)
    Parcel opens
      ✓ Receive assets using the correct secret (291036 gas)
    Security
      ✓ Admin can pause factory (147594 gas)
      ✓ Paused factory does not produce clones (34204 gas)
      ✓ Admin can unpause factory (68406 gas)

·--------------------------------------|----------------------------|-------------|----------------------------·
|         Solc version: 0.8.4          ·  Optimizer enabled: false  ·  Runs: 200  ·  Block limit: 6718946 gas  │
·······································|····························|·············|·····························
|  Methods                             ·               80 gwei/gas                ·      3808.42 usd/eth       │
··················|····················|··············|·············|·············|··············|··············
|  Contract       ·  Method            ·  Min         ·  Max        ·  Avg        ·  # calls     ·  usd (avg)  │
··················|····················|··············|·············|·············|··············|··············
|  Parcel         ·  addTokens         ·           -  ·          -  ·     119406  ·           2  ·      36.38  │
··················|····················|··············|·············|·············|··············|··············
|  Parcel         ·  initialize        ·           -  ·          -  ·      80480  ·           2  ·      24.52  │
··················|····················|··············|·············|·············|··············|··············
|  Parcel         ·  lock              ·           -  ·          -  ·      33416  ·           1  ·      10.18  │
··················|····················|··············|·············|·············|··············|··············
|  Parcel         ·  open              ·           -  ·          -  ·     113390  ·           2  ·      34.55  │
··················|····················|··············|·············|·············|··············|··············
|  ParcelFactory  ·  createParcel      ·           -  ·          -  ·     134270  ·           2  ·      40.91  │
··················|····················|··············|·············|·············|··············|··············
|  ParcelFactory  ·  pause             ·           -  ·          -  ·      34204  ·           3  ·      10.42  │
··················|····················|··············|·············|·············|··············|··············
|  ParcelFactory  ·  unpause           ·           -  ·          -  ·      34202  ·           1  ·      10.42  │
··················|····················|··············|·············|·············|··············|··············
|  TestNFT        ·  mint              ·           -  ·          -  ·      95424  ·           1  ·      29.07  │
··················|····················|··············|·············|·············|··············|··············
|  TestNFT        ·  safeTransferFrom  ·           -  ·          -  ·     144230  ·           2  ·      43.94  │
··················|····················|··············|·············|·············|··············|··············
|  TestToken      ·  approve           ·           -  ·          -  ·      44721  ·           1  ·      13.63  │
··················|····················|··············|·············|·············|··············|··············
|  Deployments                         ·                                          ·  % of limit  ·             │
·······································|··············|·············|·············|··············|··············
|  Parcel                              ·           -  ·          -  ·    1988293  ·      29.6 %  ·     605.78  │
·······································|··············|·············|·············|··············|··············
|  ParcelFactory                       ·           -  ·          -  ·    2753650  ·        41 %  ·     838.96  │
·--------------------------------------|--------------|-------------|-------------|--------------|-------------·
```

## Interesting things learned during this project:

- Check-Effects-Interactions pattern
- Send vs. Transfer vs. Call: https://consensys.net/diligence/blog/2019/09/stop-using-soliditys-transfer-now/
- Custom errors vs. require: https://blog.soliditylang.org/2021/04/21/custom-errors/
- Gas costs of hash functions
- Storage vs. memory vs. calldata gas considerations (also view vs. pure, and usage in parameters)
- OpenZeppelin contracts
    - Counters: saves gas by avoiding SafeMath check: https://docs.openzeppelin.com/contracts/3.x/api/utils#Counters
- Deployment constraints (gas): https://news.ycombinator.com/item?id=28625485
    - https://ethereum.stackexchange.com/questions/35539/what-is-the-real-price-of-deploying-a-contract-on-the-mainnet/37898
    - https://hackernoon.com/costs-of-a-real-world-ethereum-contract-2033511b3214
- Relaying gas through meta transactions: https://eips.ethereum.org/EIPS/eip-2771
- NatSpec is not storred on chain
    - Error message without parameters and documented via NatSpec only needs
    four bytes of data. --> descriptive reverts for less gas
- Hardhad syntax for calling overloaded function: https://forum.openzeppelin.com/t/where-is-safefromtransfer-function-in-contract-instance/12020
- Return value of non-constant funciton (neither `pure` nor `view`) is only visible on-chain
    - https://ethereum.stackexchange.com/questions/88119/i-see-no-way-to-obtain-the-return-value-of-a-non-view-function-ethers-js
    - Must pass return value to event so it can be obtained off-chain
- Affects of rollups on gas fees and their components: https://www.reddit.com/r/ethfinance/comments/r0yy6c/why_calldata_gas_cost_reduction_is_crucial_for/