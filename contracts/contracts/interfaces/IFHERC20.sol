// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

// Local IFHERC20 interface adapted for cofhe-contracts.
// In cofhe, there is no sealoutput — clients use decryptForView on the returned handle.
import "@fhenixprotocol/cofhe-contracts/FHE.sol";

interface IFHERC20 {
    event TransferEncrypted(address indexed from, address indexed to);
    event ApprovalEncrypted(address indexed owner, address indexed spender);

    /// @notice Returns the encrypted balance handle. Client calls decryptForView to see plaintext.
    function balanceOfEncrypted(address account) external view returns (euint128);

    function transferEncrypted(address to, InEuint128 calldata value) external returns (euint128);

    function _transferEncrypted(address to, euint128 value) external returns (euint128);

    /// @notice Returns the encrypted allowance handle. Client calls decryptForView to see plaintext.
    function allowanceEncrypted(address owner, address spender) external view returns (euint128);

    function approveEncrypted(address spender, InEuint128 calldata value) external returns (bool);

    function transferFromEncrypted(address from, address to, InEuint128 calldata value) external returns (euint128);

    function _transferFromEncrypted(address from, address to, euint128 value) external returns (euint128);
}
