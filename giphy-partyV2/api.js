// api.js
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