// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract PresaleToken is ERC20, Ownable {
    constructor(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        uint256 presaleSupply,
        address presaleContract
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _mint(msg.sender, totalSupply - presaleSupply);
        _mint(presaleContract, presaleSupply);
    }
}
