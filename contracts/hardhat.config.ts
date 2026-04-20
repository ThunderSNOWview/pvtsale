import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers";
import "@cofhe/hardhat-plugin";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  cofhe: {
    logMocks: true,
    gasWarning: true,
  },
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: "cancun",
    },
  },
  defaultNetwork: "hardhat",
  // eth-sepolia and arb-sepolia are auto-injected by @cofhe/hardhat-plugin
  networks: {},
  etherscan: {
    apiKey: {
      "eth-sepolia": process.env.ETHERSCAN_API_KEY || "",
    },
  },
};

export default config;
