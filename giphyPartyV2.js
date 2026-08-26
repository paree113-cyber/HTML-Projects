// All GIPHY API access and the random-selection logic live here.

/**
 * Fetch GIFs for a single search term.
 * @param {string} term
 * @param {number} [offset=0] - for pagination
 * @returns {Promise<Array>} array of GIF objects from the API
 */
async function fetchGifs(term, offset = 0) {
  const response = await axios.get(GIPHY_SEARCH_URL, {
    params: {
      api_key: GIPHY_API_KEY,
      q: term,
      limit: API_FETCH_LIMIT,
      offset: offset,
    },
  });
  return response.data.data;
}

/**
 * Fetch across a term and its synonyms, combining the results.
 * @param {string[]} terms
 * @returns {Promise<Array>} combined array of GIF objects
 */
async function fetchGifsForTerms(terms) {
  const requests = terms.map((t) => fetchGifs(t));
  const resultsArrays = await Promise.all(requests);
  return resultsArrays.flat(); // merge all arrays into one
}

/**
 * Return up to `count` random, non-duplicate items from an array.
 * Uses a Fisher–Yates shuffle, then slices the top `count`.
 * @param {Array} items
 * @param {number} count
 * @returns {Array}
 */
function pickRandom(items, count) {
  const copy = [...items]; // don't mutate the original
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]; // swap
  }
  return copy.slice(0, count);
}

/**
 * Normalize a raw GIPHY object down to just what we use.
 * @param {object} raw
 * @returns {{id: string, url: string, title: string}}
 */
function toSimpleGif(raw) {
  return {
    id: raw.id,
    url: raw.images.fixed_height.url,
    title: raw.title || "GIF",
  };
}

// Config - Central config so the API key and constants live in one place.

/** GIPHY API key (stil used one provided so it can be live; https://shiny-cuchufli-f964a2.netlify.app/) */
const GIPHY_API_KEY = "MhAodEJIJxQMxW9XqxKjyXfNYdLoOIym";

/** Base search endpoint for the GIPHY API. */
const GIPHY_SEARCH_URL = "https://api.giphy.com/v1/gifs/search";

/** How many GIFs we want to show per search. */
const RESULTS_PER_SEARCH = 10;

/** How many GIFs to request from the API per call (we randomize down to 10). */
const API_FETCH_LIMIT = 50;

/** localStorage key under which saved GIFs are stored. */
const SAVED_STORAGE_KEY = "giphy_saved_gifs";

// HTML

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Giphy V2</title>
  <link rel="stylesheet" href="./style.css" />
</head>
<body>
  <main>
    <header>
      <h1>GIPHY Search</h1>
      <p>Search for your favorite GIFs!</p>
    </header>

    <div class="toolbar">
      <button id="view-saved-btn">My Saved GIFs</button>
      <button id="view-search-btn" class="hidden">Back to Search</button>
    </div>

    <fieldset id="options" class="options">
      <legend>Options</legend>
      <label><input type="radio" name="mode" value="random" checked /> Random</label>
      <label><input type="radio" name="mode" value="paginate" /> Paginate</label>
      <label><input type="radio" name="mode" value="synonyms" /> Include Synonyms</label>
    </fieldset>

    <form id="search-form">
      <input type="text" id="search-input" placeholder="Enter a keyword..." autocomplete="off" />
      <button type="submit" id="search-btn">Search</button>
      <button type="button" id="more-btn" class="hidden">Load More</button>
    </form>

    <p id="loading-message" class="hidden">Loading...</p>
    <p id="error-message" class="msg-error"></p>
    <p id="no-results-message" class="hidden">No GIFs found. Try another term.</p>

    <div id="results" class="results"></div>
  </main>

    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
  <script src="config.js"></script>
  <script src="synonyms.js"></script>
  <script src="storage.js"></script>
  <script src="api.js"></script>
  <script src="ui.js"></script>
  <script src="index.js"></script>
</body>
</html>

// Index: connects the form, options, and views to the modules above.

const form = document.querySelector("#search-form");
const input = document.querySelector("#search-input");
const searchBtn = document.querySelector("#search-btn");
const moreBtn = document.querySelector("#more-btn");
const viewSavedBtn = document.querySelector("#view-saved-btn");
const viewSearchBtn = document.querySelector("#view-search-btn");

// simple app state
let currentTerm = "";
let currentOffset = 0;

/** Read which option radio is selected. @returns {string} */
function getMode() {
  return document.querySelector('input[name="mode"]:checked').value;
}

/** Run a search based on the current term, offset, and selected mode. */
async function runSearch() {
  const term = input.value.trim() || currentTerm;
  if (!term) {
    showError("Please type something to search for.");
    return;
  }

  currentTerm = term;
  const mode = getMode();

  showError("");
  showNoResults(false);
  showLoading(true);
  searchBtn.disabled = true;

  try {
    let rawGifs;

    if (mode === "synonyms") {
      // Requirement 5: search the term + its synonyms
      const terms = expandWithSynonyms(term);
      rawGifs = await fetchGifsForTerms(terms);
    } else {
      rawGifs = await fetchGifs(term, currentOffset);
    }

    if (!rawGifs || rawGifs.length === 0) {
      clearResults();
      showNoResults(true);
      return;
    }

    // Requirement 1: for random mode, pick 10 random; otherwise take first 10
    let chosen;
    if (mode === "paginate") {
      chosen = rawGifs.slice(0, RESULTS_PER_SEARCH);
      moreBtn.classList.remove("hidden"); // allow browsing more
    } else {
      chosen = pickRandom(rawGifs, RESULTS_PER_SEARCH);
      moreBtn.classList.add("hidden");
    }

    const simple = chosen.map(toSimpleGif);
    renderGifs(simple, () => renderGifs(simple, null)); // re-render on save toggle
  } catch (err) {
    console.error(err);
    showError("Something went wrong reaching GIPHY. Please try again.");
  } finally {
    showLoading(false);
    searchBtn.disabled = false;
  }
}

// --- events ---

form.addEventListener("submit", function (evt) {
  evt.preventDefault();
  currentOffset = 0; // new search starts from the top
  runSearch();
});

// Requirement 5: "Paginate" — load the next page of results
moreBtn.addEventListener("click", function () {
  currentOffset += RESULTS_PER_SEARCH;
  runSearch();
});

// show saved GIFs view
viewSavedBtn.addEventListener("click", function () {
  const saved = getSavedGifs();
  showNoResults(false);
  showError("");
  if (saved.length === 0) {
    clearResults();
    showError("You have no saved GIFs yet.");
  } else {
    renderGifs(saved, () => viewSavedBtn.click()); // refresh after removing
  }
  viewSavedBtn.classList.add("hidden");
  viewSearchBtn.classList.remove("hidden");
  moreBtn.classList.add("hidden");
});

// back to search view
viewSearchBtn.addEventListener("click", function () {
  clearResults();
  showError("");
  viewSearchBtn.classList.add("hidden");
  viewSavedBtn.classList.remove("hidden");
});

// Storage - handles the "saved GIFs" application state and stores ONLY what we need per GIF (id + url + title), not the whole object.

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

// Style

* { box-sizing: border-box; }

body {
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  margin: 0;
  background: #f4f4f7;
  color: #1a1a2e;
}

main { max-width: 1000px; margin: 0 auto; padding: 1rem; }

header { text-align: center; }
header h1 { margin: 0.5rem 0 0.25rem; }
header p { margin: 0; color: #555; }

.toolbar { text-align: center; margin: 1rem 0; }

.options {
  max-width: 420px;
  margin: 0 auto 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  display: flex;
  gap: 1rem;
  justify-content: center;
}

#search-form {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 1rem;
}

#search-input {
  flex: 1 1 300px;
  max-width: 340px;
  padding: 0.55rem 0.75rem;
  border: 1px solid #bbb;
  border-radius: 6px;
  font-size: 1rem;
}

button {
  padding: 0.55rem 1rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

#search-btn, #view-saved-btn { background: #2ecc71; color: #fff; }
#more-btn, #view-search-btn { background: #3498db; color: #fff; }

.hidden { display: none; }
.msg-error { text-align: center; color: #c0392b; min-height: 1.2rem; }
#loading-message, #no-results-message { text-align: center; color: #555; }

.results {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
}

.gif-card {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 190px;
}

.gif-card img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 6px;
}

.btn-save { background: #3498db; color: #fff; }
.btn-remove { background: #e74c3c; color: #fff; }

// Synonyms: small lookup dictionary. When "Include Synonyms" is on, search term into related terms.

/** Maps a base term to related search terms. */
const SYNONYM_MAP = {
  cats: ["felines", "kittens", "tigers", "lions"],
  dogs: ["puppies", "canines", "wolves"],
  happy: ["excited", "joyful", "celebration"],
  sad: ["crying", "upset", "tears"],
  food: ["pizza", "burger", "tacos", "dessert"],
  dance: ["dancing", "party", "groove"],
};

/**
 * Return the base term plus any known synonyms.
 * Tries the term as-is, then a naive plural/singular fallback so
 * "cat" and "cats" both match the same dictionary entry.
 * @param {string} term - the user's search term
 * @returns {string[]} the term and its synonyms (deduped, lowercased)
 */
function expandWithSynonyms(term) {
  const key = term.trim().toLowerCase();

  const plural = key + "s";                                  // cat -> cats
  const singular = key.endsWith("s") ? key.slice(0, -1) : key; // cats -> cat

  const extras =
    SYNONYM_MAP[key] || SYNONYM_MAP[plural] || SYNONYM_MAP[singular] || [];

  return [...new Set([key, ...extras])];
}

// UI: Everything that touches the DOM

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
