import { Chain } from "viem/chains";
import { galadrielDevnet } from "./chains";

export type SiteConfig = typeof siteConfig;

export type SiteConfigContracts = {
  chain: Chain;
  requestToken: `0x${string}`;
  usdToken: `0x${string}`;
};

export const siteConfig = {
  emoji: "👁️",
  name: "AI Promo Controller",
  description:
    "A platform for finding and controlling influencers powered by smart contracts and AI",
  links: {
    github: "https://github.com/web3goals/ai-promo-controller-prototype",
  },
  contracts: {
    galadrielDevnet: {
      chain: galadrielDevnet,
      requestToken:
        "0x0000000000000000000000000000000000000000" as `0x${string}`,
      usdToken: "0x0000000000000000000000000000000000000000" as `0x${string}`,
    } as SiteConfigContracts,
  },
};
