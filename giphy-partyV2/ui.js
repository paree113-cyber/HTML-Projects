// ui.js
// Everything that touches the DOM: rendering cards, messages, and buttons.

const resultsEl = document.querySelector("#results");
const loadingEl = document.querySelector("#loading-message");
const errorEl = document.querySelector("#error-message");
const noResultsEl = document.querySelector("#no-results-message");

/** Show/hide the "Loading..." message. @param {boolean} on */
function showLoading(on) {
  loadingEl.classList.toggle("hidden", !on);
}

/** Show an error message to the user (empty string clears it). @param {string} msg */
function showError(msg) {
  errorEl.textContent = msg;
}

/** Show/hide the "no results" message. @param {boolean} on */
function showNoResults(on) {
  noResultsEl.classList.toggle("hidden", !on);
}

/** Remove everything from the results area. */
function clearResults() {
  resultsEl.innerHTML = "";
}

/**
 * Build one GIF card with a Save/Remove toggle button.
 * @param {{id: string, url: string, title: string}} gif
 * @param {Function} onChange - called after save/remove so the view can refresh
 * @returns {HTMLElement}
 */
function createGifCard(gif, onChange) {
  const card = document.createElement("div");
  card.className = "gif-card";

  const img = document.createElement("img");
  img.src = gif.url;
  img.alt = gif.title;

  const btn = document.createElement("button");
  // Requirement 2: button text depends on whether the GIF is already saved
  const saved = isSaved(gif.id);
  btn.textContent = saved ? "Remove" : "Save";
  btn.className = saved ? "btn-remove" : "btn-save";

  btn.addEventListener("click", function () {
    if (isSaved(gif.id)) {
      removeSavedGif(gif.id);
    } else {
      saveGif(gif);
    }
    if (onChange) onChange(); // let the caller re-render
  });

  card.append(img, btn);
  return card;
}

/**
 * Render a list of simple GIFs into the results area.
 * @param {Array} gifs
 * @param {Function} onChange
 */
function renderGifs(gifs, onChange) {
  clearResults();
  gifs.forEach((gif) => resultsEl.append(createGifCard(gif, onChange)));
}