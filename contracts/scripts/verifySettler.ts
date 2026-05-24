import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  const vaultAddress = "0x512F7469BcC83089497506b5df64c6E246B39925";
  const vault = await ethers.getContractAt("RoarballVault", vaultAddress);
  const settler = await vault.settler();
  console.log("On-chain Settler:", settler);
  console.log("Expected Settler:", process.env.SETTLER_ADDRESS);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
