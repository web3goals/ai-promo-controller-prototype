import hre, { ethers } from "hardhat";
import { CONTRACTS } from "./data/deployed-contracts";

async function main() {
  console.log("👟 Start script 'use-request-token'");

  const network = hre.network.name;

  const [deployer] = await ethers.getSigners();

  const usdTokenContract = await ethers.getContractAt(
    "USDToken",
    CONTRACTS[network].usdToken as `0x${string}`
  );
  const requestTokenContract = await ethers.getContractAt(
    "RequestToken",
    CONTRACTS[network].requestToken as `0x${string}`
  );

  // Create request
  //   const approveTx = await usdTokenContract.approve(
  //     requestTokenContract.getAddress(),
  //     ethers.MaxUint256
  //   );
  //   await approveTx.wait();
  //   const createTx = await requestTokenContract.create(
  //     deployer,
  //     "Make a Telegram post about the Super Jet project",
  //     ethers.parseEther("42"),
  //     usdTokenContract,
  //     "ipfs://1"
  //   );
  //   await createTx.wait();
  //   const tokenId = (await requestTokenContract.nextTokenId()) - 1n;
  const tokenId = 1n;
  console.log({ tokenId });

  // Accept request
  //   const acceptTx = await requestTokenContract.accept(tokenId);
  //   await acceptTx.wait();

  // Complete request
  //   const completeTx = await requestTokenContract.complete(
  //     tokenId,
  //     "https://i.ibb.co/z6xM3ZB/image.png"
  //   );
  //   await completeTx.wait();

  const content = await requestTokenContract.contents(tokenId);
  console.log({ content });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
