// SPDX-License-Identifier: GPL-3.0
pragma solidity >= 0.7.0 < 0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title ERC-20 implementation that mints tokens for testing.
/// @author Aneesh Sachdeva
contract TestToken is ERC20 {

    /// @dev Initializes the contract by setting `name` and `symbol` for the
    /// @dev token.
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
    }

    /// @notice Mint `amount` tokens for `recipient`.
    /// @param recipient Address tokens are minted to.
    /// @param amount Amount of tokens to mint.
    function faucet (address recipient , uint amount) external {
      _mint(recipient, amount);
    }
}