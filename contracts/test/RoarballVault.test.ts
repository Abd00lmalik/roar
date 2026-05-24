import { expect } from "chai";
import hre from "hardhat";

describe("RoarballVault", function () {
  it("deposits, signs EIP-712 voucher, and settles via settler", async function () {
    const { ethers } = hre;
    const [owner, deployer, viewer, creator, treasury, fanRewards, settler] = await ethers.getSigners();

    // 1. Deploy MockUSDC
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const usdc = await MockUSDC.deploy(owner.address);
    await usdc.waitForDeployment();
    const usdcAddress = await usdc.getAddress();

    // 2. Deploy RoarballVault
    const RoarballVault = await ethers.getContractFactory("RoarballVault");
    const vault = await RoarballVault.deploy(
      usdcAddress,
      treasury.address,
      fanRewards.address,
      settler.address
    );
    await vault.waitForDeployment();
    const vaultAddress = await vault.getAddress();

    // 3. Mint USDC to viewer and approve vault
    const totalOwed = 100000n; // USDC is 6 decimals, so 100000 units
    await usdc.mint(viewer.address, totalOwed);
    await usdc.connect(viewer).approve(vaultAddress, totalOwed);

    // 4. Generate EIP-712 signature over WatchVoucher
    const domain = {
      name: "RoarballVault",
      version: "1",
      chainId: (await ethers.provider.getNetwork()).chainId,
      verifyingContract: vaultAddress
    };

    const types = {
      WatchVoucher: [
        { name: "user", type: "address" },
        { name: "creator", type: "address" },
        { name: "totalOwed", type: "uint256" },
        { name: "nonce", type: "uint256" }
      ]
    };

    const message = {
      user: viewer.address,
      creator: creator.address,
      totalOwed: totalOwed,
      nonce: 0n
    };

    const signature = await viewer.signTypedData(domain, types, message);

    // 5. Settle voucher as settler
    await expect(
      vault.connect(settler).settleVoucher(
        viewer.address,
        creator.address,
        totalOwed,
        0n,
        signature
      )
    ).to.emit(vault, "VoucherSettled");

    // 6. Verify splits
    // 85% Creator: 85,000 units (internal claimable ledger)
    // 10% Fan pool: 10,000 units (direct transfer)
    // 5% Treasury: 5,000 units (direct transfer)
    expect(await vault.creatorEarnings(creator.address)).to.equal(85000n);
    expect(await usdc.balanceOf(fanRewards.address)).to.equal(10000n);
    expect(await usdc.balanceOf(treasury.address)).to.equal(5000n);
    expect(await usdc.balanceOf(viewer.address)).to.equal(0n);
    expect(await usdc.balanceOf(vaultAddress)).to.equal(85000n);

    // 7. Creator claims earnings
    await expect(vault.connect(creator).claimCreatorEarnings())
      .to.emit(vault, "CreatorClaimed")
      .withArgs(creator.address, 85000n);

    expect(await usdc.balanceOf(creator.address)).to.equal(85000n);
    expect(await usdc.balanceOf(vaultAddress)).to.equal(0n);
  });
});
