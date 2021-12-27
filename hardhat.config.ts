import * as dotenv from "dotenv";
import { task } from "hardhat/config";
import '@typechain/hardhat'
import "@nomiclabs/hardhat-waffle";
import "hardhat-gas-reporter"

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

dotenv.config();  // Load .env into process.env

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: process.env.SOLIDITY_VERSION ?? "0.8.4",
  gasReporter: {
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    currency: process.env.CURRENCY ?? 'USD'
  }
};
