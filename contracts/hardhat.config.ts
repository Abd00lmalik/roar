import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config({ path: ".env.local" });
dotenv.config();
const dirname = path.dirname(fileURLToPath(import.meta.url));

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: "cancun",
    },
  },
  paths: {
    sources: path.join(dirname, "src"),
    tests: path.join(dirname, "test"),
    cache: path.join(dirname, "cache"),
    artifacts: path.join(dirname, "artifacts"),
  },
  networks: {
    xlayerTestnet: {
      url: process.env.XLAYER_TESTNET_RPC_URL || "https://testrpc.xlayer.tech",
      chainId: 1952,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
    },
  },
};

export default config;
