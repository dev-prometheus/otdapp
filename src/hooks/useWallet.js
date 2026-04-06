import { useMemo } from "react";
import {
  useAppKit,
  useAppKitAccount,
  useAppKitProvider,
  useAppKitNetwork,
  useDisconnect,
} from "@reown/appkit/react";
import { BrowserProvider } from "ethers";
import { NETWORK } from "../config";

const TARGET_CHAIN_ID = NETWORK === "mainnet" ? 1 : 11155111;

export function useWallet() {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");
  const { chainId } = useAppKitNetwork();
  const { disconnect } = useDisconnect();

  // Create ethers provider and signer from Reown's wallet provider
  const { provider, signer } = useMemo(() => {
    if (!walletProvider || !isConnected) {
      return { provider: null, signer: null };
    }

    const bp = new BrowserProvider(walletProvider);
    // getSigner returns a Promise — components that need it must await
    const signerPromise = bp.getSigner();

    return { provider: bp, signer: signerPromise };
  }, [walletProvider, isConnected]);

  const connect = async () => {
    await open();
  };

  const isWrongNetwork =
    chainId !== undefined && chainId !== null && Number(chainId) !== TARGET_CHAIN_ID;

  return {
    address,
    provider,
    walletProvider, // Raw EIP-1193 provider for wallet_watchAsset and other direct RPC calls
    signer, // This is a Promise<JsonRpcSigner> — await it where needed
    chainId: chainId ? Number(chainId) : null,
    isConnected,
    isWrongNetwork,
    connect,
    disconnect,
  };
}
