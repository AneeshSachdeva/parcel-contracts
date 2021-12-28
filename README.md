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

```shell
>> npx hardhat test

  Parcel contract (naive)
    Deployment
      ✓ Sets the right owner
    Receive assets
      ✓ Receives ETH
      ✓ Receives ERC-20 tokens
      ✓ Receives ERC-721
    Opens
      ✓ Receive assets using the correct secret

·----------------------------------|----------------------------|-------------|-----------------------------·
|       Solc version: 0.8.4        ·  Optimizer enabled: false  ·  Runs: 200  ·  Block limit: 30000000 gas  │
···································|····························|·············|······························
|  Methods                         ·               95 gwei/gas                ·       4085.82 usd/eth       │
··············|····················|··············|·············|·············|···············|··············
|  Contract   ·  Method            ·  Min         ·  Max        ·  Avg        ·  # calls      ·  usd (avg)  │
··············|····················|··············|·············|·············|···············|··············
|  Parcel     ·  addTokens         ·           -  ·          -  ·     124400  ·            1  ·      48.29  │
··············|····················|··············|·············|·············|···············|··············
|  Parcel     ·  lock              ·           -  ·          -  ·      26603  ·            1  ·      10.33  │
··············|····················|··············|·············|·············|···············|··············
|  Parcel     ·  open              ·           -  ·          -  ·     116350  ·            1  ·      45.16  │
··············|····················|··············|·············|·············|···············|··············
|  TestNFT    ·  mint              ·           -  ·          -  ·      91424  ·            1  ·      35.49  │
··············|····················|··············|·············|·············|···············|··············
|  TestNFT    ·  safeTransferFrom  ·           -  ·          -  ·     133911  ·            1  ·      51.98  │
··············|····················|··············|·············|·············|···············|··············
|  TestToken  ·  approve           ·           -  ·          -  ·      46821  ·            1  ·      18.17  │
··············|····················|··············|·············|·············|···············|··············
|  TestToken  ·  faucet            ·       51963  ·      69063  ·      60513  ·            2  ·      23.49  │
··············|····················|··············|·············|·············|···············|··············
|  Deployments                     ·                                          ·  % of limit   ·             │
···································|··············|·············|·············|···············|··············
|  Parcel                          ·           -  ·          -  ·    1902545  ·        6.3 %  ·     738.48  │
···································|··············|·············|·············|···············|··············
|  TestNFT                         ·           -  ·          -  ·    2251924  ·        7.5 %  ·     874.09  │
···································|··············|·············|·············|···············|··············
|  TestToken                       ·           -  ·          -  ·    1300678  ·        4.3 %  ·     504.86  │
·----------------------------------|--------------|-------------|-------------|---------------|-------------·
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