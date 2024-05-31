import { mainnet } from "viem/chains";
import { normalize } from "viem/ens";
import { useEnsAvatar, useEnsName, useEnsText } from "wagmi";

export default function useEns(account: `0x${string}` | undefined) {
  const { data: ensName } = useEnsName({
    address: account,
    chainId: mainnet.id,
  });
  const { data: ensAvatar } = useEnsAvatar({
    name: normalize(ensName || ""),
    chainId: mainnet.id,
  });
  const { data: ensDescription } = useEnsText({
    name: normalize(ensName || ""),
    key: "description",
    chainId: mainnet.id,
  });
  const { data: ensTwitter } = useEnsText({
    name: normalize(ensName || ""),
    key: "com.twitter",
    chainId: mainnet.id,
  });
  const { data: ensTelegram } = useEnsText({
    name: normalize(ensName || ""),
    key: "org.telegram",
    chainId: mainnet.id,
  });

  let name = ensName;
  let avatar = ensAvatar;
  let description = ensDescription;
  let twitter = ensTwitter;
  let telegram = ensTelegram;

  // Fake data
  if (account == "0x4306D7a79265D2cb85Db0c5a55ea5F4f6F73C4B1") {
    name = "arthur.eth";
    avatar = "https://mighty.tools/mockmind-api/content/human/24.jpg";
    description = "Indie Developer.";
    twitter = "@kiv1n";
    telegram = "@kiv1n";
  }
  if (account == "0x3F121f9a16bd6C83D325985417aDA3FE0f517B7D") {
    name = "gm42.eth";
    avatar = "https://mighty.tools/mockmind-api/content/robot/14.jpg";
    description =
      "Professional nerd with a passion for all things tech. Probably spending more time with my gadgets than actual humans.";
  }
  if (account == "0x788A4fEcC0Ece997B9b64528bc9E10e0219C94A2") {
    name = "jjesserr.eth";
    avatar = "https://mighty.tools/mockmind-api/content/human/67.jpg";
    description =
      " Beauty blogger sharing tips and reviews on all things makeup, skincare, and haircare. Join me on my journey to enhance natural beauty!";
  }
  if (account == "0xF83938DB419b0756c501D2DaA91b42e62Cb6c89E") {
    name = "alice.eth";
    avatar = "https://mighty.tools/mockmind-api/content/human/56.jpg";
    description = "Travel blogger with a fear of flying. I prefer teleporting.";
    twitter = "@alice";
    telegram = "@alice";
  }

  return { name, avatar, description, twitter, telegram };
}
