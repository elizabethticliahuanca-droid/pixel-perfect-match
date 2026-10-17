// After the site updates, the browser can still be holding the import address of
// an older copy of a page. That fetch then fails and the screen goes blank, so we
// reload one time to pick up the current version. The guard makes sure a genuine
// failure cannot loop into endless reloads.
const RELOAD_KEY = "sabor-de-hogar-chunk-reload";
const CHUNK_ERROR = /Failed to fetch dynamically imported module|error loading dynamically imported module|Unable to preload CSS|Importing a module script failed/i;

export function isChunkLoadError(error: unknown): boolean {
  let current: unknown = error;
  for (let depth = 0; depth < 4 && current; depth += 1) {
    const message =
      current instanceof Error ? current.message : typeof current === "string" ? current : "";
    if (CHUNK_ERROR.test(message)) return true;
    current = current instanceof Error ? current.cause : undefined;
  }
  return false;
}

export function reloadOnceForChunkError(): boolean {
  try {
    if (window.sessionStorage.getItem(RELOAD_KEY)) return false;
    window.sessionStorage.setItem(RELOAD_KEY, "1");
  } catch {
    // Without storage we cannot remember that we already retried, so we don't.
    return false;
  }
  window.location.reload();
  return true;
}

export function clearChunkReloadGuard(): void {
  try {
    window.sessionStorage.removeItem(RELOAD_KEY);
  } catch {
    // Private browsing may block storage; there is then nothing to clear.
  }
}
