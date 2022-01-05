import * as dotenv from "dotenv";
import { task } from "hardhat/config";
import '@typechain/hardhat'
import "@nomiclabs/hardhat-waffle";
import "hardhat-gas-reporter";

dotenv.config();  // Load .env into process.env

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("balance", "Prints an account's balance")
  .addParam("account", "The account's address")
  .setAction(async (args, hre) => {
    const account = hre.ethers.provider.getSigner(args.account);
    const balance = await account.getBalance();

    console.log(hre.ethers.utils.formatEther(balance), "ETH");
});

task(
  "stage-setup",
  "Prepare staging environment to run tests",
  async (args, hre) => {
    // Get accounts.
    const [admin, sender, stranger, receiver] = await hre.ethers.getSigners();
    console.log(`Admin address is ${admin.address}`);
    
    // Get the min balance required for each test account.
    let minBalance: number;
    if (process.env.STAGE_ACCOUNT_MIN_ETH_BALANCE) {
      minBalance = parseFloat(process.env.STAGE_ACCOUNT_MIN_ETH_BALANCE);
    } else {
      minBalance = 0.1;
    }

    // Ensure the admin has sufficient funds.
    let adminBalance = parseFloat(
      hre.ethers.utils.formatEther(await admin.getBalance())
    );
    if (adminBalance < minBalance) {
      throw `Admin account has insufficient funds (${adminBalance} ETH).\n`
        + `${minBalance} ETH is required`;
    }

    // Ensure each wallet has sufficient ETH. If not, send ETH from admin.
    for (let wallet of [sender, stranger, receiver]) {
      let balance = parseFloat(
        hre.ethers.utils.formatEther(await wallet.getBalance())
      );

      if (balance < minBalance) {
        try {
          // Send ETH from admin to wallet so that it has sufficient funds.
          const ethValue = minBalance - balance;
          await admin.sendTransaction({
            to: wallet.address,
            value: hre.ethers.utils.parseEther(`${ethValue}`)
          })
          console.log(`Sent ${ethValue} ETH from admin to ${wallet.address}`);
        } catch (e) {
          // Error sending ETH from admin to wallet.
          console.error(e);
          const adminBalance = hre.ethers.utils.formatEther(
            await admin.getBalance()
          );
          console.log(
            `Ensure that there are sufficient funds at address ${admin.address}`
          );
          console.log(`Balance: ${adminBalance} ETH`);
          break;
        }
      } else {
        console.log(`${wallet.address} has sufficient funds.`);
      }
    }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: process.env.SOLIDITY_VERSION ?? "0.8.4",
  networks: {
    "optimistic": {
      url: 'http://127.0.0.1:8545',
      accounts: { 
        mnemonic: 'test test test test test test test test test test test junk' 
      }
    },
    "optimistic-kovan": {
      url: `https://opt-kovan.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: {
        mnemonic: process.env.MNEMONIC
      }
    }
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS == "true",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    currency: process.env.CURRENCY ?? "USD",
    gasPrice: 80
  }
};
