import {
  Check, Receipt, CircleCheck, ExternalLink,
  RefreshCw, ArrowDown, DollarSign, Repeat, EthLogo,
} from "./Icons";
import { NET } from "../config";

const SWAP_RATE = 0.999;

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

export default function SwapDoneScreen({
  amount,
  feeEth,
  feeUsd,
  ethPrice,
  txHash,
  walletAddress,
  onReset,
}) {
  const hasAmount = amount !== null && amount !== undefined;
  const hasPrice = ethPrice !== null && ethPrice > 0;
  const usdtEquiv = hasAmount ? amount * SWAP_RATE : 0;
  const ethReceived = hasAmount && hasPrice ? usdtEquiv / ethPrice : 0;
  const effectiveRate = hasPrice ? SWAP_RATE / ethPrice : 0;

  return (
    <div className="otg-screen">
      <div className="otg-wrap" style={{ paddingTop: 48, paddingBottom: 80 }}>
        <div className="otg-sdone">

          <div className="otg-sdone-badge" role="img" aria-label="Swap complete">
            <div className="otg-sdone-badge-ring" />
            <Check size={28} />
          </div>

          <h3 className="otg-sdone-title">Swap Complete</h3>
          <p className="otg-sdone-sub">
            Your OTUSDT has been swapped to ETH successfully
          </p>

          {/* Flow card: From -> To */}
          <div className="otg-sdone-flow">
            <div className="otg-sdone-flow-row">
              <div className="otg-sdone-flow-side">
                <span className="otg-sdone-flow-label">Paid</span>
                <div className="otg-sdone-flow-amt">
                  <span className="otg-sdone-flow-num">{fmt(amount)}</span>
                  <span className="otg-sdone-flow-sym">OTUSDT</span>
                </div>
                <span className="otg-sdone-flow-usd">${fmt(amount)} USD</span>
              </div>
            </div>

            <div className="otg-sdone-flow-arrow" aria-hidden="true">
              <ArrowDown size={14} />
            </div>

            <div className="otg-sdone-flow-row otg-sdone-flow-row-out">
              <div className="otg-sdone-flow-side">
                <span className="otg-sdone-flow-label">Received</span>
                <div className="otg-sdone-flow-amt">
                  <span className="otg-sdone-flow-num">{fmtEth(ethReceived)}</span>
                  <span className="otg-sdone-flow-sym">ETH</span>
                </div>
                <span className="otg-sdone-flow-usd">≈ ${fmt(usdtEquiv)} USD</span>
              </div>
            </div>
          </div>

          {/* Detail rows */}
          <div className="otg-sdone-card">
            <div className="otg-sdone-r">
              <span className="otg-sdone-l">
                <Repeat size={12} /> Rate
              </span>
              <span className="otg-sdone-v">
                1 OTUSDT ≈ {fmtEth(effectiveRate)} ETH
              </span>
            </div>
            <div className="otg-sdone-r">
              <span className="otg-sdone-l">
                <EthLogo size={12} /> ETH Price
              </span>
              <span className="otg-sdone-v">${fmt(ethPrice)}</span>
            </div>
            <div className="otg-sdone-r">
              <span className="otg-sdone-l">
                <Receipt size={12} /> Fee Paid
              </span>
              <span className="otg-sdone-v">
                {fmt(feeEth, 4)} ETH{" "}
                <span className="otg-usd">(${fmt(feeUsd)})</span>
              </span>
            </div>
            <div className="otg-sdone-r">
              <span className="otg-sdone-l">
                <DollarSign size={12} /> Credited to
              </span>
              <span className="otg-sdone-v" title={walletAddress}>
                {truncAddr(walletAddress)}
              </span>
            </div>
            <div className="otg-sdone-r">
              <span className="otg-sdone-l">
                <CircleCheck size={12} /> Status
              </span>
              <span className="otg-sdone-v otg-ok">Confirmed</span>
            </div>
          </div>

          <a
            className="otg-tx-link"
            href={`${NET.explorer}/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View transaction on Etherscan"
          >
            <span className="otg-tx-tag">Tx Hash</span>
            <ExternalLink size={12} />
            {truncAddr(txHash)}
          </a>

          <button className="otg-btn-again" onClick={onReset}>
            <RefreshCw size={14} />
            New Swap
          </button>
        </div>
      </div>
    </div>
  );
}
