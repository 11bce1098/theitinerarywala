/** Drives the reading-progress bar from how far the article has scrolled. */
export function trackProgress(barSelector: string, articleSelector: string): void {
  const bar = document.querySelector<HTMLElement>(barSelector);
  const article = document.querySelector<HTMLElement>(articleSelector);
  if (!bar || !article) return;

  let frame = 0;
  const update = () => {
    frame = 0;
    const start = article.offsetTop;
    // How far past the top of the article we can scroll before it's fully read.
    const distance = article.offsetHeight - (window.innerHeight - start);
    const scrolled = window.scrollY - start;
    const ratio = distance > 0 ? scrolled / distance : 0;
    bar.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;
  };

  const schedule = () => {
    if (frame) return;
    frame = requestAnimationFrame(update);
  };

  update();
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
}
