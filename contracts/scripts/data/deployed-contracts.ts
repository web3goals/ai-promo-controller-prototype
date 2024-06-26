export const CONTRACTS: {
  [key: string]: {
    oracle: `0x${string}` | undefined;
    chatGpt: `0x${string}` | undefined;
    openAiChatGptVision: `0x${string}` | undefined;
    usdToken: `0x${string}` | undefined;
    requestToken: `0x${string}` | undefined;
  };
} = {
  galadrielDevnet: {
    oracle: "0x4168668812C94a3167FCd41D12014c5498D74d7e",
    chatGpt: "0x02008a8DBc938bd7930bf370617065B6B0c1221a",
    openAiChatGptVision: "0x1e4712A93beEc0aa26151CF44061eE91DD56f921",
    usdToken: "0x0c44cFecaFE4da904Ee24984FD74c91C2bE431B7",
    requestToken: "0x02e1A2a943E6Ce63a89d40EFAE63bf6AcDFEc268",
  },
};
