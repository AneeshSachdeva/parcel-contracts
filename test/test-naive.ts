import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber, Contract, ContractFactory } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import keccak256 from "keccak256";

describe("Parcel contract (naive)", function () {
  // Define common variables for tests
  let Token: ContractFactory;
  let NFT: ContractFactory;
  let Parcel: ContractFactory;
  let testToken: Contract;
  let testNFT: Contract;
  let testParcel: Contract;
  let parcelKey: Buffer;
  let owner: SignerWithAddress;  // Creates the parcel and sends assets
  let addr1: SignerWithAddress;  // Sends assets to parcel
  let receiver: SignerWithAddress;  // Receives the parcel

  before(async function () {
    // The key that is used to unlock the parcel
    // TODO: replace 'test_key' with random buffer input
    parcelKey = Buffer.from('test_key');

    // Get the ContractFactory and Signers here.
    Token = await ethers.getContractFactory("TestToken");
    NFT = await ethers.getContractFactory("TestNFT");
    Parcel = await ethers.getContractFactory("Parcel");
    [owner, addr1, receiver] = await ethers.getSigners();

    // Deploy contracts.
    let hashedKey: Buffer = keccak256(parcelKey);
    testToken = await Token.deploy("TestToken", "TKN");
    testNFT = await NFT.deploy("TestNFT", "NFT");
    testParcel = await Parcel.deploy(hashedKey);

    // Load assets into wallets.
    testToken.faucet(owner.address, 100);
    testToken.faucet(addr1.address, 100);
    testNFT.mint(owner.address);
  });

  // Tests for correct deployment of the Parcel contract.
  describe("Deployment", function () {
    it("Sets the right owner", async function () {
      // This test expects the sender variable stored in the contract to be
      // equal to our Signer's owner.
      expect(await testParcel.sender()).to.equals(owner.address);
    });
  })

  describe("Receive assets", function() {
    it("Receives ETH", async function () {
      // Send ETH from owner to parcel
      await owner.sendTransaction({
        to: testParcel.address,
        value: ethers.utils.parseEther("1")
      })
      
      expect(await testParcel.ethBalance())
        .to
        .equals(ethers.utils.parseEther("1"));
    });

    it("Receives ERC-20 tokens", async function () {
      // Send ERC-20 from owner to parcel
      await testToken.approve(testParcel.address, 100);
      await testParcel.addTokens(testToken.address, 100);
      
      expect(await testParcel.tokenBalanceOf(testToken.address)).to.equals(100);
    });

    it("Receives ERC-721", async function () {
      // Send ERC-721 from owner to parcel (tokenId = 1)
      await testNFT["safeTransferFrom(address,address,uint256)"](owner.address, testParcel.address, 1);
      
      expect(await testNFT.ownerOf(1)).to.equals(testParcel.address);
      expect(await testParcel.balanceOfNFTs()).to.equals(1);
    });
  });
        
  describe("Opens", function () {
    it("Receive assets using the correct secret", async function () {
      // By this point, parcel should be loaded with ETH, tokens, and an NFT
      // Owner locks parcel first so it's ready to be sent and received
      let startBalance: BigNumber = await receiver.getBalance();
      await testParcel.lock();
      await testParcel.connect(receiver).open(parcelKey);
      let endBalance: BigNumber = await receiver.getBalance();
      let gasCost: BigNumber = startBalance.sub(ethers.utils.parseEther("1"));
      
      expect(startBalance.sub(gasCost))
        .to
        .equals(ethers.utils.parseEther("1"));
      expect(await testToken.balanceOf(receiver.address)).to.equals(100);
      expect(await testNFT.ownerOf(1)).to.equals(receiver.address);
    });
  });
});
