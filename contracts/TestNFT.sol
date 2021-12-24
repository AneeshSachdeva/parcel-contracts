// SPDX-License-Identifier: GPL-3.0
pragma solidity >= 0.7.0 <= 0.90;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract TestNFT is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    /**
     * @dev Initializes the contract by setting a `name` and a `symbol` to the token collection.
     */
    constructor(string memory name, string memory symbol) ERC721(name, symbol) { }

    /// Mint a token for sender.
    function mint() external returns (uint256) {
        _tokenIds.increment();

        uint256 newTokenId = _tokenIds.current();
        _mint(msg.sender, newTokenId);
        
        return newTokenId;
    }
}