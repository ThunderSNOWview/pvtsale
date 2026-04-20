const { ethers } = require("hardhat");

async function main() {
  const cweth = await ethers.getContractAt("ConfidentialWETH", "0x4bfeD648B058CcF97594c4d5e556A99912C68eD9");
  const tx = await cweth.deposit("0xFdB1555935e6e19a5E6c618DfE83C7ad02e9546B", { value: ethers.parseEther("0.01") });
  await tx.wait();
  console.log("0.01 cWETH minted to user successfully!");
}

main().catch(console.error);
