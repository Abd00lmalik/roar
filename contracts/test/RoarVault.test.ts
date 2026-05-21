import { expect } from "chai";
import hre from "hardhat";

describe("RoarVault", function () {
  it("deposits and settles with 85/5/10 split", async function () {
    const { ethers } = hre;
    const [owner, viewer, creator] = await ethers.getSigners();

    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const usdc = await MockUSDC.deploy(owner.address);
    await usdc.waitForDeployment();

    const RoarVault = await ethers.getContractFactory("RoarVault");
    const vault = await RoarVault.deploy(
      await usdc.getAddress(),
      owner.address,
      1000n,
      owner.address,
    );
    await vault.waitForDeployment();

    await usdc.mint(viewer.address, 1_000_000n);
    await usdc.connect(viewer).approve(await vault.getAddress(), 1_000_000n);
    await vault.connect(viewer).deposit(1_000_000n);

    await vault.setSettler(owner.address, true);
    await vault.settleSession(
      viewer.address,
      creator.address,
      ethers.keccak256(ethers.toUtf8Bytes("video-1")),
      100n,
    );

    expect(await vault.creatorEarnings(creator.address)).to.equal(85_000n);
    expect(await vault.platformRevenue()).to.equal(5_000n);
    expect(await vault.fanRewardsPool()).to.equal(10_000n);
  });
});
