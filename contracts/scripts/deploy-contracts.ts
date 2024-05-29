import hre, { ethers } from "hardhat";
import { CONTRACTS } from "./data/deployed-contracts";

async function main() {
  console.log("👟 Start script 'deploy-contracts'");

  const network = hre.network.name;

  if (!CONTRACTS[network].chatGpt && CONTRACTS[network].oracle) {
    const contractFactory = await ethers.getContractFactory("ChatGpt");
    const contract = await contractFactory.deploy(
      CONTRACTS[network].oracle as `0x${string}`
    );
    await contract.waitForDeployment();
    console.log(
      `Contract 'ChatGpt' deployed to: ${await contract.getAddress()}`
    );
  }

  if (!CONTRACTS[network].openAiChatGptVision && CONTRACTS[network].oracle) {
    const contractFactory = await ethers.getContractFactory(
      "OpenAiChatGptVision"
    );
    const contract = await contractFactory.deploy(
      CONTRACTS[network].oracle as `0x${string}`
    );
    await contract.waitForDeployment();
    console.log(
      `Contract 'OpenAiChatGptVision' deployed to: ${await contract.getAddress()}`
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
