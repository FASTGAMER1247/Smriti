import { STORAGE_KEY, getDefaultState } from "./constants";

/**
 * SSR-safe and robust storage client for Smriti
 */
export async function loadAppState() {
  if (typeof window === "undefined") {
    return getDefaultState();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return {
          ...getDefaultState(),
          ...parsed,
        };
      }
    }
  } catch (err) {
    console.warn("Could not load Smriti state from localStorage, falling back to defaults:", err);
  }

  const initial = getDefaultState();
  await saveAppState(initial);
  return initial;
}

export async function saveAppState(state) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("Failed to save Smriti state to localStorage:", err);
  }
}

export async function resetAppState() {
  if (typeof window === "undefined") return getDefaultState();
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (e) {}
  const fresh = getDefaultState();
  await saveAppState(fresh);
  return fresh;
}
