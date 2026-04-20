// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@fhenixprotocol/cofhe-contracts/FHE.sol";
import { ConfidentialTokenWrapper } from "./ConfidentialTokenWrapper.sol";
import { ConfidentialWETH } from "./ConfidentialWETH.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IPrivacyPresale } from "./interfaces/IPrivacyPresale.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IFHERC20.sol";

contract PrivacyPresale is IPrivacyPresale, Ownable {
    struct Options {
        uint256 tokenPresale;
        uint256 tokenAddLiquidity;
        uint128 softCap;
        uint128 hardCap;
        uint128 minContribution;
        uint128 maxContribution;
        uint128 start;
        uint128 end;
        uint16 liquidityPercentage;
        uint256 listingRate;
    }

    struct Pool {
        address presaleOwner;
        address cweth;
        address ctoken;
        address token;
        Options options;
        euint128 ethRaisedEncrypted;
        euint128 tokensSoldEncrypted;
        uint256 weiRaised;
        uint256 tokensSold;
        uint256 tokenPerEthWithDecimals;
        uint8 state; // 0: Pending, 1: Active, 2: Finalizing, 3: Failed, 4: Success
    }

    Pool public pool;
    mapping(address => euint128) public contributions;
    mapping(address => euint128) public claimableTokens;

    constructor(
        address cweth,
        address ctoken,
        address token,
        Options memory options,
        address presaleOwner_
    ) Ownable(msg.sender) {
        require(presaleOwner_ != address(0), "Invalid presale owner");
        pool.cweth = cweth;
        pool.ctoken = ctoken;
        pool.token = token;
        pool.options = options;
        pool.presaleOwner = presaleOwner_;

        pool.tokenPerEthWithDecimals = options.tokenPresale / options.hardCap;

        pool.state = 1;
        pool.ethRaisedEncrypted = FHE.asEuint128(0);
        FHE.allowThis(pool.ethRaisedEncrypted);

        pool.tokensSoldEncrypted = FHE.asEuint128(0);
        FHE.allowThis(pool.tokensSoldEncrypted);
    }

    function purchase(InEuint128 memory encryptedAmount) external {
        require(pool.state == 1, "Not active");
        require(block.timestamp >= pool.options.start && block.timestamp <= pool.options.end, "Not in purchase period");

        euint128 amount = FHE.asEuint128(encryptedAmount);

        // Calculate max allowed
        euint128 currentContrib = contributions[msg.sender];
        euint128 maxAllowed = FHE.sub(FHE.asEuint128(pool.options.maxContribution), currentContrib);

        ebool isOverMax = FHE.gte(amount, maxAllowed);
        euint128 finalPurchase = FHE.select(isOverMax, maxAllowed, amount);

        // Calculate min allowed
        ebool isUnderMin = FHE.lt(FHE.add(currentContrib, finalPurchase), FHE.asEuint128(pool.options.minContribution));
        finalPurchase = FHE.select(isUnderMin, FHE.asEuint128(0), finalPurchase);

        // cWETH must be able to run FHE ops on this amount inside _transferFromEncrypted (different contract).
        FHE.allowTransient(finalPurchase, pool.cweth);

        // Perform confidential transfer from user to this contract
        IFHERC20(pool.cweth)._transferFromEncrypted(msg.sender, address(this), finalPurchase);

        // Update local state
        euint128 newEthRaised = FHE.add(pool.ethRaisedEncrypted, finalPurchase);

        // Handle hard cap refund
        ebool isOverHardCap = FHE.gte(newEthRaised, FHE.asEuint128(pool.options.hardCap));
        euint128 refundAmount = FHE.select(isOverHardCap, FHE.sub(newEthRaised, FHE.asEuint128(pool.options.hardCap)), FHE.asEuint128(0));

        euint128 activeContribution = FHE.sub(finalPurchase, refundAmount);

        euint128 updatedEthRaised = FHE.sub(newEthRaised, refundAmount);
        FHE.allowThis(updatedEthRaised);
        pool.ethRaisedEncrypted = updatedEthRaised;

        // Process refund
        FHE.allowTransient(refundAmount, pool.cweth);
        IFHERC20(pool.cweth)._transferEncrypted(msg.sender, refundAmount);

        // Update tokens sold and contributions
        euint128 newTokens = FHE.mul(activeContribution, FHE.asEuint128(uint128(pool.tokenPerEthWithDecimals)));

        euint128 newContrib = FHE.add(currentContrib, activeContribution);
        FHE.allowThis(newContrib);
        FHE.allow(newContrib, msg.sender);
        contributions[msg.sender] = newContrib;

        euint128 newClaimable = FHE.add(claimableTokens[msg.sender], newTokens);
        FHE.allowThis(newClaimable);
        FHE.allow(newClaimable, msg.sender);
        claimableTokens[msg.sender] = newClaimable;

        euint128 updatedTokensSold = FHE.add(pool.tokensSoldEncrypted, newTokens);
        FHE.allowThis(updatedTokensSold);
        pool.tokensSoldEncrypted = updatedTokensSold;

        emit TokensPurchased(msg.sender);
    }

    function finalizePreSale(
        uint128 cwethRaised,
        bytes calldata ethRaisedSignature,
        uint128 tokensSold,
        bytes calldata tokensSoldSignature
    ) external onlyOwner {
        require(pool.state == 1, "Not active");
        require(block.timestamp > pool.options.end, "Presale not ended");

        pool.state = 2; // Finalizing

        // Verify and publish the decrypted results on-chain
        FHE.publishDecryptResult(pool.ethRaisedEncrypted, cwethRaised, ethRaisedSignature);
        FHE.publishDecryptResult(pool.tokensSoldEncrypted, tokensSold, tokensSoldSignature);

        pool.weiRaised = uint256(cwethRaised) * 1e9;
        pool.tokensSold = uint256(tokensSold);

        if (cwethRaised < pool.options.softCap) {
            pool.state = 3; // Failed
            IERC20(pool.token).transfer(pool.presaleOwner, pool.options.tokenPresale);
        } else {
            pool.state = 4; // Success
            uint256 unsold = pool.options.tokenPresale - tokensSold;
            if (unsold > 0) {
                IERC20(pool.token).transfer(pool.presaleOwner, unsold);
            }

            // Wrap the sold tokens
            IERC20(pool.token).approve(pool.ctoken, tokensSold);
            ConfidentialTokenWrapper(pool.ctoken).deposit(tokensSold, address(this));

            // Withdraw WETH out of CP WETH
            ConfidentialWETH(pool.cweth).withdraw(cwethRaised);
        }
    }

    function allowFinalizationDecrypt() external onlyOwner {
        require(pool.state == 1, "Not active");
        require(block.timestamp > pool.options.end, "Presale not ended");

        FHE.allowPublic(pool.ethRaisedEncrypted);
        FHE.allowPublic(pool.tokensSoldEncrypted);
    }

    function claim() external {
        require(pool.state == 4, "Not successful");
        euint128 claimable = claimableTokens[msg.sender];

        euint128 zero = FHE.asEuint128(0);
        FHE.allowThis(zero);
        FHE.allow(zero, msg.sender);
        claimableTokens[msg.sender] = zero;

        FHE.allowTransient(claimable, pool.ctoken);
        IFHERC20(pool.ctoken)._transferEncrypted(msg.sender, claimable);
    }

    function refund() external {
        require(pool.state == 3, "Not failed");
        euint128 contrib = contributions[msg.sender];

        euint128 zero = FHE.asEuint128(0);
        FHE.allowThis(zero);
        FHE.allow(zero, msg.sender);
        contributions[msg.sender] = zero;

        FHE.allowTransient(contrib, pool.cweth);
        IFHERC20(pool.cweth)._transferEncrypted(msg.sender, contrib);
    }

    function viewContribution(address account) public view returns (euint128) {
        return contributions[account];
    }

    function viewClaimableTokens(address account) public view returns (euint128) {
        return claimableTokens[account];
    }

    function getEthRaisedEncrypted() public view returns (euint128) {
        return pool.ethRaisedEncrypted;
    }

    function getTokensSoldEncrypted() public view returns (euint128) {
        return pool.tokensSoldEncrypted;
    }
}
