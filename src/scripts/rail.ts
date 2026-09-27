/**
 * Arrow affordances for a horizontally scrolling strip.
 *
 * The strip scrolls on its own — this only adds buttons for mouse users and
 * keeps them honest about where the strip is. They hide entirely when
 * everything already fits, so they never sit there as dead controls.
 *
 * Markup: a [data-rail-root] wrapper containing [data-rail-track] and
 * optionally [data-rail-nav="prev"] / [data-rail-nav="next"].
 */

/** Below this, "at the start" cannot be confused with "one step along". */
const SLACK = 12;

function wire(root: HTMLElement): void {
  const track = root.querySelector<HTMLElement>('[data-rail-track]');
  const prev = root.querySelector<HTMLButtonElement>('[data-rail-nav="prev"]');
  const next = root.querySelector<HTMLButtonElement>('[data-rail-nav="next"]');
  if (!track || !prev || !next) return;

  /** One item plus its gap, so a click lands on a whole thing. */
  const step = (): number => {
    const item = track.firstElementChild as HTMLElement | null;
    const gap = parseFloat(getComputedStyle(track).columnGap || '0') || 0;
    return item ? item.getBoundingClientRect().width + gap : track.clientWidth * 0.8;
  };

  const sync = (): void => {
    const overflowing = track.scrollWidth > track.clientWidth + 1;
    prev.hidden = next.hidden = !overflowing;
    root.toggleAttribute('data-rail-overflowing', overflowing);
    if (!overflowing) {
      root.removeAttribute('data-rail-at');
      return;
    }
    const atStart = track.scrollLeft <= SLACK;
    const atEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - SLACK;
    prev.disabled = atStart;
    next.disabled = atEnd;
    /*
     * Tells the CSS which edge has content running off it, so only that side
     * is faded — fading the start would dim the first tab, which is usually
     * the selected one.
     */
    root.setAttribute('data-rail-at', atStart ? 'start' : atEnd ? 'end' : 'middle');
  };

  // Smooth scrolling means the arrows land after the click, so re-check when
  // the scroll finishes as well as while it runs.
  const nudge = (by: number): void => {
    track.scrollBy({ left: by });
    setTimeout(sync, 450);
  };

  prev.addEventListener('click', () => nudge(-step()));
  next.addEventListener('click', () => nudge(step()));
  track.addEventListener('scroll', sync, { passive: true });
  track.addEventListener('scrollend', sync);
  addEventListener('resize', sync);

  // Tab strips scroll themselves when a tab is chosen; keep the arrows in step.
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(sync).observe(track);
  sync();
}

export function initRails(scope: ParentNode = document): void {
  for (const root of Array.from(scope.querySelectorAll<HTMLElement>('[data-rail-root]'))) {
    wire(root);
  }
}
