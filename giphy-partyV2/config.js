// config.js
// Central config so the API key and constants live in one place.

/** Your GIPHY API key. Uses the shared class key by default. */
const GIPHY_API_KEY = "MhAodEJIJxQMxW9XqxKjyXfNYdLoOIym";

/** Base search endpoint for the GIPHY API. */
const GIPHY_SEARCH_URL = "https://api.giphy.com/v1/gifs/search";

/** How many GIFs we want to show per search. */
const RESULTS_PER_SEARCH = 10;

/** How many GIFs to request from the API per call (we randomize down to 10). */
const API_FETCH_LIMIT = 50;

/** localStorage key under which saved GIFs are stored. */
const SAVED_STORAGE_KEY = "giphy_saved_gifs";