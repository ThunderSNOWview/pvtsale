// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import { PrivacyPresale } from "./PrivacyPresale.sol";

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ConfidentialTokenWrapper } from "./ConfidentialTokenWrapper.sol";

contract PrivacyPresaleFactory {
    using SafeERC20 for IERC20;

    address[] public presales;
    address public cweth;

    event PrivacyPresaleCreated(
        address indexed creator,
        address presale,
        address token,
        address ctoken,
        address cweth
    );

    constructor(address _cweth) {
        require(_cweth != address(0), "Invalid cweth address");
        cweth = _cweth;
    }

    function createPrivacyPresaleWithExistingToken(
        address _token,
        PrivacyPresale.Options memory _options
    ) external returns (address presale) {
        // create confidential token wrapper
        ConfidentialTokenWrapper ctoken = new ConfidentialTokenWrapper(
            string(abi.encodePacked("Confidential ", IERC20Metadata(_token).name())),
            string(abi.encodePacked("c", IERC20Metadata(_token).symbol())),
            "",
            IERC20(_token)
        );

        // Deploy new PrivacyPresale contract (creator receives unsold / failed-sale tokens)
        PrivacyPresale newPresale = new PrivacyPresale(
            cweth,
            address(ctoken),
            _token,
            _options,
            msg.sender
        );

        newPresale.transferOwnership(msg.sender);

        // transfer token from creator to the presale contract
        IERC20(_token).safeTransferFrom(
            msg.sender,
            address(newPresale),
            _options.tokenAddLiquidity + _options.tokenPresale
        );

        presales.push(address(newPresale));

        emit PrivacyPresaleCreated(
            msg.sender,
            address(newPresale),
            _token,
            address(ctoken),
            cweth
        );

        return address(newPresale);
    }

    function getPresales() external view returns (address[] memory) {
        return presales;
    }
}
