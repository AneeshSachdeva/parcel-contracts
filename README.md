# Parcel

Parcel makes it possible to send Ethereum-based digital assets to an individual without needing to know their wallet address. Parcel currently supports:
- ERC-20
- ERC-721
- ETH

This is done through the use of an on-chain vault secured by an off-chain secret that is transmitted between the two parties. 

**Table of Contents**
1. [Introduction](#introduction)
2. [Deployed contracts](#deployed-contracts)
3. [How to use](#how-to-use)
    1. [Create a parcel](#create-a-parcel)
    2. [Send assets to parcel](#send-assets-to-parcel)
    3. [Open parcel](#open-parcel)
4. [Warnings and open source bugs](#warnings-and-open-source-bugs)
    1. [Warnings](#warnings)
    2. [Bugs](#bugs)
5. [Testing / development](#testing-and-development)
    1. [Setup](#setup)
    2. [Hardhat](#hardhat)
    3. [Connect to Optimism (L2)](#connect-to-optimism)
    4. [Tests](#tests)
    5. [Deployment](#deployment)
6. [Gas optimization](#gas-optimization)

## Introduction

This was inspired by the lackluster gift-giving experience for digital assets. Many of us who own digital assets want to share the infectious excitment of owning these assets with the people around us. However, >99% of the world has not yet onboarded with a self-custodial wallet. Without parcel, the current digital asset gifting experience is:
1. Ask the recipient to create a wallet (e.g. MetaMask) because you'd like to send them something.
2. Teach them how to take custody of a wallet, or let them figure it out on their own.
3. Send the assets to their wallet and tell them to check it.
4. Tell the recipient to check their wallet.
Each step contains significant flaws. Step 1 ruins the whole element of surprise that makes gift-giving special. Step 2 introduces significant variance into the web3 onboarding experience for the recipient - the experience is largely dependent on the gift giver's time and the recipient's technical proficiency. Step 3 lacks the tangible properties that make gifts feel real and special, and step 4 - like step 1 - ruins the element of surprise.

Parcel solves all of this utilizing an on-chain vault and off-chain secret key to send the gift. This is the parcel experience:
1. Send digital assets to an on-chain "parcel" smart contract and secure it with a key generated off-chain.
2. Share the key via a QR code that can be physically printed. 
3. Recipient scans the QR code to open the gift.
4. The parcel client onboards the user with metamask in a standardized way (if recipient doesn't have a wallet), and as soon as their wallet is connected the assets in the parcel is transferred to the recipient. 
Through parcel, the gift giver is able replicate the classic, dopaminergic experience (tangible and surprising) of receiving a gift, but now for digital assets. 

This repository contains the smart contract implementation of Parcel on the Ethereum and Optimistic networks, and aims to delivery the most secure experience at the cheapeast gas costs. 

## Deployed Contracts

### Optimistic-Kovan (public L2 testnet)

ParcelFactory: `0xEA69E5bDBe332311EF30F545F5f00a68Fcf608dE` ([View on etherscan](https://kovan-optimistic.etherscan.io/address/0xEA69E5bDBe332311EF30F545F5f00a68Fcf608dE))

TestToken (ERC-20): `0x26c2dED1DF1728174d44990798a15A72F8F11871` ([View on etherscan](https://kovan-optimistic.etherscan.io/address/0x26c2dED1DF1728174d44990798a15A72F8F11871))

TestNFT  (ERC-721): `0x45eC1Fa39E1b38e791210803D7063728F57D3722` ([View on etherscan](https://kovan-optimistic.etherscan.io/address/0x45eC1Fa39E1b38e791210803D7063728F57D3722))

## How to use

Frontend client prototype is currently in development. [See repository](https://github.com/AneeshSachdeva/parcel-frontend).

[Refer to the SDK](https://github.com/AneeshSachdeva/parcel-frontend/tree/master/src/contracts) for examples on how the functionality described below can be implemented in a client.

### Create a parcel

Parcel creation is managed by the [ParcelFactory smart contract](https://github.com/AneeshSachdeva/parcel/blob/master/contracts/ParcelFactory.sol). The factory holds a reference to a deployment of the [Parcel smart contract](https://github.com/AneeshSachdeva/parcel/blob/master/contracts/Parcel.sol) and creates parcels by instantiating a lightweight clone that simply delegates all calls to the deployed Parcel contract (i.e. the logic). To create a parcel, do:
1. Generate your secret key (it can be anything).
2. Produce a keccak256 hash of your secret.
3. Call:
```solidity
newParcelAddress = ParcelFactory.createParcel(bytes32 hashedSecret);
```
The secret must be hashed off-chain because all transaction calldata is publically accesible on-chain. Keccack256 is used as the hashing function because it is natively supported in solidity and is therefore the cheapest hash in terms of gas (lower bound = 30 gas). When the recipient opens the parcel, they will send the unhashed key to the contract and the contract will verify if it produces the correct hash. 

### Send assets to parcel

Parcels can hold any amount/number of ETH, ERC-20 tokens, and ERC-721 tokens (a.k.a NFTs).

To add ETH, simply send a transaction with ETH to the parcel address.

To add ERC-20, do the follwing:
1. Call `approve()` on the token contract to approve the parcel to transfer tokens from the gift giver to itself.
2. Call `Parcel.addTokens()` to initiate the transfer.
You can add any number of different ERC-20 tokens to the parcel. 

**DO NOT** circumvent `Parcel.addTokens()` by directly initiating the token transfer from your end. If you do so, the parcel will receive the tokens but not be aware of them, resulting in the tokens being stuck in the parcel. 

To add ERC-721, call `safeTransferFrom` on the token contract to transfer your NFT to the parcel. 

**DO NOT** call the unsafe `transferFrom` because it will not trigger the parcel's `onERC721Received` function and your NFT will be trapped in the parcel.

### Open parcel

Open a parcel by calling:
```solidity
parcel.open(bytes secret)
```
The parcel will compute the keccack256 hash of `secret`, and if that matches the hash stored in the parcel then the assets will be transferred to `msg.sender`.

TODO: document how to listen to the events emitted by this call. 

## Warnings and open source bugs

Parcel is still in development. Here are the bugs and potential vulnerabilities that are known at this time.

### Warnings

**Potentially breaking:** In theory, it might be possible for miner to frontrun `Parcel.open()` and steal the assets. The only time the unhashed secret is exposed on-chain is during the `open()` call, and similar to how miners extract MEV, a malicious miner who's aware of the Parcel protocol could copy any `Parcel.open()` transaction and resubmit it with a higher gas fee. To prevent this, I need to:
- Verify that this attack is technically possible
- If so, is there a way we can use block/mempool data on-chain to make the Parcel contract aware of frontrunning? If the vulnerability is possible then the malicious `open()` call has to be for the same block as the original call. 

To reiterate for your safety:
**DO NOT** circumvent `Parcel.addTokens()` by directly initiating the token transfer from your end. If you do so, the parcel will receive the tokens but not be aware of them, resulting in the tokens being stuck in the parcel. 
**DO NOT** call the unsafe `transferFrom` because it will not trigger the parcel's `onERC721Received` function and your NFT will be trapped in the parcel.

### Bugs

**OpenZeppelin Ownable x Clones zero-address bug**. Parcel utilizes a modifier `onlySender` that requires `msg.sender` to be the parcel owner (i.e gift giver). It would be safer to replace this modifier with OpenZeppelin's `Ownable` abstraction (as used by `ParcelFactory`), however there's a (potentially unintended) interaction effect between the OpenZeppelin [`Clones` abstraction](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/proxy/Clones.sol) and [`Ownable`](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol) where the owner of the clone is set to the zero address. This makes it impossible to transfer ownership of the parcel (e.g. from `address(ParcelFactory)` to `address(parcelSender)`). 

I believe this might be unintended because ownership transfers in `Ownable` require that the new owner cannot be the zero address, but this check is not done in the constructor where the original owner is set. I need to dig deeper into `Clones` to figure out why this is happeneing, replicate the error if I can't find a fix, and submit a gitissue to confirm the error with OpenZeppelin. Could be a fun pull request!

**ERC721 safeTransferFrom doesn't bubble up custom errors:** If you revert a custom error in `onERC721Received` the EVM will fail to bubble up that error to the calling function, `ERC721.safeTransferFrom`. If you need to catch specific errors from `onERC721Received` (e.g. signer doesn't have permission to transfer token to parcel), you need to use `require(condition, string)` which takes up more gas due to string storage.

**Optimism fails to bubble up certain reverts:** Work in progress... `Rejects assets from stranger` and `Rejects new assets from sender` tests fail due to this bug when the network is set to `optimistic`. The native `receive()` function of parcel does not revert when it should be. These reverts happen correctly in the default hardhat environment. I need to replicate this error outside of Parcel and test it on various networks before reporting a gitissue to Optimism. 


## Testing and development

### Setup

Add a `.env` file in the project root with the following optional variables:
```
# Compiler
SOLIDITY_VERION="0.8.4"

# Optimistic Kovan testnet
ALCHEMY_API_KEY="<your api key>"
MNEMONIC="<your secret seed phrase>"

# hardhat-gas-reporter
REPORT_GAS="true"
GAS_PRICE="80"
CURRENCY="USD"
COINMARKETCAP_API_KEY="<your api key>"

# Tests
TRANSFER_ETH_AMT="0.1"
TRANSFER_TKN_AMT="100"

# Staging (public testnet)
STAGE_ACCOUNT_MIN_ETH_BALANCE="0.25"
```
Run `npx mnemonics` to generate your seed phrase for you testnet accounts.

Obtain an alchemy API key [here](https://www.alchemy.com/layer2/optimism).

See [hardhat-gas-reporter documentation](https://www.npmjs.com/package/hardhat-gas-reporter) for more details on environment variables.

Obtain a coinmarketcap API key [here](https://pro.coinmarketcap.com/).

If you're having trouble obtaining ETH on public networks to run tests, lower the `TRANSFER_ETH_AMT`.

### Hardhat

In addition to the built-in hardhat tasks that come out of the box, you can use these following functions to assist in Parcel
development/testing:
```shell
  balance               Prints an account's balance
  stage-setup           Prepare staging environment to run tests
```

Use balance: `npx hardhat balance --account [address]`

Use stage-setup: `npx hardhat stage-setup`
- This task will ensure that all accounts necessary for testing are funded with sufficient ETH (defined by `process.env.STAGE_ACCOUNT_MIN_ETH_BALANCE`). This task will let you know if there's not sufficient ETH to go around. If that's the case, grab some ETH from a faucet and send it to the admin address (first address listed in `npx hardhat accounts`). Then call this task to distribute that ETH accordingly. 

Add `--network [network]` tag to specific specific network for any hardhat command.

### Connect to Optimism

[Optimism](https://www.optimism.io/about) is a L2 solution that utilizes optimistic roll-ups to drastically speed up transactions and reduce gas costs. In a nutshell, optimistic roll-ups execute transactions (the expensive part) off-chain and submit merkle proofs back to Layer 1. Transaction data is stored on-chain but is not executed, resulting in cheaper transactions.
Read more [here](https://research.paradigm.xyz/rollups).

#### Optimism (local)
Follow these instructions to run an [Optimism](https://www.optimism.io/about) dev node locally and connect to it from hardhat:
1. [Run dev node](https://community.optimism.io/docs/developers/l2/dev-node.html)
2. [Connect hardhat to node](https://github.com/ethereum-optimism/optimism-tutorial/tree/main/hardhat)
3. Append `--network optimistic` to any `npx hardhat` command to use the local network.

#### Optimism (Kovan)
Follow these instructions to connect to the Optimism Kovan testnet from hardhat:
1. Create a new project in Alchemy and select Optimistic Kovan as your target network.
2. Set `ALCHEMY_API_KEY` in `.env` using the API key from your alchemy project.
3. Generate a seed phrase using `npx mnemonics`. Keep this safe and do not share!
4. Set `MNEMONIC` in `.env` using your seed phrase. 
5. Append `--network optimistic-kovan` to any `npx hardhat` command to use the public testnet. 

### Tests

```shell
>> npx hardhat test

  Parcel factory
    Deployment
      ✓ Parcel deploys naively and sets correct sender (103ms)
      ✓ Factory deploys and sets admin as owner (106ms)
      ✓ Factory creates parcel clone (105ms)
    Parcel receives assets
      ✓ Receives ETH (484ms)
      ✓ Receives ERC-20 tokens (63ms)
      ✓ Receives ERC-721 token (112ms)
      ✓ Rejects assets from stranger (350ms)
    Parcel opens
      ✓ Rejects transfer to signer with incorrect secret
      ✓ Transfers assets to signer with correct secret (93ms)
      ✓ Rejects new assets from sender (88ms)
    Security
      ✓ Admin can pause factory
      ✓ Paused factory does not produce clones (49ms)
      ✓ Admin can unpause factory (41ms)
      ✓ Non-owner cannot pause factory (127ms)
```

### Deployment

Deploy ParcelFactory:
```shell
npx hardhat run scripts/deploy-factory --network [network]
```

Deploy test tokens:
```shell
npx hardhat run scripts/deploy-tokens --network [network]
```

## Gas Optimization

Use [`hardhat-gas-reporter`](https://www.npmjs.com/package/hardhat-gas-reporter) to approximate L1 gas costs (will not work for L2 networks).
```shell
npm install --save-dev hardhat-gas-reporter
```

Comment out `GAS_PRICE` in `.env` to pull live L1 gas price. 

This will output gas costs for each transaction every time you run `npx hardhat test`.

```shell
·--------------------------------------|----------------------------|-------------|-----------------------------·
|         Solc version: 0.8.4          ·  Optimizer enabled: false  ·  Runs: 200  ·  Block limit: 30000000 gas  │
·······································|····························|·············|······························
|  Methods                             ·               80 gwei/gas                ·       3230.89 usd/eth       │
··················|····················|··············|·············|·············|···············|··············
|  Contract       ·  Method            ·  Min         ·  Max        ·  Avg        ·  # calls      ·  usd (avg)  │
··················|····················|··············|·············|·············|···············|··············
|  Parcel         ·  addTokens         ·           -  ·          -  ·     126885  ·            1  ·      32.80  │
··················|····················|··············|·············|·············|···············|··············
|  Parcel         ·  initialize        ·           -  ·          -  ·      68479  ·            1  ·      17.70  │
··················|····················|··············|·············|·············|···············|··············
|  Parcel         ·  open              ·           -  ·          -  ·     119086  ·            1  ·      30.78  │
··················|····················|··············|·············|·············|···············|··············
|  ParcelFactory  ·  createParcel      ·           -  ·          -  ·     117030  ·            2  ·      30.25  │
··················|····················|··············|·············|·············|···············|··············
|  ParcelFactory  ·  pause             ·           -  ·          -  ·      28104  ·            1  ·       7.26  │
··················|····················|··············|·············|·············|···············|··············
|  ParcelFactory  ·  unpause           ·           -  ·          -  ·      28102  ·            1  ·       7.26  │
··················|····················|··············|·············|·············|···············|··············
|  TestNFT        ·  mint              ·       57224  ·      91424  ·      74320  ·            3  ·      19.21  │
··················|····················|··············|·············|·············|···············|··············
|  TestNFT        ·  safeTransferFrom  ·           -  ·          -  ·     141465  ·            1  ·      36.56  │
··················|····················|··············|·············|·············|···············|··············
|  TestToken      ·  approve           ·           -  ·          -  ·      46821  ·            3  ·      12.10  │
··················|····················|··············|·············|·············|···············|··············
|  TestToken      ·  faucet            ·       51951  ·      69063  ·      60507  ·            2  ·      15.64  │
··················|····················|··············|·············|·············|···············|··············
|  Deployments                         ·                                          ·  % of limit   ·             │
·······································|··············|·············|·············|···············|··············
|  Parcel                              ·           -  ·          -  ·    1718612  ·        5.7 %  ·     444.21  │
·······································|··············|·············|·············|···············|··············
|  ParcelFactory                       ·           -  ·          -  ·    2460222  ·        8.2 %  ·     635.90  │
·······································|··············|·············|·············|···············|··············
|  TestNFT                             ·           -  ·          -  ·    2251924  ·        7.5 %  ·     582.06  │
·······································|··············|·············|·············|···············|··············
|  TestToken                           ·           -  ·          -  ·    1300678  ·        4.3 %  ·     336.19  │
·--------------------------------------|--------------|-------------|-------------|---------------|-------------·
```

**Parcel deployment vs. ParcelFactory.createParcel()**
We can see from this table that naively deploying the Parcel contract would be prohibitively expensive. By implementing the factory model via the OpenZeppeling clones proxy, we're able to reduce parcel deployment cost by over a factor of 10 (compare Parcel deployment cost to ParcelFactory createParcel cost).

Unfortunately as of now there's no convenient way to estimate gas costs on Optimism besides measuring the costs live on their mainnet, but they should provide a 10-100x reduction (savings will increase with greater network adoption).

By using sensible design patterns and L2 rollups we can reduce the cost of Parcel usage by >100x. This means that you can create and open parcels for no more than a few dollars.

Of course, it would be a terrible gifting experience if the receiver had to pay any amount to open their gift! To solve this we can implement **meta transactions** and a **gas relay** to pay for the gas cost of opening the parcel.


## Interesting things learned during this project:

TODO: synthesize learnings

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
