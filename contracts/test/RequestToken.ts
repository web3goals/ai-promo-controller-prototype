import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("RequestToken", function () {
  async function initFixture() {
    // Get signers
    const [deployer, userOne, userTwo, userThree] = await ethers.getSigners();
    // Deploy contracts
    const usdTokenContractFactory = await ethers.getContractFactory("USDToken");
    const usdTokenContract = await usdTokenContractFactory.deploy();
    const requestTokenContractFactory = await ethers.getContractFactory(
      "RequestToken"
    );
    const requestTokenContract = await requestTokenContractFactory.deploy(
      ethers.ZeroAddress
    );
    // Send usd tokens to users
    await usdTokenContract
      .connect(deployer)
      .transfer(userOne, ethers.parseEther("1000"));
    await usdTokenContract
      .connect(deployer)
      .transfer(userTwo, ethers.parseEther("1000"));
    return {
      deployer,
      userOne,
      userTwo,
      userThree,
      usdTokenContract,
      requestTokenContract,
    };
  }

  it.only("Should support the main flow", async function () {
    const { userOne, userTwo, usdTokenContract, requestTokenContract } =
      await loadFixture(initFixture);
    // Create request
    await expect(
      usdTokenContract
        .connect(userOne)
        .approve(requestTokenContract.getAddress(), ethers.MaxUint256)
    ).to.be.not.reverted;
    await expect(
      requestTokenContract
        .connect(userOne)
        .create(
          userTwo,
          "task_1",
          ethers.parseEther("42"),
          usdTokenContract,
          "ipfs://1"
        )
    ).to.be.not.reverted;
    const tokenId = (await requestTokenContract.nextTokenId()) - 1n;
    // Accept request
    await expect(
      requestTokenContract.connect(userTwo).accept(tokenId)
    ).to.changeTokenBalances(
      usdTokenContract,
      [userOne, requestTokenContract],
      [ethers.parseEther("-42"), ethers.parseEther("42")]
    );
    // Complete request
    await expect(
      requestTokenContract.connect(userTwo).complete(tokenId, "ipfs://2")
    ).to.changeTokenBalances(
      usdTokenContract,
      [userTwo, requestTokenContract],
      [ethers.parseEther("42"), ethers.parseEther("-42")]
    );
    // Check stats
    expect(await requestTokenContract.recipientSuccesses(userTwo)).to.be.equal(
      "1"
    );
    expect(await requestTokenContract.recipientFails(userTwo)).to.be.equal("0");
    // Check recipients
    // const test = await requestTokenContract.getRecipients();
    // console.log({ test });
    expect(await requestTokenContract.getRecipients()).to.contain(
      await userTwo.getAddress()
    );
  });
});
