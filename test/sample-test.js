const { expect } = require("chai");
const { ethers } = require("hardhat");
const keccak256 = require("keccak256");

describe("Parcel contract", function () {
  // Define common variables for tests
  let Token;
  let testToken;
  let NFT;
  let testNFT;
  let Parcel;
  let testParcel;
  let parcelKey;
  let owner;  // Creates the parcel and sends assets
  let addr1;  // Sends assets to parcel
  let receiver;  // Receives the parcel

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
  });

  // Tests for correct deployment of the Parcel contract.
  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      // This test expects the sender variable stored in the contract to be
      // equal to our Signer's owner.
      expect(await testParcel.sender()).to.equals(owner.address);
    });
  })
});
