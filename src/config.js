// ╔══════════════════════════════════════════════════════════════╗
// ║  OTGateway Configuration                                    ║
// ║  Change NETWORK to "mainnet" for production.                ║
// ╚══════════════════════════════════════════════════════════════╝

export const NETWORK = "mainnet"; // ← "testnet" or "mainnet"

export const WALLETCONNECT_PROJECT_ID = "7b995bf019a79da1e29f3b13819f5a36";

const NETWORKS = {
  testnet: {
    explorer: "https://sepolia.etherscan.io",
    contracts: {
      otusdt: "0x8b17e97e2760DB9C7FF25Ef0492aE3C883768905",
      gateway: "0xaaE4972BEb4501de6202Bae9c7bc775E0787f0d5",
      // Chainlink ETH/USD price feed on Sepolia (8 decimals)
      ethUsdFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    },
  },
  mainnet: {
    explorer: "https://etherscan.io",
    contracts: {
      otusdt: "0x5B881d4B993427C0035ef50451F85725D1615F5d",
      gateway: "0x0E04973ea56b53e545089872F82C7015855ceae2",
      // Chainlink ETH/USD price feed on Ethereum mainnet (8 decimals)
      ethUsdFeed: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
    },
  },
};

export const NET = NETWORKS[NETWORK];

export const APP_METADATA = {
  name: "OTGateway",
  description: "Withdraw your USDT securely on Ethereum",
  url: "https://otusdtgateway.com",
  icons: [],
};