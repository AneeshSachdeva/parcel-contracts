// SPDX-License-Identifier: GPL-3.0
pragma solidity >= 0.7.0 < 0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestToken is ERC20 {

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
    }

    function faucet (address recipient , uint amount) external {
      _mint(recipient, amount);
    }
}