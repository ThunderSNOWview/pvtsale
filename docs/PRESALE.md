# pvtsale — privacy presale (how it works)

This document explains the **on-chain architecture**, **Fhenix / CoFHE (FHE) behavior**, and **how the UI fits in**. It reflects the contracts in `contracts/contracts/` (notably `PrivacyPresaleFactory.sol`, `PrivacyPresale.sol`, `ConfidentialWETH.sol`, and `ConfidentialTokenWrapper.sol`).

---

## 1. Big picture

**pvtsale** is a **confidential launchpad** on an **EVM host chain with CoFHE** (e.g. Ethereum Sepolia):

- **Raise**: buyers pay in **confidential WETH (`cWETH`)** — balances and transfer amounts are **encrypted** on-chain (`euint128`), coordinated by **CoFHE**.
- **Sell**: the project token is a **normal ERC-20**. The factory also deploys a **confidential wrapper (`cTOKEN`)** over that ERC-20 so allocations to buyers can be paid in **confidential** form after success.
- **Metadata** (addresses, tx calldata shape, timing, who called what) is still **public**, like any EVM app. **What is protected** is the **FHE-protected values** (e.g. contribution sizes, aggregate raised/sold while encrypted) per CoFHE’s model.

---

## 2. Main contracts and addresses

| Role | Contract | Notes |
|------|-----------|--------|
| **Factory** | `PrivacyPresaleFactory` | Immutable **`cweth`** (network’s `ConfidentialWETH`). Creates each sale. |
| **Sale** | `PrivacyPresale` | Holds pool config, FHE state, permissions; **Ownable** (creator). |
| **Raise asset** | `ConfidentialWETH` | User wraps **ETH → encrypted cWETH balance**; approvals/transfers use **FHERC20** (`approveEncrypted`, `_transferFromEncrypted`, …). |
| **Project token** | User’s **ERC-20** | Plain token pulled into the presale via `transferFrom`. |
| **Wrapped project token** | `ConfidentialTokenWrapper` | One per presale: **shield** plain token into **cTOKEN** balances (FHE). |

The factory constructor stores **`cweth`** so every new `PrivacyPresale` knows which confidential WETH contract to use for the raise.

---

## 3. Creating a presale (factory flow)

Entry point: **`createPrivacyPresaleWithExistingToken(address _token, Options _options)`**

1. **Deploy `ConfidentialTokenWrapper`** for `_token`  
   - Name/symbol like `Confidential {Name}` / `c{Symbol}`.  
   - Holds a reference to the **underlying** ERC-20.

2. **Deploy `PrivacyPresale`** with:  
   - `cweth` from factory  
   - `ctoken` = new wrapper  
   - `token` = `_token`  
   - `options` = sale parameters  
   - **`presaleOwner_` = `msg.sender`** (the creator)  
   This address receives **unsold** or **refunded-sale** plain tokens on finalization (see §6).

3. **`transferOwnership(msg.sender)`**  
   Initially `Ownable` sets the deployer (factory) as owner; this hands **owner** to the **creator** so they can finalize, allow decrypt, etc.

4. **`safeTransferFrom(creator, presale, tokenPresale + tokenAddLiquidity)`**  
   The creator must have **approved the factory**; the full token budget is moved onto the **presale** contract.

5. Presale is recorded and **`PrivacyPresaleCreated`** is emitted (creator, presale, underlying token, ctoken, cweth).

---

## 4. `PrivacyPresale.Options` (sale parameters)

| Field | Meaning |
|-------|---------|
| `tokenPresale` | Plain ERC-20 amount allocated for the sale (into presale custody at create). |
| `tokenAddLiquidity` | Plain tokens reserved for liquidity path (same custody). |
| `softCap` / `hardCap` | Encrypted raise bounds in **cWETH units** (same width as `euint128` paths in `purchase`). |
| `minContribution` / `maxContribution` | Per-wallet bounds on **encrypted** contribution sizing (FHE compares/selection). |
| `start` / `end` | Unix timestamps for the purchase window. |
| `liquidityPercentage` | Portion of raise related to liquidity (stored; downstream AMM wiring may use it). |
| `listingRate` | Listing-side rate parameter. |

At construction:

- **`pool.tokenPerEthWithDecimals = tokenPresale / hardCap`**  
  Used inside **`purchase`** to map **active cWETH in** → **encrypted tokens allocated** to the buyer (`FHE.mul`).

---

## 5. Lifecycle states (`pool.state`)

The contract comment encodes:

| Value | Name (comment) | Meaning |
|------|-----------------|--------|
| 1 | Active | Sale running; **`purchase`** allowed in window. |
| 2 | Finalizing | Set during **`finalizePreSale`** while decrypt results are published. |
| 3 | Failed | Soft cap not met after finalize; users **`refund`**. |
| 4 | Success | Soft cap met; users **`claim`** confidential project tokens. |

*(State `0` “Pending” may appear in comments but the constructor currently sets state to **1** immediately.)*

---

## 6. Buying: `purchase(InEuint128 encryptedAmount)`

**Who:** any wallet during **`start ≤ now ≤ end`** while **`pool.state == 1`**.

**Steps (simplified):**

1. **Client (CoFHE SDK)** encrypts the contribution as **`InEuint128`** (ZK + handle per CoFHE rules) and sends **`purchase(encryptedAmount)`**.

2. Contract converts input to **`euint128 amount`**.

3. **FHE logic** (no plaintext branch on secrets):  
   - Clamp to **per-wallet max** vs `maxContribution`.  
   - If cumulative contribution would still be **below** `minContribution`, that buy is effectively **zeroed** (FHE `select`).  
   - **`_transferFromEncrypted`** pulls **cWETH** from buyer → presale (spender path uses FHERC20 allowance).

4. **Aggregate raised** `pool.ethRaisedEncrypted` is updated; if over **hard cap**, an encrypted **refund slice** is computed and **`_transferEncrypted`** back to the buyer for the overflow.

5. **Allocation:** `newTokens = activeContribution * tokenPerEthWithDecimals` (FHE mul).  
   - **`contributions[msg.sender]`** (encrypted cWETH contributed) and **`claimableTokens[msg.sender]`** (encrypted cTOKEN claimable) are updated, with **`FHE.allow`** to the user where needed for later decrypt/transfer.

**Important:** buyers must **`approveEncrypted`** the presale on **cWETH** so `_transferFromEncrypted` can spend their encrypted balance.

---

## 7. After the sale window: finalization (owner + CoFHE decrypt)

Only **`owner`** (the creator) runs this path.

### 7.1 `allowFinalizationDecrypt()`

- Callable when sale **active** and **`now > end`**.  
- Calls **`FHE.allowPublic`** on **`ethRaisedEncrypted`** and **`tokensSoldEncrypted`** so the **Threshold Network** / SDK can produce **decrypt-for-tx** proofs for those handles.

### 7.2 `finalizePreSale(cwethRaised, ethSig, tokensSold, tokensSig)`

- Requires **active** and **`now > end`**.  
- Sets state to **finalizing (2)**.  
- **`FHE.publishDecryptResult`** twice: binds **plaintext** totals + **signatures** to the encrypted aggregates (CoFHE verify path).  
- Writes **`pool.weiRaised`** / **`pool.tokensSold`** from the revealed values (with the contract’s scaling for display/settlement).

Then **branch on soft cap:**

- **`cwethRaised < softCap` → state 3 (failed)**  
  - **`IERC20(pool.token).transfer(presaleOwner, tokenPresale)`** — return the sale allocation of **plain** tokens to the creator.

- **Else → state 4 (success)**  
  - **`unsold = tokenPresale - tokensSold`**: if positive, **`transfer(presaleOwner, unsold)`**.  
  - **`approve` + `ConfidentialTokenWrapper.deposit(tokensSold, presale)`** — shields sold amount into **cTOKEN** on the presale.  
  - **`ConfidentialWETH.withdraw(cwethRaised)`** — unwraps raised cWETH side per contract design (ETH / settlement path).

If **`presaleOwner`** were zero, **plain ERC-20 transfers would revert** (`ERC20InvalidReceiver` in OpenZeppelin v5). The factory therefore passes **`msg.sender`** into the constructor so **refunds of unsold / failed-sale tokens** always go to the real creator.

---

## 8. User exits

### 8.1 `claim()` (success, state 4)

- Clears **`claimableTokens[msg.sender]`** (FHE zero + allows).  
- **`_transferEncrypted`** on **`pool.ctoken`** — user receives **confidential project tokens**.

### 8.2 `refund()` (failed, state 3)

- Clears **`contributions[msg.sender]`**.  
- **`_transferEncrypted`** on **`pool.cweth`** — user gets back their **encrypted cWETH** contribution.

---

## 9. Confidential WETH (`ConfidentialWETH`) — how it ties in

- **`deposit(to)` payable:** user sends **ETH**; contract mints **encrypted** balance in **9-decimal** cWETH units (`rate = 1e9` wei per unit); dust below `rate` is refunded in plain ETH.  
- **`withdraw(amount)`:** burns encrypted balance; sends **`amount * rate`** wei to the caller.  
- **FHERC20:** `approveEncrypted`, `transferEncrypted`, `_transferFromEncrypted`, **`balanceOfEncrypted`** for UI decrypt, etc.

The presale never takes “raw ETH” for buys in this design; it takes **cWETH** via encrypted transfers.

---

## 10. Frontend (pvtsale UI) — mental map

| Step | UI / hook | Chain / CoFHE |
|------|-----------|----------------|
| Create sale | Create launchpad + **`createPrivacyPresaleWithExistingToken`** | Approve ERC-20 to **factory**; factory moves tokens to presale. |
| Wrap ETH | cWETH modal | **`deposit`** on `ConfidentialWETH`. |
| Approve spend | Presale form | **`approveEncrypted`** max on **cWETH** to **presale** (`useConfidentialApproveCallback` + `useCofheClient`). |
| Buy | Presale form | **`encryptInputs`** → **`purchase`**. |
| Show balances | Contribution / balance widgets | **`readContract`** handles + **`decryptForView`** (permits). |
| Finalize | Actions card | **`allowFinalizationDecrypt`** → **`decryptForTx`** (SDK returns **`decryptedValue` + `signature`**) → **`finalizePreSale`**. |
| Claim / refund | Actions | **`claim`** / **`refund`**. |

Use **`@cofhe/sdk`** with **`@cofhe/sdk/web`** for browser setup; keep **chain**, **RPC**, and **`supportedChains`** aligned with the host network.

---

## 11. Threat model (short)

- **Public:** presale address, token addresses, timestamps, tx ordering, that a finalize happened, owner actions, etc.  
- **CoFHE-protected:** values carried as **FHE ciphertexts** and the rules enforced inside **`purchase`** / balances.  
- **Decrypt-for-view:** reveals plaintext **only to the user** who can sign a permit (UI).  
- **Decrypt-for-tx:** produces values + signatures **for the owner** to publish on-chain during finalize.

---

## 12. Operational checklist

1. **Pin** CoFHE stack versions together (see [Fhenix compatibility](https://cofhe-docs.fhenix.zone/get-started/introduction/compatibility.md)).  
2. Deploy **`ConfidentialWETH`** (or use network-provided address) → deploy **factory** with that address.  
3. Point the UI **`VITE_PRESALE_FACTORY_CA`** (and/or defaults in `addresses.ts`) at the factory.  
4. After any Solidity change, refresh **`ui/src/web3/abis/*.json`** from `contracts/artifacts/` and run **`npm run typechain:build`** in `ui/`.  
5. **New presales** only pick up bytecode fixes (e.g. `presaleOwner`) from **new** factory deployments — already deployed presales are immutable.

---

## 13. File reference

| Area | Path |
|------|------|
| Factory | `contracts/contracts/PrivacyPresaleFactory.sol` |
| Presale | `contracts/contracts/PrivacyPresale.sol` |
| cWETH | `contracts/contracts/ConfidentialWETH.sol` |
| cTOKEN wrapper | `contracts/contracts/ConfidentialTokenWrapper.sol` |
| FHERC20 surface | `contracts/contracts/interfaces/IFHERC20.sol` |
| Deploy script | `contracts/scripts/deploy-factory.ts` |

---

*This file is descriptive documentation for developers operating pvtsale; it is not a security audit or legal statement.*
