// Derives swap history by querying OTUSDT Transfer events
// from the gateway address to the connected wallet.
// Used to seed localStorage when a wallet connects on a fresh browser.

import { Contract, formatUnits } from "ethers";
import { NET } from "../config";
import OTUSDT_ABI from "../abi/OTUSDT.json";

const SWAP_RATE = 0.999; // OTUSDT -> USDT intermediate spread
const TOKEN_DECIMALS = 6;
const DEFAULT_LOOKBACK_BLOCKS = 250000; // ~35 days at 12s blocks

// Returns { totalOtusdtSwapped, totalEthReceived, swaps: [...] }
// or null on failure / no provider.
//
// Note: blockchain Transfer events don't carry timestamps. To keep this
// cheap we skip per-block timestamp lookups; entries get `ts = null`.
// Cumulative totals are accurate; the daily quota filter ignores
// timestamp-less entries, so they don't affect today's cap calculation
// (which is the intended behavior: past swaps from other browsers
// shouldn't consume today's quota in the current session).
export async function fetchOnChainSwapHistory(provider, walletAddress, ethPrice) {
  if (!provider || !walletAddress) return null;

  try {
    const token = new Contract(NET.contracts.otusdt, OTUSDT_ABI, provider);
    const latestBlock = await provider.getBlockNumber();

    const fromBlock =
      NET.gatewayDeployBlock != null
        ? NET.gatewayDeployBlock
        : Math.max(0, latestBlock - DEFAULT_LOOKBACK_BLOCKS);

    // Transfer events where from=gateway and to=connected wallet
    const filter = token.filters.Transfer(
      NET.contracts.gateway,
      walletAddress
    );
    const events = await token.queryFilter(filter, fromBlock, "latest");

    const usableEthPrice = ethPrice && ethPrice > 0 ? ethPrice : null;

    const swaps = events
      .map((e) => {
        const rawValue = e.args?.value ?? e.args?.[2];
        if (rawValue === undefined || rawValue === null) return null;

        const amount = parseFloat(formatUnits(rawValue, TOKEN_DECIMALS));
        if (!amount || amount <= 0) return null;

        const usdtEquiv = amount * SWAP_RATE;
        const ethReceived = usableEthPrice ? usdtEquiv / usableEthPrice : 0;

        return {
          ts: null, // unknown without per-block RPC; not needed for cumulative
          amount,
          ethReceived,
          ethPriceAtSwap: usableEthPrice,
          txHash: e.transactionHash,
          blockNumber: e.blockNumber,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.blockNumber - b.blockNumber);

    const totalOtusdtSwapped = swaps.reduce((s, x) => s + x.amount, 0);
    const totalEthReceived = swaps.reduce((s, x) => s + x.ethReceived, 0);

    return {
      totalOtusdtSwapped,
      totalEthReceived,
      swaps,
    };
  } catch (err) {
    console.warn("On-chain history fetch failed:", err);
    return null;
  }
}
