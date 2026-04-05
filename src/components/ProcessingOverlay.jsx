import { useState, useEffect } from "react";

const TIMEOUT_SECONDS = 45;

export default function ProcessingOverlay({ onTimeout }) {
  const [elapsed, setElapsed] = useState(0);
  const timedOut = elapsed >= TIMEOUT_SECONDS;

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="otg-overlay" role="alert" aria-live="assertive">
      {timedOut ? (
        <>
          <div className="otg-ov-warn-ico" aria-hidden="true">!</div>
          <div className="otg-ov-h">Taking Longer Than Expected</div>
          <div className="otg-ov-p">
            The transaction may still be processing. Check your wallet for
            status.
          </div>
          <button className="otg-ov-dismiss" onClick={onTimeout}>
            Dismiss
          </button>
        </>
      ) : (
        <>
          <div className="otg-spinner" aria-hidden="true" />
          <div className="otg-ov-h">Processing Withdrawal</div>
          <div className="otg-ov-p">
            Waiting for blockchain confirmation...
          </div>
        </>
      )}
    </div>
  );
}
