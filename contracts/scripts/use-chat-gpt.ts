import hre, { ethers } from "hardhat";
import { CONTRACTS } from "./data/deployed-contracts";

async function main() {
  console.log("👟 Start script 'use-chat-gpt'");

  const network = hre.network.name;

  const chatGptContract = await ethers.getContractAt(
    "ChatGpt",
    CONTRACTS[network].chatGpt as `0x${string}`
  );

  //   await chatGptContract.startChat("Hello! Who are you?");

  //   const historyContents = await chatGptContract.getMessageHistoryContents(0);
  //   console.log({ historyContents });

  //   const historyRoles = await chatGptContract.getMessageHistoryRoles(0);
  //   console.log({ historyRoles });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
