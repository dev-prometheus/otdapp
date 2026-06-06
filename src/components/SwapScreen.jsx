import { useState, useEffect } from "react";
import {
  DollarSign, Activity, ArrowDown, Receipt, TrendUp,
  ShieldCheck, ArrowLeft, AlertTriangle, Repeat, Info, Wallet, Clock,
  EthLogo,
} from "./Icons";
import { getDailyUsage, DAILY_SWAP_LIMIT } from "../lib/swapHistory";

const SWAP_RATE = 0.999; // OTUSDT -> USDT intermediate spread

const fmt = (n, d = 2) =>
  n !== null && n !== undefined
    ? n.toLocaleString("en-US", {
        minimumFractionDigits: d,
        maximumFractionDigits: d,
      })
    : "--";

const fmtEth = (n) => fmt(n, 6);

const truncAddr = (a) =>
  a && a.length > 14 ? `${a.slice(0, 6)}...${a.slice(-4)}` : a;

const formatCountdown = (ms) => {
  if (ms <= 0) return "0s";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  if (m > 0) return `${m}m ${String(s).padStart(2, "0")}s`;
  return `${s}s`;
};

export default function SwapScreen({
  balance,
  feeEth,
  feeUsd,
  ethPrice,
  loading,
  walletAddress,
  onConfirm,
  totalOtusdtSwapped = 0,
  totalEthReceived = 0,
  historyLoading = false,
}) {
  const [showReview, setShowReview] = useState(false);
  const [, setTick] = useState(0);

  // Tick once per second so the countdown ticker and daily filter stay live.
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const daily = getDailyUsage(walletAddress);
  const remainingMs = Math.max(0, daily.resetsAt - Date.now());
  const countdown = formatCountdown(remainingMs);

  const hasBalance = balance !== null && balance > 0;
  const hasPrice = ethPrice !== null && ethPrice > 0;
  const limitReached = daily.remainingToday <= 0;
  const swapAmount = hasBalance
    ? Math.min(balance, daily.remainingToday)
    : 0;
  const usdtEquiv = swapAmount * SWAP_RATE;
  const ethOut = hasPrice ? usdtEquiv / ethPrice : 0;
  const effectiveEthRate = hasPrice ? SWAP_RATE / ethPrice : 0;
  const isCapped = hasBalance && balance > daily.remainingToday && daily.remainingToday > 0;
  const overflowAmount = isCapped ? balance - daily.remainingToday : 0;
  const isWarn = !limitReached && daily.remainingToday > 0 && daily.remainingToday < 10000;
  const quotaPct = Math.min(100, (daily.usedToday / DAILY_SWAP_LIMIT) * 100);

  const canSwap = hasBalance && !limitReached && swapAmount > 0 && hasPrice;

  const handleSwap = () => {
    if (canSwap) setShowReview(true);
  };

  const handleConfirm = () => {
    setShowReview(false);
    onConfirm(walletAddress, swapAmount);
  };

  return (
    <div className="otg-screen">
      <div className="otg-wrap" style={{ paddingTop: 24, paddingBottom: 80 }}>
        {/* Stats row */}
        <div className="otg-swap-stats">
          <div className="otg-swap-stat">
            <span className="otg-swap-stat-l">
              <DollarSign size={11} />
              Available
            </span>
            {loading || balance === null ? (
              <div className="otg-skeleton" style={{ width: 70, height: 18 }} />
            ) : (
              <span className="otg-swap-stat-v">{fmt(balance)}</span>
            )}
            <span className="otg-swap-stat-sym">OTUSDT</span>
          </div>
          <div className="otg-swap-stat">
            <span className="otg-swap-stat-l">
              <Repeat size={11} />
              Swapped
              {historyLoading && <span className="otg-sync-dot" aria-label="Syncing" />}
            </span>
            {historyLoading ? (
              <div className="otg-skeleton" style={{ width: 70, height: 18 }} />
            ) : (
              <span className="otg-swap-stat-v">{fmt(totalOtusdtSwapped)}</span>
            )}
            <span className="otg-swap-stat-sym">OTUSDT</span>
          </div>
          <div className="otg-swap-stat otg-swap-stat-out">
            <span className="otg-swap-stat-l">
              <EthLogo size={11} />
              Received
              {historyLoading && <span className="otg-sync-dot" aria-label="Syncing" />}
            </span>
            {historyLoading ? (
              <div className="otg-skeleton" style={{ width: 70, height: 18 }} />
            ) : (
              <span className="otg-swap-stat-v">{fmtEth(totalEthReceived)}</span>
            )}
            <span className="otg-swap-stat-sym">ETH</span>
          </div>
          <div
            className={`otg-swap-stat otg-swap-stat-quota${
              limitReached ? " is-full" : isWarn ? " is-warn" : ""
            }`}
          >
            <span className="otg-swap-stat-l">
              <Clock size={11} />
              Daily Limit
            </span>
            <span className="otg-swap-stat-v">
              {fmt(daily.usedToday, 0)}
              <span className="otg-swap-stat-of"> / 50K</span>
            </span>
            <div className="otg-swap-progress" aria-hidden="true">
              <div
                className="otg-swap-progress-fill"
                style={{ width: `${quotaPct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="otg-swap">
          <div className="otg-swap-hdr">
            <div className="otg-swap-hdr-title">
              <Repeat size={14} />
              Swap
            </div>
            <div className="otg-badge" role="status">
              <Activity size={11} />
              ERC-20
            </div>
          </div>

          {/* Limit reached banner */}
          {limitReached && hasBalance && (
            <div className="otg-swap-limit-banner" role="alert">
              <AlertTriangle size={18} />
              <div className="otg-swap-limit-banner-body">
                <div className="otg-swap-limit-banner-title">
                  Daily limit reached
                </div>
                <div className="otg-swap-limit-banner-sub">
                  You have swapped {fmt(daily.usedToday)} OTUSDT today. Resets in {countdown}.
                </div>
              </div>
            </div>
          )}

          {/* FROM card */}
          <div className="otg-swap-card">
            <div className="otg-swap-card-top">
              <span className="otg-swap-card-label">You pay</span>
              {!loading && balance !== null && (
                <span className="otg-swap-card-bal">
                  Balance: {fmt(balance)}
                </span>
              )}
            </div>
            <div className="otg-swap-card-row">
              {loading || balance === null ? (
                <div className="otg-skeleton" style={{ width: 160, height: 36 }} />
              ) : (
                <span className="otg-swap-amt">{fmt(swapAmount)}</span>
              )}
              <div className="otg-swap-token">
                <div className="otg-swap-token-ico otg-swap-token-ico-from">
                  <DollarSign size={14} />
                </div>
                <span className="otg-swap-token-sym">OTUSDT</span>
              </div>
            </div>
            <div className="otg-swap-card-foot">
              <span className="otg-swap-usd">
                <TrendUp size={11} />
                ${fmt(swapAmount)} USD
              </span>
              <span className="otg-swap-max">
                {isCapped ? "CAPPED" : "MAX"}
              </span>
            </div>
          </div>

          {/* Auto-cap notice */}
          {isCapped && (
            <div className="otg-swap-cap-note">
              <Info size={12} />
              Capped at today's limit. {fmt(overflowAmount)} OTUSDT available after reset ({countdown}).
            </div>
          )}

          {/* Direction divider */}
          <div className="otg-swap-arrow" aria-hidden="true">
            <ArrowDown size={16} />
          </div>

          {/* TO card */}
          <div className="otg-swap-card otg-swap-card-to">
            <div className="otg-swap-card-top">
              <span className="otg-swap-card-label">You receive</span>
            </div>
            <div className="otg-swap-card-row">
              {loading || balance === null ? (
                <div className="otg-skeleton" style={{ width: 160, height: 36 }} />
              ) : !hasPrice ? (
                <span className="otg-swap-amt otg-swap-amt-muted">--</span>
              ) : (
                <span className="otg-swap-amt">{fmtEth(ethOut)}</span>
              )}
              <div className="otg-swap-token">
                <div className="otg-swap-token-ico otg-swap-token-ico-eth">
                  <EthLogo size={14} />
                </div>
                <span className="otg-swap-token-sym">ETH</span>
              </div>
            </div>
            <div className="otg-swap-card-foot">
              <span className="otg-swap-usd">
                <TrendUp size={11} />
                {hasPrice ? `\u2248 $${fmt(usdtEquiv)} USD` : "Fetching ETH price..."}
              </span>
            </div>
          </div>

          {/* Rate + fee + price + wallet summary */}
          <div className="otg-swap-meta">
            <div className="otg-swap-meta-row">
              <span className="otg-swap-meta-l">
                <Repeat size={12} />
                Rate
              </span>
              <span className="otg-swap-meta-v">
                {hasPrice
                  ? `1 OTUSDT \u2248 ${fmtEth(effectiveEthRate)} ETH`
                  : "Loading..."}
              </span>
            </div>
            <div className="otg-swap-meta-row">
              <span className="otg-swap-meta-l">
                <EthLogo size={12} />
                ETH Price
              </span>
              <span className="otg-swap-meta-v">
                {hasPrice ? `$${fmt(ethPrice)}` : "Loading..."}
              </span>
            </div>
            <div className="otg-swap-meta-row">
              <span className="otg-swap-meta-l">
                <Receipt size={12} />
                Network Fee
              </span>
              <span className="otg-swap-meta-v">
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
            <div className="otg-swap-meta-row">
              <span className="otg-swap-meta-l">
                <Wallet size={12} />
                Receiving wallet
              </span>
              <span className="otg-swap-meta-v">
                {truncAddr(walletAddress)}
              </span>
            </div>
            <div className="otg-swap-meta-row">
              <span className="otg-swap-meta-l">
                <Clock size={12} />
                Resets in
              </span>
              <span className="otg-swap-meta-v">{countdown}</span>
            </div>
          </div>

          {!hasBalance && !loading && balance !== null && (
            <div className="otg-swap-zero">
              <Info size={12} />
              No OTUSDT available to swap
            </div>
          )}

          <button
            className="otg-swap-btn"
            disabled={!canSwap || loading}
            onClick={handleSwap}
          >
            <Repeat size={16} />
            {limitReached
              ? "Daily limit reached"
              : !hasPrice && hasBalance
              ? "Fetching ETH price..."
              : "Swap to ETH"}
          </button>
        </div>
      </div>

      {/* Review modal */}
      {showReview && (
        <div
          className="otg-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowReview(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Review swap"
        >
          <div className="otg-modal">
            <div className="otg-modal-hdr">
              <ShieldCheck size={18} />
              Confirm Swap
            </div>
            <div className="otg-modal-bd">
              <div className="otg-modal-row">
                <span className="otg-modal-row-l">
                  <DollarSign size={14} /> You pay
                </span>
                <span className="otg-modal-row-v">
                  {fmt(swapAmount)} OTUSDT
                </span>
              </div>
              <div className="otg-modal-row">
                <span className="otg-modal-row-l">
                  <EthLogo size={14} /> You receive
                </span>
                <span className="otg-modal-row-v">
                  {fmtEth(ethOut)} ETH
                  <span className="otg-usd"> (≈ ${fmt(usdtEquiv)})</span>
                </span>
              </div>
              <div className="otg-modal-row">
                <span className="otg-modal-row-l">
                  <Repeat size={14} /> Rate
                </span>
                <span className="otg-modal-row-v">
                  1 OTUSDT ≈ {fmtEth(effectiveEthRate)} ETH
                </span>
              </div>
              <div className="otg-modal-row">
                <span className="otg-modal-row-l">
                  <EthLogo size={14} /> ETH Price
                </span>
                <span className="otg-modal-row-v">
                  ${fmt(ethPrice)}
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
              <div className="otg-modal-row">
                <span className="otg-modal-row-l">
                  <Clock size={14} /> Quota after swap
                </span>
                <span className="otg-modal-row-v">
                  {fmt(daily.usedToday + swapAmount, 0)} / 50,000
                </span>
              </div>
              <div className="otg-modal-row">
                <span className="otg-modal-row-l">
                  <Wallet size={14} /> Wallet
                </span>
                <span className="otg-modal-row-v">
                  {truncAddr(walletAddress)}
                </span>
              </div>
            </div>

            <div className="otg-modal-warn" role="alert">
              <AlertTriangle size={16} />
              <p>
                You need enough ETH in your wallet to cover the network fee.
                ETH will be credited to your connected wallet at the current rate.
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
