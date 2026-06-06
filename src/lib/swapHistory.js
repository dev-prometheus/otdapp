// Per-wallet swap history persisted to localStorage.
// Demo-grade: zero backend, lives in the browser only.

const SWAP_RATE = 0.999; // OTUSDT -> USDT intermediate spread
const KEY_PREFIX = "otusdt_swap_history_";

export const DAILY_SWAP_LIMIT = 50000;

const empty = () => ({
  totalOtusdtSwapped: 0,
  totalEthReceived: 0,
  swaps: [],
  _synced: null,
});

const keyFor = (address) =>
  address ? `${KEY_PREFIX}${address.toLowerCase()}` : null;

export function getSwapHistory(address) {
  const key = keyFor(address);
  if (!key) return empty();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return empty();
    const parsed = JSON.parse(raw);
    return {
      totalOtusdtSwapped: Number(parsed.totalOtusdtSwapped) || 0,
      totalEthReceived: Number(parsed.totalEthReceived) || 0,
      swaps: Array.isArray(parsed.swaps) ? parsed.swaps : [],
      _synced: parsed._synced || null,
    };
  } catch {
    return empty();
  }
}

// Returns true if localStorage has already been synced from on-chain
// (or has local swap entries). When false, App should fetch on-chain.
export function isSynced(address) {
  const key = keyFor(address);
  if (!key) return false;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(parsed._synced) || (parsed.swaps && parsed.swaps.length > 0);
  } catch {
    return false;
  }
}

// Wholesale replace the history for an address. Used after on-chain hydration.
// Stamps _synced with Date.now() so we don't refetch on subsequent loads.
export function replaceSwapHistory(address, history) {
  const key = keyFor(address);
  if (!key) return history || empty();

  const next = {
    totalOtusdtSwapped: Number(history?.totalOtusdtSwapped) || 0,
    totalEthReceived: Number(history?.totalEthReceived) || 0,
    swaps: Array.isArray(history?.swaps) ? history.swaps : [],
    _synced: Date.now(),
  };

  try {
    localStorage.setItem(key, JSON.stringify(next));
  } catch {}

  return next;
}

// Add a swap entry. ethPrice (USD per ETH) is required to compute the
// ETH received at the time of the swap so cumulative totals stay accurate
// even when ETH price moves later.
export function addSwap(address, { amount, txHash, ethPrice }) {
  const key = keyFor(address);
  if (!key || !amount || amount <= 0) return getSwapHistory(address);

  const current = getSwapHistory(address);
  const usdtEquiv = amount * SWAP_RATE;
  const ethReceived =
    ethPrice && ethPrice > 0 ? usdtEquiv / ethPrice : 0;

  const next = {
    totalOtusdtSwapped: current.totalOtusdtSwapped + amount,
    totalEthReceived: current.totalEthReceived + ethReceived,
    swaps: [
      ...current.swaps,
      {
        ts: Date.now(),
        amount,
        ethReceived,
        ethPriceAtSwap: ethPrice || null,
        txHash: txHash || null,
      },
    ],
    _synced: current._synced || Date.now(),
  };

  try {
    localStorage.setItem(key, JSON.stringify(next));
  } catch {
    // Quota or disabled storage. Return computed totals anyway.
  }

  return next;
}

export function clearSwapHistory(address) {
  const key = keyFor(address);
  if (!key) return;
  try {
    localStorage.removeItem(key);
  } catch {}
}

// Returns daily quota usage based on UTC midnight reset.
// usedToday = sum of swap amounts since 00:00 UTC today
// remainingToday = max(0, DAILY_SWAP_LIMIT - usedToday)
// resetsAt = timestamp of next 00:00 UTC (when quota refills)
export function getDailyUsage(address) {
  const history = getSwapHistory(address);
  const now = new Date();
  const utcDayStart = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  );
  const utcDayEnd = utcDayStart + 24 * 60 * 60 * 1000;

  const usedToday = history.swaps
    .filter((s) => s.ts >= utcDayStart && s.ts < utcDayEnd)
    .reduce((sum, s) => sum + (Number(s.amount) || 0), 0);

  return {
    usedToday,
    remainingToday: Math.max(0, DAILY_SWAP_LIMIT - usedToday),
    resetsAt: utcDayEnd,
  };
}
