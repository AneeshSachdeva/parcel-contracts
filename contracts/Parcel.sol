// SPDX-License-Identifier: GPL-3.0
pragma solidity >= 0.7.0 < 0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

/// Use parcels to transmit on-chain assets without knowing the 
/// recipient's address this is accomplished through the use of 
/// an off-chain secret. 
///
/// 1. Instantiate parcel.
/// 2. Send any of ETH, ERC-20, or ERC-721 to contract.
/// 3. Lock the contract with a secret.
/// 4. Use secret to trasnfer assets out of the contract.
contract Parcel is IERC721Receiver {

    // Parcel states
    enum State { Open, Locked, Emptied }
    State public state;

    // Communal parcels can accept assets from any address.
    bool public isCommunal;

    // Address of the parcel sender.
    address public sender;

    // ETH received
    uint256 public ethBalance;

    // Balances of tokens in parcel. Array of addresses and
    // token count are used to iterate over the mapping.
    mapping (address => uint256) public tokenBalanceOf;
    address[] tokenAddrs;
    uint256 tokenCount;

    // Hash of the secret that the recipient uses to
    // unlock the parcel. 
    bytes32 private hashedSecret;

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
        if (!isCommunal && msg.sender != sender)
            revert(
                "Parcel is not communal and cannot accept your asset."
            );
        _;
    }

    modifier lockable() {
        // Parcel must be Open to receive assets.
        require(state == State.Open, "Parcel can't receive assets.");
        _;
    }

    constructor(bytes32 hashedSecret_) {
        // The instantiator is responsible for securing
        // and sending the parcel.
        sender = msg.sender;
        hashedSecret = hashedSecret_;
    }

    /// Make the parcel communal so that it can receive assets from any address.
    function makeCommunal() external onlySender {
        isCommunal = true;
    }

    /// Lock the parcel from receiving any more assets.
    function lock() external onlySender {
        state = State.Locked;
    }

    /// Update hashed secret (e.g. for security reasons).
    function updateHashedSecret(
        bytes32 newHashedSecret
    ) external onlySender {
        // keccak256 consumes >= 30 gas so compute this off chain.
        hashedSecret = newHashedSecret;
    }

    /// Send ETH to parcel if the parcel is open and the message
    /// sender has permissions.
    receive() external payable lockable communal { 
        ethBalance += msg.value;
    }

    fallback() external payable lockable communal {
        ethBalance += msg.value;
    }

    /// Send ERC-20 token to parcel if the parcel is open and the 
    /// message sender has permissions.
    function addTokens(
        address tokenAddr,
        uint256 amount
    ) external lockable communal {
        ERC20 token = ERC20(tokenAddr);
        // Note: msg.sender must call token.approve for this transfer
        // to succeed.
        bool success = token.transferFrom(msg.sender, address(this), amount);
        require(success, "Tokens failed to transfer to parcel.");

        // Track balance
        tokenBalanceOf[tokenAddr] += amount;
        tokenAddrs.push(tokenAddr);
        tokenCount++;
    }

    /// Add NFT to parcel.
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    /// Open parcel with the secret and transfer contents.
    function open(bytes32 secret) external {
        // Check conditions
        require(state == State.Locked, "Invalid state.");
        require(
            //hashedSecret == keccak256(secret),
            hashedSecret == secret,
            "Incorrect secret."
        );
        // Emit event
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
        if (tokenCount > 0) {
            for (uint256 ii=0; ii < tokenCount; ii++) {
                address tokenAddr = tokenAddrs[ii];
                uint256 amount = tokenBalanceOf[tokenAddr];
                _transferToken(
                    tokenAddr,
                    msg.sender,
                    amount
                );
            }
        }

        // Transfer NFTs

        // Self destruct parcel
    }

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
}