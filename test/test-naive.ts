import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, ContractFactory } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Parcel } from "../typechain-types/Parcel";
import { TestToken } from "../typechain-types/TestToken";
import { TestNFT } from "../typechain-types/TestNFT";
import keccak256 from "keccak256";

describe("Parcel contract", function () {
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

  beforeEach(async function () {
    // The key that is used to unlock the parcel
    // TODO: replace 'test_key' with random buffer input
    parcelKey = keccak256('test_key');

    // Get the ContractFactory and Signers here.
    Token = await ethers.getContractFactory("TestToken");
    NFT = await ethers.getContractFactory("TestNFT");
    Parcel = await ethers.getContractFactory("Parcel");
    [owner, addr1, receiver] = await ethers.getSigners();

    // Deploy contracts.
    testToken = await Token.deploy("TestToken", "TKN");
    testNFT = await NFT.deploy("TestNFT", "NFT");
    testParcel = await Parcel.deploy(parcelKey);

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
      
    });

    it("Receives ERC-20 tokens", async function () {
      // Send ERC-20 from owner to parcel
      await testToken.approve(testParcel.address, 100);
      await testParcel.addTokens(testToken.address, 100);
      expect(await testParcel.tokenBalanceOf(testToken.address)).to.equals(100);
    });

    it("Receives ERC-721", async function () {
      // Send ERC-721 from owner to parcel (tokenId = 1)
      await testNFT.approve(testParcel.address, 1);
      await testNFT.transferFrom(owner.address, testParcel.address, 1);
    });

    // it("Does not open for signer with the wrong secret", async function () {

    // });
        
    // it("Opens and sends assets to signer with the correct secret", 
    //   async function () {

    // });
  });
});
