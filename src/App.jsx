import { useState, useCallback, useEffect, useRef } from "react";
import { NETWORK } from "./config";
import { useWallet } from "./hooks/useWallet";
import { useContract } from "./hooks/useContract";
import Header from "./components/Header";
import HeroScreen from "./components/HeroScreen";
import WalletScreen from "./components/WalletScreen";
import DoneScreen from "./components/DoneScreen";
import ProcessingOverlay from "./components/ProcessingOverlay";

const KeyholeWatermark = () => (
  <svg
    className="otg-keyhole-bg"
    width="420"
    height="420"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="32" cy="32" r="32" fill="#2563eb" />
    <circle cx="32" cy="26" r="10" fill="#060810" />
    <rect x="28" y="26" width="8" height="22" rx="1" fill="#060810" />
    <rect x="20" y="22" width="24" height="5" rx="1" fill="#2563eb" />
  </svg>
);

export default function App() {
  const [screen, setScreen] = useState("hero");
  const [dest, setDest] = useState("");
  const [sentAmount, setSentAmount] = useState(null);
  const [sentFeeEth, setSentFeeEth] = useState(null);
  const [sentFeeUsd, setSentFeeUsd] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [txError, setTxError] = useState(null);

  const wallet = useWallet();
  const contract = useContract(wallet.provider, wallet.signer, wallet.address);

  const hasNavigated = useRef(false);

  const goTo = useCallback((s) => {
    setScreen(s);
    window.scrollTo?.({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (wallet.isConnected && !hasNavigated.current) {
      hasNavigated.current = true;
      goTo("wallet");
    }
    if (!wallet.isConnected && hasNavigated.current && !processing) {
      hasNavigated.current = false;
      setDest("");
      setTxHash(null);
      setTxError(null);
      goTo("hero");
    }
  }, [wallet.isConnected, goTo, processing]);

  useEffect(() => {
    if (!processing && !wallet.isConnected && hasNavigated.current) {
      hasNavigated.current = false;
      setDest("");
      setTxHash(null);
      goTo("hero");
    }
  }, [processing, wallet.isConnected, goTo]);

  const handleConnect = () => {
    wallet.connect();
  };

  const handleDisconnect = async () => {
    if (processing) return;
    await wallet.disconnect();
    hasNavigated.current = false;
    setDest("");
    setTxHash(null);
    setTxError(null);
    goTo("hero");
  };

  const handleConfirm = async (destination) => {
    setDest(destination);

    // Capture the amount and fee BEFORE withdrawal (balance will be 0 after)
    setSentAmount(contract.balance);
    setSentFeeEth(contract.feeEth);
    setSentFeeUsd(contract.feeUsd);

    setProcessing(true);
    setTxError(null);

    try {
      if (contract.needsApproval) {
        try {
          await contract.approveGateway();
        } catch (approveErr) {
          setProcessing(false);
          setTxError(approveErr.message);
          return;
        }
      }

      const result = await contract.withdraw(contract.balance, destination);
      setTxHash(result.hash);
      setProcessing(false);
      goTo("done");
    } catch (err) {
      console.error("Withdrawal error:", err);
      setProcessing(false);
      setTxError(err.message || "Transaction failed. Please try again.");
    }
  };

  const handleTimeout = () => {
    setProcessing(false);
    setTxError(
      "Transaction is taking longer than expected. Check your wallet for status."
    );
  };

  const handleReset = () => {
    setDest("");
    setTxHash(null);
    setTxError(null);
    setSentAmount(null);
    setSentFeeEth(null);
    setSentFeeUsd(null);
    contract.refresh();
    goTo("wallet");
  };

  return (
    <>
      <div className="otg-bg-grad" aria-hidden="true" />
      <KeyholeWatermark />
      <div className="otg-dots" aria-hidden="true" />

      {wallet.isWrongNetwork && (
        <div className="otg-wrong-net">
          Wrong network. Switch to{" "}
          {NETWORK === "mainnet" ? "Ethereum" : "Sepolia"} in your wallet.
        </div>
      )}

      <Header
        address={wallet.address}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      {screen === "hero" && <HeroScreen onConnect={handleConnect} />}

      {screen === "wallet" && (
        <WalletScreen
          balance={contract.balance}
          feeEth={contract.feeEth}
          feeUsd={contract.feeUsd}
          loading={contract.loading}
          onConfirm={handleConfirm}
          walletProvider={wallet.walletProvider}
        />
      )}

      {screen === "done" && (
        <DoneScreen
          amount={sentAmount}
          dest={dest}
          feeEth={sentFeeEth}
          feeUsd={sentFeeUsd}
          txHash={txHash}
          onReset={handleReset}
        />
      )}

      {txError && (
        <div className="otg-toast" onClick={() => setTxError(null)} role="alert">
          <div className="otg-toast-msg">{txError}</div>
          <div className="otg-toast-hint">Tap to dismiss</div>
        </div>
      )}

      {processing && <ProcessingOverlay onTimeout={handleTimeout} />}

      <div className="otg-net-badge" role="status">
        {NETWORK === "testnet" ? "Sepolia Testnet" : "Ethereum Mainnet"}
      </div>
    </>
  );
}
