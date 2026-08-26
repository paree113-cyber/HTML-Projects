// index.js
// Main controller: connects the form, options, and views to the modules above.

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