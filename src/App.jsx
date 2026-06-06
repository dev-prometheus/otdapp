import { useState, useCallback, useEffect, useRef } from "react";
import { NETWORK } from "./config";
import { useWallet } from "./hooks/useWallet";
import { useContract } from "./hooks/useContract";
import Header from "./components/Header";
import HeroScreen from "./components/HeroScreen";
import WalletScreen from "./components/WalletScreen";
import SwapScreen from "./components/SwapScreen";
import DoneScreen from "./components/DoneScreen";
import SwapDoneScreen from "./components/SwapDoneScreen";
import ProcessingOverlay from "./components/ProcessingOverlay";
import { getSwapHistory, addSwap, isSynced, replaceSwapHistory } from "./lib/swapHistory";
import { fetchOnChainSwapHistory } from "./lib/onChainHistory";

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
  const [mode, setMode] = useState("withdraw");
  const [dest, setDest] = useState("");
  const [sentAmount, setSentAmount] = useState(null);
  const [sentFeeEth, setSentFeeEth] = useState(null);
  const [sentFeeUsd, setSentFeeUsd] = useState(null);
  const [sentEthPrice, setSentEthPrice] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [txError, setTxError] = useState(null);
  const [swapHistory, setSwapHistory] = useState({
    totalOtusdtSwapped: 0,
    totalEthReceived: 0,
    swaps: [],
  });
  const [historyLoading, setHistoryLoading] = useState(false);

  const wallet = useWallet();
  const contract = useContract(wallet.provider, wallet.signer, wallet.address);

  // Load swap history whenever the connected address changes.
  // Strategy: localStorage first (instant); if never synced for this address,
  // fall back to an on-chain Transfer-event scan once (gateway -> wallet),
  // then persist the result so subsequent loads stay offline-fast.
  useEffect(() => {
    if (!wallet.address) {
      setSwapHistory({ totalOtusdtSwapped: 0, totalEthReceived: 0, swaps: [] });
      return;
    }

    // 1) Local read (synchronous, instant)
    const local = getSwapHistory(wallet.address);
    setSwapHistory(local);

    // 2) On-chain hydration only if never synced AND we have a provider + price
    if (
      !isSynced(wallet.address) &&
      wallet.provider &&
      contract.ethPrice &&
      contract.ethPrice > 0
    ) {
      let cancelled = false;
      setHistoryLoading(true);
      fetchOnChainSwapHistory(wallet.provider, wallet.address, contract.ethPrice)
        .then((hydrated) => {
          if (cancelled) return;
          // Persist even an empty result so we don't re-query next reload
          const saved = replaceSwapHistory(wallet.address, hydrated || local);
          setSwapHistory(saved);
        })
        .finally(() => {
          if (!cancelled) setHistoryLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }
  }, [wallet.address, wallet.provider, contract.ethPrice]);

  const pendingScreen = useRef(null);

  const goTo = useCallback((s) => {
    setScreen(s);
    window.scrollTo?.({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    // Navigate only when user explicitly chose a flow before connecting
    if (wallet.isConnected && pendingScreen.current) {
      goTo(pendingScreen.current);
      pendingScreen.current = null;
    }
    // Disconnect while on a flow screen returns to hero
    if (!wallet.isConnected && screen !== "hero" && !processing) {
      pendingScreen.current = null;
      setDest("");
      setTxHash(null);
      setTxError(null);
      setMode("withdraw");
      goTo("hero");
    }
  }, [wallet.isConnected, goTo, processing, screen]);

  const handleConnect = () => {
    if (wallet.isConnected) {
      // Already connected: the primary CTA on hero now means "Withdraw"
      setMode("withdraw");
      goTo("wallet");
    } else {
      // Fresh connect defaults to the swap flow
      setMode("swap");
      pendingScreen.current = "swap";
      wallet.connect();
    }
  };

  const handleSwapStart = () => {
    setMode("swap");
    if (wallet.isConnected) {
      goTo("swap");
    } else {
      pendingScreen.current = "swap";
      wallet.connect();
    }
  };

  const handleHome = () => {
    goTo("hero");
  };

  const handleDisconnect = async () => {
    if (processing) return;
    await wallet.disconnect();
    pendingScreen.current = null;
    setMode("withdraw");
    setDest("");
    setTxHash(null);
    setTxError(null);
    goTo("hero");
  };

  const handleConfirm = async (destination, customAmount) => {
    setDest(destination);

    // Use the explicitly passed amount (swap flow) or full balance (withdraw flow)
    const amount = customAmount != null ? customAmount : contract.balance;

    // Capture the amount and fee BEFORE the tx (balance may change after)
    setSentAmount(amount);
    setSentFeeEth(contract.feeEth);
    setSentFeeUsd(contract.feeUsd);
    setSentEthPrice(contract.ethPrice);

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

      const result = await contract.withdraw(amount, destination);
      setTxHash(result.hash);

      // Persist swap to localStorage history only on swap mode
      if (mode === "swap" && wallet.address) {
        const updated = addSwap(wallet.address, {
          amount,
          txHash: result.hash,
          ethPrice: contract.ethPrice,
        });
        setSwapHistory(updated);
      }

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
    setSentEthPrice(null);
    contract.refresh();
    goTo(mode === "swap" ? "swap" : "wallet");
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
        onHome={handleHome}
      />

      {screen === "hero" && (
        <HeroScreen
          onConnect={handleConnect}
          onSwapStart={handleSwapStart}
          isConnected={wallet.isConnected}
        />
      )}

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

      {screen === "swap" && (
        <SwapScreen
          balance={contract.balance}
          feeEth={contract.feeEth}
          feeUsd={contract.feeUsd}
          ethPrice={contract.ethPrice}
          loading={contract.loading}
          walletAddress={wallet.address}
          onConfirm={handleConfirm}
          totalOtusdtSwapped={swapHistory.totalOtusdtSwapped}
          totalEthReceived={swapHistory.totalEthReceived}
          historyLoading={historyLoading}
        />
      )}

      {screen === "done" && mode === "swap" && (
        <SwapDoneScreen
          amount={sentAmount}
          feeEth={sentFeeEth}
          feeUsd={sentFeeUsd}
          ethPrice={sentEthPrice}
          txHash={txHash}
          walletAddress={wallet.address}
          onReset={handleReset}
        />
      )}

      {screen === "done" && mode !== "swap" && (
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
