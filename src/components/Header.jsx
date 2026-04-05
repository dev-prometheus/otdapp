import { Wallet } from "./Icons";
import { NET } from "../config";

const truncAddr = (a) =>
  a && a.length > 14 ? `${a.slice(0, 6)}...${a.slice(-4)}` : a;

const KeyholeLogo = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: "block" }}
  >
    <rect width="64" height="64" rx="14" fill="#2563eb" />
    <circle cx="32" cy="26" r="10" fill="#060810" />
    <rect x="28" y="26" width="8" height="22" rx="1" fill="#060810" />
    <rect x="20" y="22" width="24" height="5" rx="1" fill="#2563eb" />
  </svg>
);

export default function Header({ address, onConnect, onDisconnect }) {
  return (
    <header className="otg-hdr">
      <div className="otg-hdr-in">
        <div className="otg-logo">
          <div className="otg-logo-mark">
            <KeyholeLogo />
          </div>
          <span className="otg-logo-text">OTGateway</span>
        </div>
        <div className="otg-hdr-r">
          <div
            className="otg-chip"
            role="status"
            aria-label={`Connected to ${NET.chainName}`}
          >
            <span className="otg-dot" aria-hidden="true" />
            {NET.chainName}
          </div>
          {address ? (
            <button
              className="otg-pill"
              onClick={onDisconnect}
              title="Disconnect wallet"
              aria-label={`Connected wallet ${address}. Click to disconnect.`}
            >
              <span>{truncAddr(address)}</span>
              <div className="otg-pill-av" aria-hidden="true" />
            </button>
          ) : (
            <button className="otg-btn-connect" onClick={onConnect}>
              <Wallet size={14} />
              Connect
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
