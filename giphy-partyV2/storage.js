// storage.js
// Handles the "saved GIFs" application state and persistence to localStorage.
// We store ONLY what we need per GIF (id + url + title), not the whole object.

/**
 * Load saved GIFs from localStorage.
 * @returns {Array<{id: string, url: string, title: string}>}
 */
function getSavedGifs() {
  const raw = localStorage.getItem(SAVED_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return []; // corrupted data — start clean
  }
}

/**
 * Overwrite the saved list in localStorage.
 * @param {Array} gifs
 */
function setSavedGifs(gifs) {
  localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(gifs));
}

/**
 * Is a given GIF id already saved?
 * @param {string} id
 * @returns {boolean}
 */
function isSaved(id) {
  return getSavedGifs().some((g) => g.id === id);
}

/**
 * Save a GIF (stores only id, url, title).
 * @param {{id: string, url: string, title: string}} gif
 */
function saveGif(gif) {
  const saved = getSavedGifs();
  if (!saved.some((g) => g.id === gif.id)) {
    saved.push(gif);
    setSavedGifs(saved);
  }
}

/**
 * Remove a saved GIF by id.
 * @param {string} id
 */
function removeSavedGif(id) {
  const saved = getSavedGifs().filter((g) => g.id !== id);
  setSavedGifs(saved);
}