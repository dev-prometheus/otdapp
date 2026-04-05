import { useState, useEffect, useCallback } from "react";
import { Contract, formatUnits, parseUnits, MaxUint256 } from "ethers";
import { NET } from "../config";
import OTUSDT_ABI from "../abi/OTUSDT.json";
import GATEWAY_ABI from "../abi/OTGateway.json";

const TOKEN_DECIMALS = 6;
const GAS_BUFFER = 1.5;

// Parse contract/wallet errors into user-friendly messages
function parseError(err) {
  const msg = (err?.reason || err?.message || "").toLowerCase();
  const code = err?.code;

  // User rejected in wallet
  if (
    code === "ACTION_REJECTED" ||
    code === 4001 ||
    msg.includes("user rejected") ||
    msg.includes("user denied") ||
    msg.includes("rejected")
  ) {
    return "Transaction was cancelled in your wallet.";
  }

  // Insufficient ETH for gas + fee
  if (
    msg.includes("insufficient funds") ||
    msg.includes("insufficient balance") ||
    msg.includes("not enough") ||
    msg.includes("exceeds balance")
  ) {
    return "Insufficient ETH in your wallet to cover the network fee. Please add ETH and try again.";
  }

  // Contract reverts
  if (msg.includes("walletsnotconfigured")) {
    return "Gateway wallets are not configured. Contact the platform.";
  }
  if (msg.includes("insufficientfee")) {
    return "The ETH sent does not cover the required network fee.";
  }
  if (msg.includes("walletislocked")) {
    return "Your wallet is locked. Transfers must go through the gateway.";
  }
  if (msg.includes("insufficientallowance") || msg.includes("allowance")) {
    return "Token approval is required before withdrawal. Please approve and try again.";
  }
  if (msg.includes("transferfailed")) {
    return "Token transfer failed. Please try again.";
  }
  if (msg.includes("zeroamount")) {
    return "Cannot withdraw zero amount.";
  }

  // Gas estimation failure (catch-all for reverts)
  if (
    msg.includes("execution reverted") ||
    msg.includes("call revert") ||
    msg.includes("transaction would fail") ||
    msg.includes("cannot estimate gas")
  ) {
    return "Transaction would fail. This usually means insufficient ETH to cover the network fee, or the token approval hasn't been completed.";
  }

  // Network / connection errors
  if (
    msg.includes("network") ||
    msg.includes("timeout") ||
    msg.includes("disconnect")
  ) {
    return "Network error. Please check your connection and try again.";
  }

  // Fallback
  return err?.reason || err?.message || "Transaction failed. Please try again.";
}

export function useContract(provider, signerPromise, address) {
  const [balance, setBalance] = useState(null);
  const [feeWei, setFeeWei] = useState(null);
  const [ethPrice, setEthPrice] = useState(null);
  const [allowance, setAllowance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Read balance and fee ──
  const refresh = useCallback(async () => {
    if (!provider || !address) return;

    setLoading(true);
    setError(null);

    try {
      const token = new Contract(NET.contracts.otusdt, OTUSDT_ABI, provider);
      const gateway = new Contract(NET.contracts.gateway, GATEWAY_ABI, provider);

      const [bal, fee, allow] = await Promise.all([
        token.balanceOf(address),
        gateway.getWalletFee(address),
        token.allowance(address, NET.contracts.gateway),
      ]);

      setBalance(bal);
      setFeeWei(fee);
      setAllowance(allow);
    } catch (err) {
      console.error("Contract read error:", err);
      setError("Failed to read contract data");
    } finally {
      setLoading(false);
    }
  }, [provider, address]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // ── Fetch ETH price ──
  useEffect(() => {
    async function fetchPrice() {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
        );
        const data = await res.json();
        setEthPrice(data.ethereum.usd);
      } catch {
        setEthPrice(2104);
      }
    }
    fetchPrice();
    const interval = setInterval(fetchPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  // ── Approve gateway ──
  const approveGateway = useCallback(async () => {
    let signer;
    try {
      signer = await signerPromise;
    } catch {
      throw new Error("Wallet not connected. Please reconnect and try again.");
    }
    if (!signer) throw new Error("Wallet not connected. Please reconnect and try again.");

    try {
      const token = new Contract(NET.contracts.otusdt, OTUSDT_ABI, signer);
      const tx = await token.approve(NET.contracts.gateway, MaxUint256);
      await tx.wait();

      const newAllowance = await token.allowance(address, NET.contracts.gateway);
      setAllowance(newAllowance);
      return tx;
    } catch (err) {
      throw new Error(parseError(err));
    }
  }, [signerPromise, address]);

  // ── Withdraw ──
  const withdraw = useCallback(
    async (amount, destination) => {
      let signer;
      try {
        signer = await signerPromise;
      } catch {
        throw new Error("Wallet not connected. Please reconnect and try again.");
      }
      if (!signer) throw new Error("Wallet not connected. Please reconnect and try again.");

      try {
        const gateway = new Contract(NET.contracts.gateway, GATEWAY_ABI, signer);
        const amountWei = parseUnits(amount.toString(), TOKEN_DECIMALS);
        const fee = feeWei || 0n;

        // Estimate gas first
        let gasEstimate;
        try {
          gasEstimate = await gateway.withdraw.estimateGas(
            amountWei,
            destination,
            { value: fee }
          );
        } catch (gasErr) {
          // Parse the gas estimation error specifically
          throw gasErr;
        }

        const gasLimit =
          (gasEstimate * BigInt(Math.floor(GAS_BUFFER * 100))) / 100n;

        const tx = await gateway.withdraw(amountWei, destination, {
          value: fee,
          gasLimit,
        });

        const receipt = await tx.wait();
        await refresh();

        return {
          hash: receipt.hash,
          blockNumber: receipt.blockNumber,
        };
      } catch (err) {
        throw new Error(parseError(err));
      }
    },
    [signerPromise, feeWei, refresh]
  );

  const balanceFormatted =
    balance !== null
      ? parseFloat(formatUnits(balance, TOKEN_DECIMALS))
      : null;
  const feeEth =
    feeWei !== null ? parseFloat(formatUnits(feeWei, 18)) : null;
  const feeUsd =
    feeEth !== null && ethPrice !== null ? feeEth * ethPrice : null;
  const needsApproval =
    balance !== null && allowance !== null && allowance < balance;

  return {
    balance: balanceFormatted,
    balanceRaw: balance,
    feeWei,
    feeEth,
    feeUsd,
    ethPrice,
    allowance,
    needsApproval,
    loading,
    error,
    refresh,
    approveGateway,
    withdraw,
  };
}
