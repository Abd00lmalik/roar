import pkg from "hardhat";
const { ethers } = pkg;
import * as fs from "fs";
import { fileURLToPath } from "url";
import * as path from "path";

async function main() {
  const usdc           = process.env.USDC_ADDRESS;
  const treasury       = process.env.TREASURY_ADDRESS;
  const fanRewardsPool = process.env.FAN_REWARDS_ADDRESS;
  const settler        = process.env.SETTLER_ADDRESS;

  if (!usdc || !treasury || !fanRewardsPool || !settler) {
    throw new Error(
      "Missing required env vars: USDC_ADDRESS, TREASURY_ADDRESS, FAN_REWARDS_ADDRESS, SETTLER_ADDRESS"
    );
  }

  const Vault = await ethers.getContractFactory("RoarballVault");
  const vault = await Vault.deploy(usdc, treasury, fanRewardsPool, settler);
  await vault.waitForDeployment();

  const address = await vault.getAddress();
  console.log(`RoarballVault deployed: ${address}`);

  const dirname = path.dirname(fileURLToPath(import.meta.url));
  const outDir = path.join(dirname, "../deployments");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(
    path.join(outDir, "xlayer-testnet.json"),
    JSON.stringify({ RoarballVault: address, deployedAt: new Date().toISOString() }, null, 2)
  );
}

main().catch((e) => { console.error(e); process.exit(1); });
