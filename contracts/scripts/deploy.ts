import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // 1. Deploy ConfidentialWETH
  console.log("\n--- Deploying ConfidentialWETH ---");
  const ConfidentialWETH = await ethers.getContractFactory("ConfidentialWETH");
  const cweth = await ConfidentialWETH.deploy();
  await cweth.waitForDeployment();
  const cwethAddress = await cweth.getAddress();
  console.log("ConfidentialWETH deployed to:", cwethAddress);

  // 2. Deploy PrivacyPresaleFactory
  console.log("\n--- Deploying PrivacyPresaleFactory ---");
  const Factory = await ethers.getContractFactory("PrivacyPresaleFactory");
  const factory = await Factory.deploy(cwethAddress);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("PrivacyPresaleFactory deployed to:", factoryAddress);

  // 3. Deploy a sample PresaleToken for testing
  console.log("\n--- Deploying Sample PresaleToken ---");
  const totalSupply = ethers.parseUnits("1000000", 18); // 1M tokens
  const presaleSupply = ethers.parseUnits("500000", 18); // 500K for presale
  const PresaleToken = await ethers.getContractFactory("PresaleToken");
  // We'll mint presale tokens to the deployer first, then approve later
  const token = await PresaleToken.deploy(
    "pvtsale Test Token",
    "PVTSALE",
    totalSupply,
    0n, // presaleSupply minted to deployer for now
    deployer.address
  );
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("PresaleToken deployed to:", tokenAddress);

  // Summary
  console.log("\n========================================");
  console.log("DEPLOYMENT SUMMARY");
  console.log("========================================");
  console.log("Network:              Sepolia");
  console.log("Deployer:            ", deployer.address);
  console.log("ConfidentialWETH:    ", cwethAddress);
  console.log("PresaleFactory:      ", factoryAddress);
  console.log("PresaleToken (test): ", tokenAddress);
  console.log("========================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
