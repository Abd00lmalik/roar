import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  const rawAddress = "0x9A9f2eBCf15456f9175373a2F93c4A0b53c1550c";
  const usdcAddress = ethers.getAddress(rawAddress.toLowerCase());
  
  try {
    const code = await ethers.provider.getCode(usdcAddress);
    if (code === "0x") {
      console.log(`USDC Address ${usdcAddress} has no contract deployed.`);
      return;
    }
    
    const usdc = await ethers.getContractAt([
      "function name() external view returns (string)",
      "function symbol() external view returns (string)",
      "function decimals() external view returns (uint8)"
    ], usdcAddress);
    
    const name = await usdc.name();
    const symbol = await usdc.symbol();
    const decimals = await usdc.decimals();
    
    console.log(`Contract details for ${usdcAddress}:`);
    console.log(`Name: ${name}`);
    console.log(`Symbol: ${symbol}`);
    console.log(`Decimals: ${decimals}`);
  } catch (err: any) {
    console.error(`Failed to query contract details: ${err.message}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
