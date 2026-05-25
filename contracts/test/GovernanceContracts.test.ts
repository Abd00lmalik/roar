import { expect } from "chai";
import hre from "hardhat";

describe("Governance contracts", function () {
  it("mints and burns FanPassport", async function () {
    const { ethers } = hre;
    const [, fan] = await ethers.getSigners();

    const FanPassport = await ethers.getContractFactory("FanPassport");
    const passport = await FanPassport.deploy();
    await passport.waitForDeployment();

    await expect(
      passport.connect(fan).mintPassport("US", { value: ethers.parseEther("0.01") })
    ).to.emit(passport, "PassportMinted");

    expect(await passport.holderToTokenId(fan.address)).to.equal(1n);
    expect(await passport.getStakedCountry(fan.address)).to.equal("US");

    await expect(passport.connect(fan).burnPassport()).to.emit(passport, "PassportBurned");
    expect(await passport.holderToTokenId(fan.address)).to.equal(0n);
  });

  it("distributes ad board bid proceeds 50/50", async function () {
    const { ethers } = hre;
    const [owner, advertiser, fanPool, treasury] = await ethers.getSigners();

    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const usdc = await MockUSDC.deploy(owner.address);
    await usdc.waitForDeployment();

    const AdBoard = await ethers.getContractFactory("StadiumAdBoard");
    const adBoard = await AdBoard.deploy(
      await usdc.getAddress(),
      fanPool.address,
      treasury.address
    );
    await adBoard.waitForDeployment();

    const bidAmount = 1_000_000n;
    await usdc.mint(advertiser.address, bidAmount);
    await usdc.connect(advertiser).approve(await adBoard.getAddress(), bidAmount);
    await adBoard.connect(advertiser).placeBid("UEFA", "ipfs://ad/1", bidAmount, 3600);

    expect(await usdc.balanceOf(fanPool.address)).to.equal(500_000n);
    expect(await usdc.balanceOf(treasury.address)).to.equal(500_000n);
  });

  it("opens and settles a VAR challenge after quorum", async function () {
    const { ethers } = hre;
    const [, challenger, voter1, voter2, voter3, voter4, voter5, voter6, voter7, voter8, voter9, voter10] =
      await ethers.getSigners();

    const FanPassport = await ethers.getContractFactory("FanPassport");
    const passport = await FanPassport.deploy();
    await passport.waitForDeployment();

    const VARSystem = await ethers.getContractFactory("VARSystem");
    const varSystem = await VARSystem.deploy(await passport.getAddress());
    await varSystem.waitForDeployment();

    const voters = [challenger, voter1, voter2, voter3, voter4, voter5, voter6, voter7, voter8, voter9, voter10];
    for (const voter of voters) {
      await passport.connect(voter).mintPassport("US", { value: ethers.parseEther("0.01") });
    }

    const videoId = "video-123";
    await varSystem
      .connect(challenger)
      .openChallenge(videoId, { value: ethers.parseEther("0.05") });

    for (const voter of voters.slice(0, 10)) {
      await varSystem.connect(voter).castVote(videoId, true);
    }

    await ethers.provider.send("evm_increaseTime", [48 * 60 * 60 + 1]);
    await ethers.provider.send("evm_mine", []);

    await expect(varSystem.settleChallenge(videoId)).to.emit(varSystem, "VideoBurned");
    expect(await varSystem.isVideoBurned(videoId)).to.equal(true);
  });
});
