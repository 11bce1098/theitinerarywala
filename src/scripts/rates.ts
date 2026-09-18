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
const CURRENCY_KEY = 'tiw:currency';
const DISPLAY_CURRENCIES = ['INR', 'AED', 'USD'] as const;
const DEFAULT_CURRENCY = DISPLAY_CURRENCIES[0];

/** The reader's chosen display currency, or the default. */
export function currentCurrency(): string {
  try {
    const saved = localStorage.getItem(CURRENCY_KEY);
    if (saved && (DISPLAY_CURRENCIES as readonly string[]).includes(saved)) return saved;
  } catch {
    /* private mode — fall through to the default */
  }
  return DEFAULT_CURRENCY;
}

export function setCurrency(code: string): void {
  try {
    localStorage.setItem(CURRENCY_KEY, code);
  } catch {
    /* not fatal: the page still re-renders, it just will not be remembered */
  }
}

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

  const display = currentCurrency();

  for (const el of targets) {
    const amount = Number(el.dataset.amount);
    const from = el.dataset.from ?? 'USD';
    const local = el.dataset.local ?? 'USD';
    if (!Number.isFinite(amount) || !rates[from]) continue;

    const inDisplay = rates[display] ? (amount / rates[from]) * rates[display] : null;
    const localValue = rates[local] ? (amount / rates[from]) * rates[local] : null;
    if (inDisplay === null) continue;

    // Only pair with the local currency when it differs from what is shown.
    el.textContent =
      el.dataset.variant === 'full' && localValue !== null && local !== display
        ? `${money(inDisplay, display)} · ${money(localValue, local)}`
        : money(inDisplay, display);

    // Sorting stays in one currency regardless of what is displayed.
    el.dataset.usd = String(Math.round((amount / rates[from]) * rates.USD));
  }

  // Inline amounts written as {{GEL 1800}} in the markdown.
  for (const el of Array.from(document.querySelectorAll<HTMLElement>('[data-money]'))) {
    const from = el.dataset.from ?? 'USD';
    const amounts = (el.dataset.amounts ?? '').split(',').map(Number).filter(Number.isFinite);
    if (amounts.length === 0 || !rates[from]) continue;

    const conv = el.querySelector<HTMLElement>('.money-conv');
    const usd = amounts.map((n) => (n / rates[from]) * rates.USD);
    const text = ` (≈ ${usd.map((v) => money(v, 'USD')).join('–')})`;
    if (conv) {
      conv.textContent = text;
    } else {
      const span = document.createElement('span');
      span.className = 'money-conv';
      span.textContent = text;
      el.append(span);
    }
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
