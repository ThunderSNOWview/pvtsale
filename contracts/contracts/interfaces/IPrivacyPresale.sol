// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

interface IPrivacyPresale {
    error InvalidState(uint8 state);
    error NotInPurchasePeriod();
    error NotRefundable();
    error InvalidCapValue();
    error InvalidTimestampValue();

    event PoolInitialized(
        address indexed owner,
        uint256 totalTokens,
        uint256 addLiquidityTokens,
        uint256 presaleTokens,
        uint256 timestamp
    );
    event TokensPurchased(address indexed beneficiary);
}
