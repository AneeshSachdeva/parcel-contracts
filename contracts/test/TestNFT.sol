// SPDX-License-Identifier: GPL-3.0
pragma solidity >= 0.7.0 < 0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/// @title ERC-721 implementation that mints tokens for testing.
/// @author Aneesh Sachdeva
contract TestNFT is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    /// @dev Initializes the contract by setting a `name` and a `symbol` to the 
    /// @dev token collection.
    constructor(string memory name, string memory symbol) ERC721(name, symbol) { }

    /// @notice Mint a token for sender.
    function mint(address recipient) external returns (uint256) {
        _tokenIds.increment();

        uint256 newTokenId = _tokenIds.current();
        _mint(recipient, newTokenId);
        
        return newTokenId;
    }
}