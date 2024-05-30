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
    description = "Indie Developer 🧑‍💻";
    twitter = "@kiv1n";
    telegram = "@kiv1n";
  }

  return { name, avatar, description, twitter, telegram };
}
