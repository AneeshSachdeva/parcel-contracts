import { ethers } from "hardhat";

async function main() {
    // Get deployer account.
    const [admin] = await ethers.getSigners();
    const ethBalance = ethers.utils.formatEther(await admin.getBalance());

    console.log("Deploying contracts with account:", admin.address);
    console.log("Account balance:", ethBalance, "ETH");

    // Deploy factory.
    const Factory = await ethers.getContractFactory("ParcelFactory");
    const factory = await Factory.deploy();

    console.log("ParcelFactory address:", factory.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });