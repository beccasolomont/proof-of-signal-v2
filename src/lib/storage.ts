/**
 * storage — centralised localStorage utilities for client-side persistence.
 * All localStorage access should go through these helpers.
 */

const CUSTOM_TAGS_KEY = 'customSignalTags';

/** Retrieve the persisted custom tag list. */
export function getCustomTags(): string[] {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_TAGS_KEY) || '[]');
  } catch {
    return [];
  }
}

/** Persist the custom tag list. */
export function setCustomTags(tags: string[]): void {
  localStorage.setItem(CUSTOM_TAGS_KEY, JSON.stringify(tags));
}

/** Remove the custom tag list from storage. */
export function clearCustomTags(): void {
  localStorage.removeItem(CUSTOM_TAGS_KEY);
}
