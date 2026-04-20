import { ethers } from "hardhat";

/** Must match ConfidentialWETH on Sepolia (see ui `CONFIDENTIAL_WETH_ADDRESS`). */
const DEFAULT_SEPOLIA_CWETH = "0x4bfeD648B058CcF97594c4d5e556A99912C68eD9";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying PrivacyPresaleFactory with account:", deployer.address);

  const cwethAddress = (process.env.CWETH_ADDRESS || DEFAULT_SEPOLIA_CWETH).trim();
  if (!ethers.isAddress(cwethAddress)) {
    throw new Error(`Invalid CWETH_ADDRESS: ${cwethAddress}`);
  }
  console.log("Using cWETH:", cwethAddress);

  console.log("\n--- Deploying PrivacyPresaleFactory ---");
  const Factory = await ethers.getContractFactory("PrivacyPresaleFactory");
  const factory = await Factory.deploy(cwethAddress);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("PrivacyPresaleFactory deployed to:", factoryAddress);
  
  console.log("\n========================================");
  console.log("1) In ui/.env set:");
  console.log(`   VITE_PRESALE_FACTORY_CA=${factoryAddress}`);
  console.log("2) Or update ui/src/web3/core/constants/addresses.ts default for Sepolia.");
  console.log("3) From ui/: npm run typechain:build (if you copied new ABIs from contracts/artifacts).");
  console.log("========================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
