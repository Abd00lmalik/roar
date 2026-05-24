import { ethers } from "hardhat";
import * as fs from "fs";

async function main() {
  const usdc = process.env.USDC_ADDRESS!;
  const fanRewardsPool = process.env.FAN_REWARDS_ADDRESS!;
  const gasTreasury = process.env.TREASURY_ADDRESS!;

  const FanPassport = await ethers.getContractFactory("FanPassport");
  const passport = await FanPassport.deploy();
  await passport.waitForDeployment();
  console.log("FanPassport:", await passport.getAddress());

  const VARSystem = await ethers.getContractFactory("VARSystem");
  const varSystem = await VARSystem.deploy(await passport.getAddress());
  await varSystem.waitForDeployment();
  console.log("VARSystem:", await varSystem.getAddress());

  const AdBoard = await ethers.getContractFactory("StadiumAdBoard");
  const adBoard = await AdBoard.deploy(usdc, fanRewardsPool, gasTreasury);
  await adBoard.waitForDeployment();
  console.log("StadiumAdBoard:", await adBoard.getAddress());

  fs.writeFileSync(
    "deployments/xlayer-testnet-governance.json",
    JSON.stringify({
      FanPassport: await passport.getAddress(),
      VARSystem: await varSystem.getAddress(),
      StadiumAdBoard: await adBoard.getAddress(),
      deployedAt: new Date().toISOString(),
    }, null, 2)
  );
}

main().catch((e) => { console.error(e); process.exit(1); });
