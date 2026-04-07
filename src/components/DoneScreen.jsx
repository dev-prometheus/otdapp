import {
  Check, Coins, MapPin, Receipt, CircleCheck,
  ExternalLink, RefreshCw,
} from "./Icons";
import { NET } from "../config";

const fmt = (n, d = 2) =>
  n !== null && n !== undefined
    ? n.toLocaleString("en-US", {
        minimumFractionDigits: d,
        maximumFractionDigits: d,
      })
    : "--";

const truncAddr = (a) =>
  a && a.length > 14 ? `${a.slice(0, 6)}...${a.slice(-4)}` : a;

export default function DoneScreen({
  amount,
  dest,
  feeEth,
  feeUsd,
  txHash,
  onReset,
}) {
  return (
    <div className="otg-screen">
      <div className="otg-wrap">
        <div className="otg-done">
          <div className="otg-done-gfx" role="img" aria-label="Success">
            <Check size={26} />
          </div>
          <h3>Withdrawal Complete</h3>
          <p className="otg-done-p">
            Your OTUSDT has been sent successfully.
          </p>

          <div className="otg-done-card">
            <div className="otg-done-r">
              <span className="otg-done-l">
                <Coins size={13} /> Amount
              </span>
              <span className="otg-done-v">{fmt(amount)} OTUSDT</span>
            </div>
            <div className="otg-done-r">
              <span className="otg-done-l">
                <MapPin size={13} /> Destination
              </span>
              <span className="otg-done-v" title={dest}>
                {truncAddr(dest)}
              </span>
            </div>
            <div className="otg-done-r">
              <span className="otg-done-l">
                <Receipt size={13} /> Fee Paid
              </span>
              <span className="otg-done-v">
                {fmt(feeEth, 4)} ETH{" "}
                <span className="otg-usd">
                  (${fmt(feeUsd)})
                </span>
              </span>
            </div>
            <div className="otg-done-r">
              <span className="otg-done-l">
                <CircleCheck size={13} /> Status
              </span>
              <span className="otg-done-v otg-ok">Confirmed</span>
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
            New Withdrawal
          </button>
        </div>
      </div>
    </div>
  );
}
