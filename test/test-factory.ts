import * as dotenv from "dotenv";
import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber, Contract, ContractFactory } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import keccak256 from "keccak256";

dotenv.config();  // Load .env into process.env

describe("Parcel factory", function () {
  // Increase timeout from default 2000 to support slow tx speeds on public 
  // testnets.
  this.timeout(60_000);

  // Define common variables used across tests
  let Token: ContractFactory;
  let NFT: ContractFactory;
  let Parcel: ContractFactory;
  let ParcelFactory: ContractFactory;
  let testToken: Contract;
  let testNFT: Contract;
  let testParcel: Contract;
  let parcelFactory: Contract;
  let parcelKey: Buffer;
  let hashedKey: Buffer;

  let admin: SignerWithAddress;     // Owns the factory and manages security
  let sender: SignerWithAddress;    // Creates the parcel and sends assets
  let stranger: SignerWithAddress;  // Sends assets to parcel
  let receiver: SignerWithAddress;  // Receives the parcel

  // Quantities of assets that transfer from sender -> parcel -> receiver
  const TRANSFER_ETH_AMT = process.env.TRANSFER_ETH_AMT ?? 0.1;
  const TRANSFER_TKN_AMT = process.env.TRANSFER_TKN_AMT ?? 100;

  // TODO: Refactor asset transfers into their own functions for easy 
  // reusability.

  before(async function () {
    // The key that is used to unlock the parcel and is communicated privately
    // off-chain between the sender and recipient. 
    // Key must be hashed off-chain so its privacy is preserved on-chain.
    parcelKey = Buffer.from(process.env.TEST_SECRET ?? "test_secret"); 
    hashedKey = keccak256(parcelKey);

    // Get the ContractFactory and Signers here.
    Token = await ethers.getContractFactory("TestToken");
    NFT = await ethers.getContractFactory("TestNFT");
    Parcel = await ethers.getContractFactory("Parcel");
    ParcelFactory = await ethers.getContractFactory("ParcelFactory");
    [admin, sender, stranger, receiver] = await ethers.getSigners();

    // Deploy contracts.
    testToken = await Token.deploy("TestToken", "TKN");
    testNFT = await NFT.deploy("TestNFT", "NFT");

    // Load assets into wallets.
    await testToken.faucet(sender.address, TRANSFER_TKN_AMT);
    await testToken.faucet(stranger.address, TRANSFER_TKN_AMT);
    await testNFT.mint(sender.address);   // tokenId = 1
    await testNFT.mint(sender.address);   // tokenId = 2
    await testNFT.mint(stranger.address); // tokenId = 3
  });

  // Tests for correct deployment of the Parcel contract.
  describe("Deployment", function () {
    it("Parcel deploys naively and sets correct sender", async function () {
      let naiveParcel: Contract = await Parcel.deploy();
      await naiveParcel.connect(sender).initialize(hashedKey, sender.address);
      expect(await naiveParcel.sender()).to.equals(sender.address);
    });

    it("Factory deploys and sets admin as owner", async function () {
      parcelFactory = await ParcelFactory.deploy();
      expect(await parcelFactory.owner()).to.equals(admin.address);
    });

    it("Factory creates parcel clone", async function () {
      // Address of the parcel clone must be obtained from the emitted event
      // since return values of non-view/pure functions cannot be directly 
      // retrieved off-chain.
      const cloneTx = await parcelFactory
        .connect(sender)
        .createParcel(hashedKey);
      const { events } = await cloneTx.wait();
      const createEvent = events.find( (e: any) => e.event == "ParcelCreated");
      const cloneAddr = createEvent.args.parcel;
      testParcel = new ethers.Contract(cloneAddr, Parcel.interface, sender);

      expect(await testParcel.sender()).to.equals(sender.address);
    });
  })

  describe("Parcel receives assets", function() {
    it("Receives ETH", async function () {
      // Send ETH from owner to parcel.
      const amount = ethers.utils.parseEther(`${TRANSFER_ETH_AMT}`);
      await sender.sendTransaction({
        to: testParcel.address,
        value: amount
      });
      
      expect(await testParcel.ethBalance())
        .to
        .equals(amount);
    });

    it("Receives ERC-20 tokens", async function () {
      // Send ERC-20 from owner to parcel.
      await testToken.connect(sender).approve(
        testParcel.address,
        TRANSFER_TKN_AMT
      );
      await testParcel.connect(sender).addTokens(
        testToken.address,
        TRANSFER_TKN_AMT
      );
      
      expect(await testParcel.tokenBalanceOf(testToken.address))
        .to
        .equals(TRANSFER_TKN_AMT);
    });

    it("Receives ERC-721 token", async function () {
      // Send ERC-721 to parcel (tokenId = 1).
      // safeTransferFrom is an overloaded function so we have to use different
      // syntax to call it.
      await testNFT.connect(sender)
      ["safeTransferFrom(address,address,uint256)"](
        sender.address,      // from
        testParcel.address,  // to
        1                    // tokenId
      );
      
      expect(await testNFT.ownerOf(1)).to.equals(testParcel.address);
      expect(await testParcel.balanceOfNFTs()).to.equals(1);
    });

    it("Rejects assets from stranger", async function () {
      // Try sending ETH
      const amount = ethers.utils.parseEther(`${TRANSFER_ETH_AMT}`);
      await expect(stranger.sendTransaction({
        to: testParcel.address,
        value: amount
      })).to.be.revertedWith("AccessDenied()");

      // Try sending ERC-20
      await testToken.connect(stranger).approve(
        testParcel.address,
        TRANSFER_TKN_AMT
      );
      await expect(testParcel.connect(stranger).addTokens(
        testToken.address,
        TRANSFER_TKN_AMT
      )).to.be.revertedWith("AccessDenied()");

      // Try sending ERC-721
      await expect(testNFT.connect(stranger)
      ["safeTransferFrom(address,address,uint256)"](
        stranger.address,    // from
        testParcel.address,  // to
        3                    // tokenId
      )).to.be.revertedWith("AccessDenied()");
    });
  });
        
  describe("Parcel opens", function () {
    it("Rejects transfer to signer with incorrect secret", async function () {
      await expect(testParcel.connect(stranger).open(Buffer.from("wrong key")))
        .to
        .be
        .revertedWith("Incorrect secret.");
    });

    it("Transfers assets to signer with correct secret", async function () {
      // By this point, parcel should be loaded with ETH, tokens, and an NFT.
      // Sender must lock parcel first for it to be opened by receiver.
      const startBalance: BigNumber = await receiver.getBalance();
      //await testParcel.lock();
      await testParcel.connect(receiver).open(parcelKey);
      const endBalance: BigNumber = await receiver.getBalance();

      // TODO: formulate more precise test for ETH transfer
      expect(parseFloat(ethers.utils.formatEther(endBalance)))
        .to
        .greaterThan(parseFloat(ethers.utils.formatEther(startBalance)));
      expect(await testToken.balanceOf(receiver.address))
        .to
        .equals(TRANSFER_TKN_AMT);
      expect(await testNFT.ownerOf(1)).to.equals(receiver.address);
    });

    it("Rejects new assets from sender", async function () {
      // Try sending ETH
      const amount = ethers.utils.parseEther(`${TRANSFER_ETH_AMT}`);
      await expect(sender.sendTransaction({
        to: testParcel.address,
        value: amount
      })).to.be.revertedWith("ParcelIsEmptied()");

      // Try sending ERC-20
      await testToken.connect(sender).approve(
        testParcel.address,
        TRANSFER_TKN_AMT
      );
      await expect(testParcel.connect(sender).addTokens(
        testToken.address,
        TRANSFER_TKN_AMT
      )).to.be.revertedWith("ParcelIsEmptied()");

      // Try sending ERC-721
      await expect(testNFT.connect(sender)
      ["safeTransferFrom(address,address,uint256)"](
        sender.address,      // from
        testParcel.address,  // to
        2                    // tokenId
      )).to.be.revertedWith("ParcelIsEmptied()");
    });
  });

  describe("Security", function () {
    it("Admin can pause factory", async function () {
      await parcelFactory.pause();
      expect(await parcelFactory.paused()).to.equals(true);
    });

    it("Paused factory does not produce clones", async function () {
      await expect(parcelFactory.connect(stranger).createParcel(hashedKey))
        .to
        .be
        .revertedWith("Pausable: paused");
    });

    it("Admin can unpause factory", async function () {
      await parcelFactory.unpause();
      expect(await parcelFactory.paused()).to.equals(false);
    });

    it("Non-owner cannot pause factory", async function () {
      await expect(parcelFactory.connect(stranger).pause())
        .to
        .be
        .revertedWith("Ownable: caller is not the owner");
    });
  });
});
