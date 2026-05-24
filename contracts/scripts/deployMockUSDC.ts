import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer address: ${deployer.address}`);

  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy(deployer.address);
  await usdc.waitForDeployment();

  const address = await usdc.getAddress();
  console.log(`MockUSDC deployed at: ${address}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
