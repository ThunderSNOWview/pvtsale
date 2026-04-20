// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@fhenixprotocol/cofhe-contracts/FHE.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IFHERC20.sol";

contract ConfidentialTokenWrapper is IFHERC20, ERC20 {
    using SafeERC20 for IERC20;

    uint8 private immutable _decimals;
    IERC20 public immutable underlyingToken;

    mapping(address => euint128) internal _encBalances;
    mapping(address => mapping(address => euint128)) internal _allowed;
    euint128 internal totalEncryptedSupply;

    event Deposit(address indexed to, uint128 amount);
    event Withdraw(address indexed from, address indexed to, uint128 amount);

    constructor(
        string memory name_,
        string memory symbol_,
        string memory,
        IERC20 _underlyingToken
    ) ERC20(name_, symbol_) {
        underlyingToken = _underlyingToken;
        try ERC20(address(_underlyingToken)).decimals() returns (uint8 d) {
            _decimals = d;
        } catch {
            _decimals = 18;
        }

        totalEncryptedSupply = FHE.asEuint128(0);
        FHE.allowThis(totalEncryptedSupply);
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    function deposit(uint256 amount, address to) public {
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= type(uint128).max, "Amount exceeds uint128");

        underlyingToken.safeTransferFrom(msg.sender, address(this), amount);

        uint128 mintAmount = uint128(amount);
        euint128 ecAmount = FHE.asEuint128(mintAmount);

        euint128 newBalance = FHE.add(_encBalances[to], ecAmount);
        FHE.allowThis(newBalance);
        FHE.allow(newBalance, to);
        _encBalances[to] = newBalance;

        euint128 newSupply = FHE.add(totalEncryptedSupply, ecAmount);
        FHE.allowThis(newSupply);
        totalEncryptedSupply = newSupply;

        emit Deposit(to, mintAmount);
    }

    function withdraw(uint128 amount) public {
        euint128 ecAmount = FHE.asEuint128(amount);
        euint128 balance = _encBalances[msg.sender];

        ebool hasEnough = FHE.gte(balance, ecAmount);
        euint128 withdrawAmount = FHE.select(hasEnough, ecAmount, FHE.asEuint128(0));

        euint128 newBalance = FHE.sub(balance, withdrawAmount);
        FHE.allowThis(newBalance);
        FHE.allow(newBalance, msg.sender);
        _encBalances[msg.sender] = newBalance;

        euint128 newSupply = FHE.sub(totalEncryptedSupply, withdrawAmount);
        FHE.allowThis(newSupply);
        totalEncryptedSupply = newSupply;

        underlyingToken.safeTransfer(msg.sender, amount);
        emit Withdraw(msg.sender, msg.sender, amount);
    }

    /**
     * FHERC20 Standard Methods
     */

    function allowanceEncrypted(address owner, address spender) public view virtual override returns (euint128) {
        return _allowed[owner][spender];
    }

    function approveEncrypted(address spender, InEuint128 calldata value) public virtual override returns (bool) {
        _approveEncrypted(msg.sender, spender, FHE.asEuint128(value));
        return true;
    }

    function _approveEncrypted(address owner, address spender, euint128 value) internal {
        require(owner != address(0), "ERC20InvalidApprover");
        require(spender != address(0), "ERC20InvalidSpender");
        FHE.allowThis(value);
        FHE.allow(value, spender);
        _allowed[owner][spender] = value;
        emit ApprovalEncrypted(owner, spender);
    }

    function _spendAllowance(address owner, address spender, euint128 value) internal virtual returns (euint128) {
        euint128 currentAllowance = _allowed[owner][spender];
        euint128 spent = FHE.min(currentAllowance, value);
        euint128 newAllowance = FHE.sub(currentAllowance, spent);
        FHE.allowThis(newAllowance);
        FHE.allow(newAllowance, spender);
        _allowed[owner][spender] = newAllowance;
        return spent;
    }

    function transferFromEncrypted(address from, address to, InEuint128 calldata value) public virtual override returns (euint128) {
        return _transferFromEncrypted(from, to, FHE.asEuint128(value));
    }

    function _transferFromEncrypted(address from, address to, euint128 value) public virtual override returns (euint128) {
        euint128 spent = _spendAllowance(from, msg.sender, value);
        return _transferImpl(from, to, spent);
    }

    function transferEncrypted(address to, InEuint128 calldata encryptedAmount) public override returns (euint128) {
        return _transferEncrypted(to, FHE.asEuint128(encryptedAmount));
    }

    function _transferEncrypted(address to, euint128 amount) public override returns (euint128) {
        return _transferImpl(msg.sender, to, amount);
    }

    function _transferImpl(address from, address to, euint128 amount) internal returns (euint128) {
        euint128 amountToSend = FHE.select(FHE.lte(amount, _encBalances[from]), amount, FHE.asEuint128(0));

        euint128 newFromBalance = FHE.sub(_encBalances[from], amountToSend);
        euint128 newToBalance = FHE.add(_encBalances[to], amountToSend);

        FHE.allowThis(newFromBalance);
        FHE.allowThis(newToBalance);
        FHE.allow(newFromBalance, from);
        FHE.allow(newToBalance, to);

        _encBalances[from] = newFromBalance;
        _encBalances[to] = newToBalance;

        emit TransferEncrypted(from, to);
        return amountToSend;
    }

    /// @notice Returns the encrypted balance handle (ctHash).
    /// Client calls decryptForView(ctHash, FheTypes.Uint128) to see the plaintext.
    function balanceOfEncrypted(address account) public view override returns (euint128) {
        return _encBalances[account];
    }

    function balanceOf(address account) public view override returns (uint256) {
        return super.balanceOf(account);
    }
}
