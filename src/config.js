// ╔══════════════════════════════════════════════════════════════╗
// ║  OTGateway Configuration                                    ║
// ║  Change NETWORK to "mainnet" for production.                ║
// ╚══════════════════════════════════════════════════════════════╝

export const NETWORK = "testnet"; // ← "testnet" or "mainnet"

export const WALLETCONNECT_PROJECT_ID = "7b995bf019a79da1e29f3b13819f5a36";

const NETWORKS = {
  testnet: {
    explorer: "https://sepolia.etherscan.io",
    contracts: {
      otusdt: "0x8b17e97e2760DB9C7FF25Ef0492aE3C883768905",
      gateway: "0x43E898DbFf50cbCF112E494dC0551e4e0Baa1F3F",
    },
  },
  mainnet: {
    explorer: "https://etherscan.io",
    contracts: {
      otusdt: "PASTE_MAINNET_TOKEN_ADDRESS",
      gateway: "PASTE_MAINNET_GATEWAY_ADDRESS",
    },
  },
};

export const NET = NETWORKS[NETWORK];

export const APP_METADATA = {
  name: "OTGateway",
  description: "Withdraw your OTUSDT securely on Ethereum",
  url: "https://otgateway.com",
  icons: [],
};
