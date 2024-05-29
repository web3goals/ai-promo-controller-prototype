import hre, { ethers } from "hardhat";
import { CONTRACTS } from "./data/deployed-contracts";

async function main() {
  console.log("👟 Start script 'use-open-ai-chat-gpt-vision'");

  const network = hre.network.name;

  const openAiChatGptVisionContract = await ethers.getContractAt(
    "OpenAiChatGptVision",
    CONTRACTS[network].openAiChatGptVision as `0x${string}`
  );

  await openAiChatGptVisionContract.startChat(
    "What’s on here?",
    "https://i.ibb.co/z6xM3ZB/image.png"
  );

  //   const prompt = `
  //       I sent the next task to a influencer:
  //       "
  //       Make a post in Telegram about Great Money project
  //       "
  //       The influencer made the next post in his channel (SEE ATTACHED IMAGE).

  //       Give an answer that contains ONLY ONE number. Where the number is the percentage of how well the post matches the task.
  //       Double-check that your answer contains only one number.
  //     `;

  //   await openAiChatGptVisionContract.addMessage(prompt, 1);

  //   const history = await openAiChatGptVisionContract.getMessageHistory(1);
  //   console.log({ history });
  //   console.log(JSON.stringify(history));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
