import hre, { ethers } from "hardhat";
import { CONTRACTS } from "./data/deployed-contracts";

async function main() {
  console.log("👟 Start script 'use-open-ai-chat-gpt-vision'");

  const network = hre.network.name;

  const openAiChatGptVisionContract = await ethers.getContractAt(
    "OpenAiChatGptVision",
    CONTRACTS[network].openAiChatGptVision as `0x${string}`
  );

  const task = "Make a Telegram post about the Great Money project";

  const prompt = `
    I sent the next task to a influencer: '${task}'.

    The influencer said he did the necessary post and sent me this image.

    Give me an answer that contains ONLY ONE word: 'success' if my task is completed successfully, 'fail' if my task is failed.

    Double-check that your answer contains only one word.
  `;

  // await openAiChatGptVisionContract.startChat(
  //   prompt,
  //   "https://i.ibb.co/z6xM3ZB/image.png"
  // );

  const history = await openAiChatGptVisionContract.getMessageHistory(6);
  console.log({ history });
  console.log(JSON.stringify(history));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
