import { useState } from "react";
import { NET } from "../config";
import {
  DollarSign, Activity, ArrowUpRight, Coins,
  Info, Send, MapPin, Receipt, TrendUp,
  ShieldCheck, ArrowLeft, AlertTriangle, Copy, Check, Plus,
} from "./Icons";

const fmt = (n, d = 2) =>
  n.toLocaleString("en-US", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });

const truncAddr = (a) =>
  a && a.length > 14 ? `${a.slice(0, 6)}...${a.slice(-4)}` : a;

const isValidEthAddress = (addr) => /^0x[a-fA-F0-9]{40}$/.test(addr);

export default function WalletScreen({ balance, feeEth, feeUsd, loading, onConfirm, walletProvider }) {
  const [dest, setDest] = useState("");
  const [touched, setTouched] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [added, setAdded] = useState(false);

  const trimmed = dest.trim();
  const valid = isValidEthAddress(trimmed);
  const showError = touched && trimmed.length > 0 && !valid;
  const showValid = trimmed.length > 0 && valid;
  const hasBalance = balance !== null && balance > 0;

  const handleWithdraw = () => {
    setTouched(true);
    if (valid && hasBalance) {
      setShowReview(true);
    }
  };

  const handleConfirm = () => {
    setShowReview(false);
    onConfirm(trimmed);
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(trimmed);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleAddToWallet = async () => {
    if (!walletProvider) return;
    try {
      await walletProvider.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: NET.contracts.otusdt,
            symbol: "OTUSDT",
            decimals: 6,
            image: `${window.location.origin}/otusdt-logo.png`, 
          },
        },
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch {
      // User rejected or wallet does not support wallet_watchAsset — fail silently
    }
  };

  return (
    <div className="otg-screen">
      <div className="otg-wrap" style={{ paddingTop: 24, paddingBottom: 80 }}>
        {/* Balance */}
        <div className="otg-bal">
          <div className="otg-bal-top">
            <div className="otg-bal-token">
              <div className="otg-bal-ico">
                <DollarSign size={20} />
              </div>
              <div>
                <div className="otg-bal-tk">OTUSDT</div>
                <div className="otg-bal-sub">ERC-20 Stablecoin</div>
              </div>
            </div>
            <div className="otg-badge" role="status">
              <Activity size={11} />
              ERC-20
            </div>
          </div>
          {loading || balance === null ? (
            <div className="otg-skeleton" style={{ width: 180, height: 32, marginBottom: 8 }} />
          ) : (
            <div className="otg-bal-num" aria-label={`Balance: ${fmt(balance)} OTUSDT`}>
              {fmt(balance)}
            </div>
          )}
          {loading || balance === null ? (
            <div className="otg-skeleton" style={{ width: 120, height: 16 }} />
          ) : (
            <div className="otg-bal-fiat">
              <TrendUp size={13} />
              ${fmt(balance)} USD
            </div>
          )}
          {!loading && balance !== null && walletProvider && (
            <button
              type="button"
              className={`otg-add-wallet${added ? " is-added" : ""}`}
              onClick={handleAddToWallet}
              disabled={added}
              aria-label={added ? "OTUSDT added to wallet" : "Add OTUSDT to your wallet"}
            >
              {added ? <Check size={13} /> : <Plus size={13} />}
              {added ? "Added to wallet" : "Add OTUSDT to wallet"}
            </button>
          )}
        </div>

        {/* Form */}
        <div className="otg-form">
          <div className="otg-form-top">
            <ArrowUpRight size={14} />
            Withdraw
          </div>
          <div className="otg-form-bd">
            {!hasBalance && !loading && balance !== null ? (
              <div className="otg-zero-note">
                No OTUSDT available to withdraw
              </div>
            ) : (
              <>
                <div className="otg-fld-label">
                  <Coins size={13} />
                  Amount
                </div>
                <div className="otg-amt-box">
                  <span className="otg-amt-v">
                    {balance !== null ? fmt(balance) : "--"}
                  </span>
                  <span className="otg-amt-unit">OTUSDT</span>
                </div>
                <div className="otg-amt-hint">
                  <Info size={12} />
                  Full balance withdrawal only
                </div>

                <div className="otg-fld">
                  <div className="otg-fld-label">
                    <Send size={13} />
                    Destination Address
                  </div>
                  <div
                    className={`otg-inp-box${showError ? " otg-inp-error" : ""}${showValid ? " otg-inp-valid" : ""}`}
                  >
                    <span className="otg-inp-ico">
                      <MapPin size={16} />
                    </span>
                    <input
                      type="text"
                      className="otg-inp"
                      placeholder="0x..."
                      value={dest}
                      onChange={(e) => {
                        setDest(e.target.value);
                        if (!touched && e.target.value.length > 2) setTouched(true);
                      }}
                      onBlur={() => setTouched(true)}
                      autoComplete="off"
                      spellCheck="false"
                      aria-label="Destination wallet address"
                      aria-invalid={showError}
                    />
                    {showValid && (
                      <span className="otg-inp-status" style={{ color: "var(--ok)" }}>
                        <Check size={16} />
                      </span>
                    )}
                  </div>
                  {showError ? (
                    <div className="otg-fld-error">
                      <Info size={11} />
                      Enter a valid Ethereum address (0x + 40 hex characters)
                    </div>
                  ) : (
                    <div className="otg-fld-note">
                      <Info size={11} />
                      Wallet address or exchange deposit address
                    </div>
                  )}
                </div>

                <div className="otg-fee-row">
                  <span className="otg-fee-l">
                    <Receipt size={14} />
                    Network Fee
                  </span>
                  <span className="otg-fee-v">
                    {feeEth !== null ? (
                      <>
                        {fmt(feeEth, 4)} ETH{" "}
                        <span className="otg-usd">
                          (${feeUsd !== null ? fmt(feeUsd) : "--"})
                        </span>
                      </>
                    ) : (
                      <span className="otg-usd">Loading...</span>
                    )}
                  </span>
                </div>

                <button
                  className="otg-btn-sub"
                  disabled={!valid || loading || !hasBalance}
                  onClick={handleWithdraw}
                  aria-label={valid ? "Review withdrawal" : "Enter a valid destination address"}
                >
                  <ArrowUpRight size={16} />
                  Withdraw
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReview && (
        <div
          className="otg-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowReview(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Review withdrawal"
        >
          <div className="otg-modal">
            <div className="otg-modal-hdr">
              <ShieldCheck size={18} />
              Confirm Withdrawal
            </div>
            <div className="otg-modal-bd">
              <div className="otg-modal-row">
                <span className="otg-modal-row-l">
                  <Coins size={14} /> Sending
                </span>
                <span className="otg-modal-row-v">
                  {fmt(balance)} OTUSDT
                </span>
              </div>
              <div className="otg-modal-row">
                <span className="otg-modal-row-l">
                  <MapPin size={14} /> Destination
                </span>
                <span className="otg-modal-row-v">
                  <span title={trimmed}>{truncAddr(trimmed)}</span>
                  <button
                    className="otg-copy-btn"
                    onClick={copyAddress}
                    aria-label={copied ? "Copied" : "Copy address"}
                    title={copied ? "Copied" : "Copy address"}
                    style={{ width: 24, height: 24 }}
                  >
                    {copied ? <Check size={11} /> : <Copy size={11} />}
                  </button>
                </span>
              </div>
              <div className="otg-modal-row">
                <span className="otg-modal-row-l">
                  <Receipt size={14} /> Network Fee
                </span>
                <span className="otg-modal-row-v">
                  {fmt(feeEth, 4)} ETH{" "}
                  <span className="otg-usd">(${fmt(feeUsd)})</span>
                </span>
              </div>
            </div>

            <div className="otg-modal-warn" role="alert">
              <AlertTriangle size={16} />
              <p>
                You need enough ETH in your wallet to cover the network fee.
                Double check the destination address before confirming.
              </p>
            </div>

            <div className="otg-modal-actions">
              <button
                className="otg-modal-btn-back"
                onClick={() => setShowReview(false)}
              >
                <ArrowLeft size={14} />
                Back
              </button>
              <button
                className="otg-modal-btn-confirm"
                onClick={handleConfirm}
              >
                <ShieldCheck size={15} />
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
