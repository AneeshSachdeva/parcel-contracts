// SPDX-License-Identifier: GPL-3.0
pragma solidity >= 0.7.0 < 0.9.0;

import "hardhat/console.sol";

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

/// @title A vault that's unlocked by an off-chain key
/// @author Aneesh Sachdeva
/// @notice Use parcel to transmit on-chain assets without knowing the 
/// @notice recipient's address. This is accomplished through the use of 
/// @notice an off-chain secret that the sender shares with the recipient. 
///
/// 1. Initialize parcel with a keccak256 hash of your secret.
/// 2. Send any of ETH, ERC-20, or ERC-721 to contract.
/// 3. Share secret with recipient off-chain.
/// 4. Recipient uses secret to receive parcel's assets.
contract Parcel is Initializable, IERC721Receiver {
    // Parcel states
    enum State { Open, Locked, Emptied }
    State public state;

    // Communal parcels can accept assets from any address.
    bool public isCommunal;

    /// @notice Address of the parcel owner/sender.
    address public sender;

    /// @notice ETH in parcel.
    uint256 public ethBalance;

    /// @notice Balances of tokens in parcel. Use array of keys to iterate over the 
    /// mapping.
    mapping (address => uint256) public tokenBalanceOf;
    address[] tokenAddrs;

    // Struct to describe an ERC-721 token.
    struct NFT {
        address tokenAddr;
        uint256 tokenId;
    }

    /// @notice List of NFTs in parcel. 
    NFT[] public nfts;

    /// Hash of the secret that the recipient uses to unlock the parcel. 
    bytes32 private _hashedSecret;

    // Events
    event ParcelEmptied(address recipient);

    // TODO: replace all require strings with custom errors
    // since they are gas efficient and dynamic.

    /// The parcel is locked and cannot accept assets.
    error ParcelIsLocked();
    /// The function cannot be called at the current state.
    error InvalidState();
    /// Only the sender can call this. 
    error PermissionDenied();

    modifier onlySender() {
        require(
            msg.sender == sender,
            "Only the parcel sender can call this."
        );
        _;
    }

    modifier communal() {
        if (!isCommunal && msg.sender != sender) {
            console.log(msg.sender);
            revert(
                "Parcel is not communal and cannot accept your asset."
            );
        }
        _;
    }

    modifier lockable() {
        // Parcel must be Open to receive assets.
        require(state == State.Open, "Parcel can't receive assets.");
        _;
    }

    /// @notice Initialize the parcel by setting the secret and sender. 
    /// @dev This contract should only initialized by calling ParcelFactory.createClone()
    /// @param hashedSecret keccack256 hash of the secret used to unlock the parcel.
    /// @param _sender address that initiates parcel creation and adds assets to it.
    function initialize(bytes32 hashedSecret, address _sender) public initializer {
        sender = _sender;
        _hashedSecret = hashedSecret;
    }

    /// Make the parcel communal so that it can receive assets from any address.
    function makeCommunal() external onlySender {
        isCommunal = true;
    }

    /// @notice Lock the parcel from receiving any more assets.
    function lock() external onlySender {
        state = State.Locked;
    }

    /// @notice Update hashed secret (e.g. for security reasons).
    /// @param newHashedSecret keccak256 hash of the new secret.
    function updateHashedSecret(
        bytes32 newHashedSecret
    ) external onlySender {
        // Keccak hash is computed off chain for security.
        _hashedSecret = newHashedSecret;
    }

    /// @notice Receives ETH from the parcel owner.
    /// @dev Do not call this. Send a tx to the parcel that contains ETH.
    receive() external payable lockable communal { 
        ethBalance += msg.value;
    }

    /// @notice Receives ETH from the parcel owner. 
    /// @dev This function only serves as a fallback for erroneous tx's that
    /// @dev contain ETH. Clients should not intend to call this.
    fallback() external payable lockable communal {
        ethBalance += msg.value;
    }

    /// @notice Add `amount` of an ERC-20 token to the parcel.
    /// @dev Sender must call approve on the token contract prior to this tx. 
    /// @param tokenAddr Contract address of token. Must implement ERC20.
    /// @param amount Amount of tokens to transfer from sender to parcel. 
    function addTokens(
        address tokenAddr,
        uint256 amount
    ) external lockable communal {
        ERC20 token = ERC20(tokenAddr);
        bool success = token.transferFrom(msg.sender, address(this), amount);
        require(success, "Tokens failed to transfer to parcel.");

        // Track balance
        if (tokenBalanceOf[tokenAddr] == 0)
            tokenAddrs.push(tokenAddr);
        tokenBalanceOf[tokenAddr] += amount;
    }

    /// @notice Add NFT to parcel.
    /// @dev Sender must call safeTransferFrom on the ERC721 contract otherwise 
    /// @dev this method will not be called. Do not call unsafe transferFrom.
    /// @param from Current owner of the NFT.
    /// @param tokenId ID of the NFT.
    /// @return Function signature. IERC721Receiver implementation requirement. 
    function onERC721Received(
        address,
        address from,
        uint256 tokenId,
        bytes memory
    ) public virtual override lockable returns (bytes4) {
        // Note: msg.sender is the token contract, operator is the caller
        if (!isCommunal)
            require(from == sender, "Cannot accept NFT from this owner.");
        nfts.push(NFT(msg.sender, tokenId));

        return this.onERC721Received.selector;
    }

    /// @notice Open parcel with the secret and receive parcel's assets.
    /// @dev The events emitted by this function will contain the ERC20 and 
    /// @dev ERC721 contract addresses of the assets being transferred (if any).
    /// @param secret The secret that was used to secure this parcel. 
    function open(bytes calldata secret) external {
        // Check conditions
        require(state == State.Locked, "Invalid state.");
        require( _hashedSecret == keccak256(secret), "Incorrect secret.");
        
        // Update state
        state = State.Emptied;

        // Transfer ETH
        if (ethBalance > 0) {
            uint256 amount = ethBalance;
            ethBalance = 0;
            // This is the safest way to transfer ETH.
            (bool success, ) = msg.sender.call{value: amount}("");
            require(success, "ETH transfer failed.");
        }
        
        // Transfer ERC-20 tokens
        if (tokenAddrs.length > 0) {
            for (uint256 ii=0; ii < tokenAddrs.length; ii++) {
                address tokenAddr = tokenAddrs[ii];
                uint256 amount = tokenBalanceOf[tokenAddr];
                _transferToken(tokenAddr, msg.sender, amount);
            }
        }

        // Transfer NFTs
        for (uint256 ii=0; ii < nfts.length; ii++) {
            // Get NFT
            NFT memory nft = nfts[ii];
            ERC721 token = ERC721(nft.tokenAddr);
            // Update state - delete only sets empty struct and does not shift
            // array elements
            delete nfts[ii];
            // Transfer (can throw since we're using safe transfer)
            token.safeTransferFrom(address(this), msg.sender, nft.tokenId);
        }
    }

    /// @notice Transfer `amount` of ERC20 token from parcel to recipient.
    /// @param tokenAddr Token contract address.
    /// @param amount Amount tokens to transfer.
    function _transferToken(
        address tokenAddr,
        address recipient,
        uint256 amount
    ) internal {
        // Update state
        tokenBalanceOf[tokenAddr] -= amount;
        // Transfer token
        ERC20 token = ERC20(tokenAddr);
        bool success = token.transfer(recipient, amount);
        // Check sucsess
        require(success, "Failed to transfer");
    }

    /// @notice Get count of NFTs held in parcel.
    /// @return Count of NFTs in parcel.
    function balanceOfNFTs() external view returns (uint256) {
        return nfts.length;
    }
}