import { Chain } from "viem/chains";

export const galadrielDevnet: Chain = {
  id: 696_969,
  name: "Galadriel Devnet",
  nativeCurrency: { name: "GAL", symbol: "GAL", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://devnet.galadriel.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "Galadriel Devnet Explorer",
      url: "https://explorer.galadriel.com",
    },
  },
  testnet: true,
};
