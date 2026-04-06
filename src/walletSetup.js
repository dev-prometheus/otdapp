import { createAppKit } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { sepolia, mainnet } from "@reown/appkit/networks";
import { WALLETCONNECT_PROJECT_ID, APP_METADATA, NETWORK } from "./config";

const activeNetwork = NETWORK === "mainnet" ? mainnet : sepolia;

createAppKit({
  adapters: [new EthersAdapter()],
  networks: [activeNetwork],
  defaultNetwork: activeNetwork,
  projectId: WALLETCONNECT_PROJECT_ID,
  metadata: APP_METADATA,
  themeMode: "dark",
  themeVariables: {
    "--w3m-accent": "#2563eb",
    "--w3m-border-radius-master": "2px",
  },
  features: {
    analytics: false,
    email: false,
    socials: false,
    emailShowWallets: false,
  },
});
