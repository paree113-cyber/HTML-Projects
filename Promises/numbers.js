// Part 1: Number Facts using PROMISES
// Numbers API: numbersapi.com (HTTP-only, add ?json for JSON).
// Uses protocol-relative // so it matches the page protocol.
// Each step falls back to a local fact if the API is unavailable,
// so the page always renders (good error handling).

const favoriteNumber = 7;

// --- fallback facts, used only if the API request fails ---
const backupFacts = [
  `${favoriteNumber} is the number of days in a week.`,
  `${favoriteNumber} is considered lucky in many cultures.`,
  `${favoriteNumber} is the number of colors in a rainbow.`,
  `${favoriteNumber} is a prime number.`,
];

// grab elements
const favSpan = document.querySelector("#fav");
const singleFactEl = document.querySelector("#single-fact");
const rangeList = document.querySelector("#range-facts");
const fourList = document.querySelector("#four-facts");

favSpan.textContent = favoriteNumber;

/**
 * Request one fact for a number. Never rejects — resolves to a fact
 * string, falling back to `fallback` if the request fails.
 */
function getFact(n, fallback) {
  return axios
    .get(`//numbersapi.com/${n}?json`)
    .then((res) => res.data.text)
    .catch(() => fallback);
}

// ============================================================
// STEP 1: a single fact, single request
// ============================================================
getFact(favoriteNumber, backupFacts[0]).then((text) => {
  singleFactEl.textContent = text;
});

// ============================================================
// STEP 2: facts about MULTIPLE numbers in ONE request
// The Numbers API supports ranges: /1..5?json returns an object
// keyed by number, e.g. { "1": "1 is...", "2": "2 is...", ... }
// ============================================================
axios
  .get(`//numbersapi.com/1..5?json`)
  .then((res) => {
    // res.data is an object; turn its values into list items
    Object.values(res.data).forEach((text) => {
      const li = document.createElement("li");
      li.textContent = text;
      rangeList.append(li);
    });
  })
  .catch((err) => {
    console.error(err);
    // fallback: show a few made-up facts so the section isn't empty
    ["1 is the first counting number.", "2 is the only even prime.", "3 is a triangular number.", "4 is the smallest composite number.", "5 is the number of fingers on a hand."]
      .forEach((text) => {
        const li = document.createElement("li");
        li.textContent = text;
        rangeList.append(li);
      });
  });

// ============================================================
// STEP 3: FOUR facts about the favorite number, via Promise.all
// (4 separate requests, resolved together; repeats are OK)
// ============================================================
const fourRequests = backupFacts.map((fallback) => getFact(favoriteNumber, fallback));

Promise.all(fourRequests)
  .then((facts) => {
    facts.forEach((text) => {
      const li = document.createElement("li");
      li.textContent = text;
      fourList.append(li);
    });
  })
  .catch((err) => {
    console.error(err);
    fourList.textContent = "Could not load number facts.";
  });