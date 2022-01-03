import { ethers } from "hardhat";

async function main() {
    // Get deployer account.
    const [admin] = await ethers.getSigners();
    const ethBalance = ethers.utils.formatEther(await admin.getBalance());

    console.log("Deploying contracts with account:", admin.address);
    console.log("Account balance:", ethBalance, "ETH");

    // Deploy test tokens.
    const TestToken = await ethers.getContractFactory("TestToken");
    const TestNFT = await ethers.getContractFactory("TestNFT");
    const testToken = await TestToken.deploy("TestToken", "TKN");
    const testNFT = await TestNFT.deploy("TestNFT", "NFT");

    console.log("TestToken address:", testToken.address);
    console.log("TestNFT address:", testNFT.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });