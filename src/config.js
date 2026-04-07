// ╔══════════════════════════════════════════════════════════════╗
// ║  OTGateway Configuration                                    ║
// ║  Change NETWORK to "mainnet" for production.                ║
// ╚══════════════════════════════════════════════════════════════╝

export const NETWORK = "mainnet"; // ← "testnet" or "mainnet"

export const WALLETCONNECT_PROJECT_ID = "7b995bf019a79da1e29f3b13819f5a36";

const NETWORKS = {
  testnet: {
    chainName: "Ethereum",
    explorer: "https://sepolia.etherscan.io",
    contracts: {
      otusdt: "0x8b17e97e2760DB9C7FF25Ef0492aE3C883768905",
      gateway: "0xaaE4972BEb4501de6202Bae9c7bc775E0787f0d5",
      // Chainlink ETH/USD price feed on Sepolia (8 decimals)
      ethUsdFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    },
  },
  mainnet: {
    chainName: "Ethereum",
    explorer: "https://etherscan.io",
    contracts: {
      otusdt: "0x36fC88F20DdE11851985f9108B9149E9b4867bD4",
      gateway: "0xFBe871cd582b6D0261D5D22537c3d51C6F758F19",
      // Chainlink ETH/USD price feed on Ethereum mainnet (8 decimals)
      ethUsdFeed: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
    },
  },
};

export const NET = NETWORKS[NETWORK];

export const APP_METADATA = {
  name: "OTGateway",
  description: "Withdraw your OTUSDT securely on Ethereum",
  url: "https://otusdtgateway.com",
  icons: [],
};