// synonyms.js
// A small lookup dictionary. When "Include Synonyms" is on, we expand
// a search term into related terms and search across them.

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