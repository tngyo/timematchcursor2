/**
 * LocalStorage utilities for TimeMatch
 * Provides auto-save functionality with debounce
 */

const STORAGE_KEY = 'timematch_draft';
let debounceTimer = null;

export function saveDraft(meetingName, currentParticipant) {
  // Debounce saves to avoid excessive writes
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    try {
      const draft = {
        meetingName,
        currentParticipant,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch (e) {
      console.error('Failed to save draft:', e);
    }
  }, 500);
}

export function loadDraft() {
  try {
    const draft = localStorage.getItem(STORAGE_KEY);
    return draft ? JSON.parse(draft) : null;
  } catch (e) {
    console.error('Failed to load draft:', e);
    return null;
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear draft:', e);
  }
}
