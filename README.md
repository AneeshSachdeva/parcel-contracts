# Basic Sample Hardhat Project

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


Interesting things learned during this project:

- Check-Effects-Interactions pattern
- Send vs. Transfer vs. Call: https://consensys.net/diligence/blog/2019/09/stop-using-soliditys-transfer-now/
- Custom errors vs. require: https://blog.soliditylang.org/2021/04/21/custom-errors/
- Gas costs of hash functions
- Storage vs. memory vs. calldata gas considerations (also view vs. pure, and usage in parameters)
- OpenZeppelin contracts
    - Counters: saves gas by avoiding SafeMath check: https://docs.openzeppelin.com/contracts/3.x/api/utils#Counters
- Gas optimizations