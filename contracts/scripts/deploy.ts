import hre from "hardhat";

async function main() {
  const { ethers } = hre;
  const [deployer] = await ethers.getSigners();
  console.log("Deploying on X Layer testnet from:", deployer.address);

  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy(deployer.address);
  await usdc.waitForDeployment();
  console.log("MockUSDC deployed:", await usdc.getAddress());

  const PRICE_PER_SECOND = 1000n;
  const RoarVault = await ethers.getContractFactory("RoarVault");
  const vault = await RoarVault.deploy(
    await usdc.getAddress(),
    deployer.address,
    PRICE_PER_SECOND,
    deployer.address,
  );
  await vault.waitForDeployment();
  console.log("RoarVault deployed:", await vault.getAddress());

  const RoarBadges = await ethers.getContractFactory("RoarBadges");
  const badges = await RoarBadges.deploy(
    "https://roar.app/api/badges/metadata/",
    deployer.address,
  );
  await badges.waitForDeployment();
  console.log("RoarBadges deployed:", await badges.getAddress());

  await vault.setSettler(deployer.address, true);
  await badges.setMinter(deployer.address, true);

  console.log("\n✅ Add these to .env.local:");
  console.log(`NEXT_PUBLIC_USDC_ADDRESS=${await usdc.getAddress()}`);
  console.log(`NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS=${await vault.getAddress()}`);
  console.log(`NEXT_PUBLIC_BADGE_CONTRACT_ADDRESS=${await badges.getAddress()}`);
}

main().catch(console.error);
