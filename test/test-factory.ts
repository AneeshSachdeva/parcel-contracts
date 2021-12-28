import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber, Contract, ContractFactory } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import keccak256 from "keccak256";

describe("Parcel factory", function () {
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
  let addr1: SignerWithAddress;     // Sends assets to parcel
  let receiver: SignerWithAddress;  // Receives the parcel

  before(async function () {
    // The key that is used to unlock the parcel and is communicated privately
    // off-chain between the sender and recipient. 
    // Key must be hashed off-chain so its privacy is preserved on-chain.
    parcelKey = Buffer.from('test_key');  // TODO: replace with random buffer
    hashedKey = keccak256(parcelKey);

    // Get the ContractFactory and Signers here.
    Token = await ethers.getContractFactory("TestToken");
    NFT = await ethers.getContractFactory("TestNFT");
    Parcel = await ethers.getContractFactory("Parcel");
    ParcelFactory = await ethers.getContractFactory("ParcelFactory");
    [admin, sender, addr1, receiver] = await ethers.getSigners();

    // Deploy contracts.
    testToken = await Token.deploy("TestToken", "TKN");
    testNFT = await NFT.deploy("TestNFT", "NFT");

    // Load assets into wallets.
    testToken.faucet(sender.address, 100);
    testToken.faucet(addr1.address, 100);
    testNFT.mint(sender.address);
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
      await sender.sendTransaction({
        to: testParcel.address,
        value: ethers.utils.parseEther("1")
      })
      
      expect(await testParcel.ethBalance())
        .to
        .equals(ethers.utils.parseEther("1"));
    });

    it("Receives ERC-20 tokens", async function () {
      // Send ERC-20 from to parcel.
      await testToken.connect(sender).approve(testParcel.address, 100);
      await testParcel.connect(sender).addTokens(testToken.address, 100);
      
      expect(await testParcel.tokenBalanceOf(testToken.address)).to.equals(100);
    });

    it("Receives ERC-721", async function () {
      // Send ERC-721 to parcel (tokenId = 1).
      // safeTransferFrom is an overloaded function so we have to use this
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
  });
        
  describe("Parcel opens", function () {
    it("Receive assets using the correct secret", async function () {
      // By this point, parcel should be loaded with ETH, tokens, and an NFT.
      // Sender must lock parcel first for it to be opened by receiver.
      const startBalance: BigNumber = await receiver.getBalance();
      await testParcel.lock();
      await testParcel.connect(receiver).open(parcelKey);
      const endBalance: BigNumber = await receiver.getBalance();

      expect(parseFloat(ethers.utils.formatEther(endBalance)))
        .to
        .greaterThan(parseFloat(ethers.utils.formatEther(startBalance)));
      expect(await testToken.balanceOf(receiver.address)).to.equals(100);
      expect(await testNFT.ownerOf(1)).to.equals(receiver.address);
    });
  });
});
