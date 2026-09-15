/**
 * Refreshes budget figures in the browser.
 *
 * The page is rendered with the rates from its last build, which can be weeks
 * old on a cached page. This pulls today's table once, caches it for the day
 * in sessionStorage, and rewrites the figures. Any failure leaves the
 * build-time numbers in place.
 */
const RATES_URL = 'https://open.er-api.com/v6/latest/USD';
const CACHE_KEY = 'tiw:rates';

interface Payload {
  day: string;
  rates: Record<string, number>;
  updated: string;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function readCache(): Payload | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Payload;
    return parsed?.day === today() ? parsed : null;
  } catch {
    return null;
  }
}

async function load(): Promise<Payload | null> {
  const cached = readCache();
  if (cached) return cached;
  try {
    const response = await fetch(RATES_URL);
    if (!response.ok) return null;
    const data = await response.json();
    if (data?.result !== 'success' || !data?.rates?.USD) return null;
    const payload: Payload = {
      day: today(),
      rates: data.rates,
      updated: data.time_last_update_utc ?? '',
    };
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    } catch {
      /* private mode — fine, we just refetch next page */
    }
    return payload;
  } catch {
    return null;
  }
}

function money(amount: number, code: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      maximumFractionDigits: amount >= 100 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${Math.round(amount).toLocaleString('en-US')} ${code}`;
  }
}

export async function refreshBudgets(): Promise<void> {
  const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-budget]'));
  if (targets.length === 0) return;

  const payload = await load();
  if (!payload) return;
  const { rates } = payload;

  for (const el of targets) {
    const amount = Number(el.dataset.amount);
    const from = el.dataset.from ?? 'USD';
    const local = el.dataset.local ?? 'USD';
    if (!Number.isFinite(amount) || !rates[from]) continue;

    const usd = (amount / rates[from]) * rates.USD;
    const localValue = rates[local] ? (amount / rates[from]) * rates[local] : null;

    el.textContent =
      el.dataset.variant === 'full' && localValue !== null
        ? `${money(usd, 'USD')} · ${money(localValue, local)}`
        : money(usd, 'USD');
    // Lets the homepage re-sort once real numbers are in.
    el.dataset.usd = String(Math.round(usd));
  }

  const stamp = document.querySelector<HTMLElement>('[data-rate-date]');
  if (stamp && payload.updated) {
    const parsed = new Date(payload.updated);
    if (!Number.isNaN(parsed.valueOf())) {
      stamp.textContent = parsed.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
  }

  document.dispatchEvent(new CustomEvent('rates:updated'));
}
