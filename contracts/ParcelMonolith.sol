// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <=0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

enum ParcelState { Open, Locked, Emptied }

struct Parcel {
    bool exists;
    bytes32 key;
    address from;
    address to;
    ParcelState state;
    uint256 ethBalance;
    mapping (address => uint256) tokenBalanceOf;
    address[] tokenAddrs;  // Addresses of ERC-20 contracts for tokens in parcel
    Counters.Counter tokenAddrCount;  // Number of types of ERC-20 tokens the parcel holds
    mapping (address => uint256[]) nftBalanceOf;
    address[] nftAddrs;
    Counters.Counter nftAddrCount;
}

contract ParcelV2 is IERC721Receiver {
    using Counters for Counters.Counter;

    mapping (address => uint256[]) public parcelsFromAddr;
    mapping (bytes32 => uint256) parcelForKey;
    mapping (uint256 => Parcel) private _parcels;
    Counters.Counter private _parcelCount;

    /// New parcel created.
    event ParcelCreated();

    /// Cannot reuse secrets for parcels.
    error SecretIsNotUnique();

    /// Parcel does not exist.
    error ParcelNotFound();

    /// Does not have permission to access parcel.
    error AccessDenied();

    /// ERC-20 token failed to transfer.
    error TokenTransferFailed();

    modifier isParcel(uint256 parcelId) {
        if (!_parcels[parcelId].exists) {
            revert ParcelNotFound();
        }
        _;
    }
    
    modifier ownsParcel(uint256 parcelId) {
        if (_parcels[parcelId].from != msg.sender) {
            revert AccessDenied();
        }
        _;
    }

    function newParcel(
        bytes32 hashedSecret
    ) external returns (uint256 parcelId) {
        bytes32 key = keccak256(abi.encodePacked(msg.sender, hashedSecret));
        if (parcelForKey[key] != 0)
            revert SecretIsNotUnique();

        _parcelCount.increment();
        parcelId = _parcelCount.current();
        Parcel storage p = _parcels[parcelId];
        p.exists = true;
        p.key = key;

        parcelsFromAddr[msg.sender].push(parcelId);
        parcelForKey[key] = parcelId;

        emit ParcelCreated();
    }

    /// Add ETH to parcel.
    function addEth(
        uint256 parcelId
    ) external payable isParcel(parcelId) ownsParcel(parcelId) {
        _parcels[parcelId].ethBalance += msg.value;
    }

    /// Add ERC-20 token to parcel.
    function addToken(
        uint256 parcelId,
        address tokenAddr,
        uint256 amount
    ) external isParcel(parcelId) ownsParcel(parcelId) {
        // Note: msg.sender must call token.approve for this transfer 
        // to succeed.
        ERC20 token = ERC20(tokenAddr);
        if (!token.transferFrom(msg.sender, address(this), amount)) {
            revert TokenTransferFailed();
        }

        // Track balance
        _parcels[parcelId].tokenBalanceOf[tokenAddr] += amount;
        _parcels[parcelId].tokenAddrs.push(tokenAddr);
        _parcels[parcelId].tokenAddrCount.increment();
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

    /// Check if parcel exists
    function parcelExists(uint256 parcelId) external view returns (bool) {
        if (_parcels[parcelId].exists)
            return true;
        else
            return false;
    }
}