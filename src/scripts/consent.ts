import { CONSENT_KEY, CONSENT_REGIONS, GRANTED, DENIED } from '../lib/consent.mjs';

type Choice = 'granted' | 'denied';

const read = (): string | null => {
  try {
    return localStorage.getItem(CONSENT_KEY);
  } catch {
    return null; // private mode; the stricter default stays in place
  }
};

/**
 * Cloudflare serves this site, so the visitor's country is one same-origin
 * request away and no third-party geo service is involved. Returns '' if it
 * cannot be determined.
 */
async function country(): Promise<string> {
  try {
    const res = await fetch('/cdn-cgi/trace', { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return '';
    return /(?:^|\n)loc=([A-Z]{2})/.exec(await res.text())?.[1] ?? '';
  } catch {
    return '';
  }
}

/**
 * Ask for consent, but only where it is required and only once.
 *
 * Nothing is set before an answer: the tag in <head> already defaults these
 * regions to denied. So failing to show the banner is the safe direction —
 * it costs a possible opt-in, never an unlawful cookie — which is why an
 * unreadable country simply returns instead of asking everyone.
 */
export async function consent(): Promise<void> {
  const banner = document.querySelector<HTMLElement>('[data-consent]');
  if (!banner || read()) return;

  const loc = await country();
  if (!loc || !CONSENT_REGIONS.includes(loc)) return;

  const decide = (choice: Choice) => {
    try {
      localStorage.setItem(CONSENT_KEY, choice);
    } catch {
      /* Not storable, so they will be asked again next visit. Better than
         silently treating an unsaved "reject" as permission. */
    }
    window.gtag?.('consent', 'update', choice === 'granted' ? GRANTED : DENIED);
    banner.hidden = true;
    document.getElementById('main')?.focus();
  };

  for (const button of banner.querySelectorAll<HTMLButtonElement>('[data-consent-choice]')) {
    button.addEventListener('click', () => decide(button.dataset.consentChoice as Choice));
  }

  banner.hidden = false;
  // Both buttons carry equal weight in the markup; focus the safer one.
  banner.querySelector<HTMLButtonElement>('[data-consent-choice="denied"]')?.focus();
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * The opt-out on the privacy page.
 *
 * Withdrawing has to be as easy as giving, so this is a pair of buttons
 * rather than a buried instruction — and unlike the banner it works
 * everywhere, so a reader outside the EEA can opt out too even though they
 * were never asked.
 */
export function consentControls(): void {
  const group = document.querySelector<HTMLElement>('[data-consent-controls]');
  if (!group) return;

  const label = group.querySelector<HTMLElement>('[data-consent-state]');
  const paint = () => {
    const saved = read();
    if (label) {
      label.textContent =
        saved === 'granted' ? 'Currently allowed.'
        : saved === 'denied' ? 'Currently turned off.'
        : 'No choice saved yet — the regional default applies.';
    }
    for (const b of group.querySelectorAll<HTMLButtonElement>('[data-consent-set]')) {
      b.setAttribute('aria-pressed', String(b.dataset.consentSet === saved));
    }
  };

  for (const button of group.querySelectorAll<HTMLButtonElement>('[data-consent-set]')) {
    button.addEventListener('click', () => {
      const choice = button.dataset.consentSet as Choice;
      try {
        localStorage.setItem(CONSENT_KEY, choice);
      } catch { /* nothing to persist to; the update below still applies now */ }
      window.gtag?.('consent', 'update', choice === 'granted' ? GRANTED : DENIED);
      document.querySelector<HTMLElement>('[data-consent]')?.setAttribute('hidden', '');
      paint();
    });
  }

  paint();
}
