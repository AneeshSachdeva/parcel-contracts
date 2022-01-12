// SPDX-License-Identifier: GPL-3.0
pragma solidity >= 0.7.0 < 0.9.0;

import "hardhat/console.sol";

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

/**
 * @title A vault that's secured by an off-chain key
 * @author Aneesh Sachdeva
 * @notice Use parcel to transmit on-chain assets without knowing the 
 * recipient's address. This is accomplished through the use of an off-chain 
 * secret that the sender shares with the recipient. 
 *
 * @dev Instructions:
 * 1. Initialize parcel with a keccak256 hash of your secret.
 * 2. Send any of ETH, ERC-20, or ERC-721 to contract.
 * 3. Share secret with recipient off-chain.
 * 4. Recipient uses secret to receive parcel's assets.
 */
contract Parcel is Initializable, IERC721Receiver {
    /// @dev Assets can only be added to parcel when it's in the Open state.
    /// Once a parcel becomes Emptied its state is permanent. 
    enum State { Open, Emptied }
    State public state;

    /// @notice Address of the parcel owner/sender.
    address public sender;

    /// @notice ETH in parcel.
    uint256 public ethBalance;

    /// @notice Balances of tokens in parcel. Use array of keys to iterate over  
    /// the mapping.
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

    /// @notice Only the sender can call this. 
    error AccessDenied();

    /// @notice Parcel has been emptied and can't be used anymore.
    error ParcelIsEmptied();

    modifier onlySender() {
        if (msg.sender != sender) {
            revert AccessDenied();
        }
        _;
    }

    modifier whenOpen() {
        if (state != State.Open)
            revert ParcelIsEmptied();
        _;
    }

    /// @notice Initialize the parcel by setting the secret and sender. 
    /// @dev This contract should only initialized by calling ParcelFactory.createClone()
    /// @param hashedSecret keccack256 hash of the secret used to unlock the parcel.
    /// @param _sender address that initiates parcel creation and adds assets to it.
    function initialize(
        bytes32 hashedSecret,
        address _sender
    ) public initializer {
        sender = _sender;
        _hashedSecret = hashedSecret;
    }

    /// @notice Update hashed secret (e.g. for security reasons).
    /// @param newHashedSecret keccak256 hash of the new secret.
    function updateHashedSecret(bytes32 newHashedSecret) external onlySender {
        // Keccak hash is computed off chain for security.
        _hashedSecret = newHashedSecret;
    }

    /// @notice Receives ETH from the parcel owner.
    /// @dev Do not call this. Send a tx to the parcel that contains ETH.
    receive() external payable onlySender whenOpen {
        ethBalance += msg.value;
    }

    /// @notice Receives ETH from the parcel owner. 
    /// @dev This function only serves as a fallback for erroneous tx's that
    /// @dev contain ETH. Clients should not intend to call this.
    fallback() external payable onlySender whenOpen {
        ethBalance += msg.value;
    }

    /// @notice Add `amount` of an ERC-20 token to the parcel.
    /// @dev Sender must call approve on the token contract prior to this tx. 
    /// @param tokenAddr Contract address of token. Must implement ERC20.
    /// @param amount Amount of tokens to transfer from sender to parcel. 
    function addTokens(
        address tokenAddr,
        uint256 amount
    ) external onlySender whenOpen {
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
    ) public override returns (bytes4) {
        // Note: in this case msg.sender is the token contract, not the current
        // owner of the NFT.
        // TODO: raise Git Issue: ERC721 does not bubble up reverts with custom
        // errors. As a work around we'll use require for now.
        require(from == sender, "AccessDenied()");
        require(state == State.Open, "ParcelIsEmptied()");
            
        nfts.push(NFT(msg.sender, tokenId));

        return this.onERC721Received.selector;
    }

    /// @notice Open parcel with the secret and receive parcel's assets.
    /// @dev The events emitted by this function will contain the ERC20 and 
    /// @dev ERC721 contract addresses of the assets being transferred (if any).
    /// @param secret The secret that was used to secure this parcel. 
    function open(bytes calldata secret) external whenOpen {
        // Check conditions
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