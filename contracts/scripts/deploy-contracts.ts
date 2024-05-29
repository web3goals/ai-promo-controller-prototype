import hre, { ethers } from "hardhat";
import { CONTRACTS } from "./data/deployed-contracts";

async function main() {
  console.log("👟 Start script 'deploy-contracts'");

  const network = hre.network.name;

  if (!CONTRACTS[network].chatGpt) {
    const contractFactory = await ethers.getContractFactory("ChatGpt");
    const contract = await contractFactory.deploy(
      CONTRACTS[network].oracle as `0x${string}`
    );
    await contract.waitForDeployment();
    console.log(
      `Contract 'ChatGpt' deployed to: ${await contract.getAddress()}`
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
