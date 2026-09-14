/**
 * Fades elements in as they scroll into view.
 *
 * Idempotent: call it again after adding `data-reveal` to new nodes and only
 * the untouched ones get observed. Elements are marked done rather than
 * tracked in a set so a second call can't double-observe the same node.
 */
const DONE = 'data-revealed';

export function reveal(root: ParentNode = document): void {
  const targets = Array.from(
    root.querySelectorAll<HTMLElement>(`[data-reveal]:not([${DONE}])`)
  );
  if (targets.length === 0) return;

  const show = (el: HTMLElement) => {
    el.setAttribute(DONE, '');
    el.classList.add('is-revealed');
  };

  // Reduced motion still needs the class, otherwise the CSS leaves it hidden.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    targets.forEach(show);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        show(entry.target as HTMLElement);
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );

  targets.forEach((el) => {
    el.setAttribute(DONE, 'pending');
    observer.observe(el);
  });
}
