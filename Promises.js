// Links in the school project do not work, so I made random facts instead - Numbers HTML PT1

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Number Facts</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h1>Number Facts</h1>

  <section>
    <h2>Step 1: One fact about my favorite number (<span id="fav">7</span>)</h2>
    <p id="single-fact">Loading...</p>
  </section>

  <section>
    <h2>Step 2: Facts about multiple numbers (one request)</h2>
    <ul id="range-facts"></ul>
  </section>

  <section>
    <h2>Step 3: Four facts about my favorite number</h2>
    <ul id="four-facts"></ul>
  </section>

  <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
  <script src="numbers.js"></script>
</body>
</html>

// Part 1: Number Facts using PROMISES
// Numbers API: numbersapi.com (HTTP-only, add ?json for JSON). Uses protocol-relative so it matches the page protocol. Each step falls back to a local fact if the API is unavailable so the page always renders (good error handling). I had to use AI as my husband was at work to help bypass the JSON ask, I was not understanding how to get this info over without the "request"

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

// Cards Pt 2 - Style

body {
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  margin: 0;
  padding: 2rem;
  color: #fff;
  background: #35654d; /* card-table green */
  text-align: center;
}

h1 { margin-bottom: 0.25rem; }
p { margin: 0.5rem 0; }

button {
  padding: 0.7rem 1.4rem;
  border: none;
  border-radius: 6px;
  background: #2ecc71;
  color: #fff;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
}
button:disabled { opacity: 0.6; cursor: not-allowed; }

#cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 2rem;
  padding-left: 40px;
}

.card {
  width: 120px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);
  background: #fff;
  margin-left: -40px;                 /* overlap the previous card */
  transform: rotate(var(--tilt, 0deg)); /* the per-card tilt */
  transform-origin: bottom center;    /* pivot from the bottom, like a real fan */
  transition: transform 0.15s ease;
}

/* on hover, straighten and lift the card so you can read it */
.card:hover {
  transform: rotate(0deg) translateY(-24px);
  z-index: 10;
}

// Part 2: Deck of Cards using PROMISES - JS
// API: https://deckofcardsapi.com/

const BASE = "https://deckofcardsapi.com/api/deck";

const drawBtn = document.querySelector("#draw-btn");
const cardsDiv = document.querySelector("#cards");
const remainingEl = document.querySelector("#remaining");

// STEP 1: draw ONE card from a newly shuffled deck, log it
axios
  .get(`${BASE}/new/shuffle/?deck_count=1`)
  .then((res) => axios.get(`${BASE}/${res.data.deck_id}/draw/?count=1`))
  .then((res) => {
    const card = res.data.cards[0];
    console.log(`Step 1: ${card.value} of ${card.suit}`);
  })
  .catch((err) => console.error("Step 1 failed:", err));

// STEP 2: draw one card, then a SECOND from the SAME deck, log both
axios
  .get(`${BASE}/new/shuffle/?deck_count=1`)
  .then((res) => {
    const deckId = res.data.deck_id;
    return axios.get(`${BASE}/${deckId}/draw/?count=1`).then((res1) => {
      const card1 = res1.data.cards[0];
      return axios.get(`${BASE}/${deckId}/draw/?count=1`).then((res2) => {
        const card2 = res2.data.cards[0];
        console.log(`Step 2: ${card1.value} of ${card1.suit}`);
        console.log(`Step 2: ${card2.value} of ${card2.suit}`);
      });
    });
  })
  .catch((err) => console.error("Step 2 failed:", err));

// STEP 3: interactive draw-a-card page
let deckId = null;

drawBtn.disabled = true;

axios
  .get(`${BASE}/new/shuffle/?deck_count=1`)
  .then((res) => {
    deckId = res.data.deck_id;
    drawBtn.disabled = false;
    remainingEl.textContent = `Cards remaining: ${res.data.remaining}`;
  })
  .catch((err) => {
    console.error(err);
    remainingEl.textContent = "Could not create a deck.";
  });

drawBtn.addEventListener("click", () => {
  if (!deckId) return;

  axios
    .get(`${BASE}/${deckId}/draw/?count=1`)
    .then((res) => {
      const remaining = res.data.remaining;
      remainingEl.textContent = `Cards remaining: ${remaining}`;

      if (res.data.cards.length === 0) {
        drawBtn.disabled = true;
        drawBtn.textContent = "No cards left!";
        return;
      }

            const card = res.data.cards[0];
      const img = document.createElement("img");
      img.src = card.image;
      img.alt = `${card.value} of ${card.suit}`;
      img.className = "card";

      // slight random tilt for a "fanned hand" look (-8° to +8°)
      const tilt = Math.floor(Math.random() * 17) - 8;
      img.style.setProperty("--tilt", `${tilt}deg`);

      cardsDiv.append(img);

      if (remaining === 0) {
        drawBtn.disabled = true;
        drawBtn.textContent = "No cards left!";
      }
    })
    .catch((err) => console.error("Draw failed:", err));
});

// Cards Pt 2 - HTML

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Deck of Cards</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h1>Draw a Card</h1>
  <p>Open the console (F12) to see Steps 1 & 2 log card values.</p>

  <button id="draw-btn">Draw a card</button>
  <p id="remaining"></p>
  <div id="cards"></div>

  <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
  <script src="cards.js"></script>
</body>
</html>

// Pokemon Pt 3 - CSS

body {
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  margin: 2rem;
  color: #1a1a2e;
  background: #f4f4f7;
  text-align: center;
}

h1 { margin-bottom: 0.25rem; }

button {
  padding: 0.7rem 1.4rem;
  border: none;
  border-radius: 6px;
  background: #ef5350;
  color: #fff;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
}
button:disabled { opacity: 0.6; cursor: not-allowed; }

.hidden { display: none; }

#pokemon {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
}

.poke-card {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 1rem;
  width: 220px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}

.poke-card img {
  width: 120px;
  height: 120px;
  image-rendering: pixelated; /* keeps the sprite crisp when scaled */
}

.poke-card h2 {
  text-transform: capitalize;
  margin: 0 0 0.5rem;
  color: #ef5350;
}

.poke-card p {
  font-size: 0.9rem;
  color: #444;
  line-height: 1.4;
}

// Pokémon using PROMISES - Pt 3 JS
// API: https://pokeapi.co/

const POKE_LIST = "https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0";

const genBtn = document.querySelector("#gen-btn");
const loadingEl = document.querySelector("#loading");
const container = document.querySelector("#pokemon");

/** Pick `count` random items from an array (no duplicates). */
function pickRandom(items, count) {
  const copy = [...items];
  const chosen = [];
  for (let i = 0; i < count && copy.length; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    chosen.push(copy.splice(idx, 1)[0]); // remove so no repeats
  }
  return chosen;
}

genBtn.addEventListener("click", () => {
  container.innerHTML = "";
  genBtn.disabled = true;
  loadingEl.classList.remove("hidden");

  // STEP 1: one request for names + URLs of EVERY pokemon
  axios
    .get(POKE_LIST)
    .then((res) => {
      const all = res.data.results; // [{ name, url }, ...]
      const three = pickRandom(all, 3);

      // STEP 2: request each chosen pokemon's detail URL (in parallel)
      const detailRequests = three.map((p) => axios.get(p.url));
      return Promise.all(detailRequests);
    })
    .then((detailResponses) => {
      // log the raw data (Step 2 requirement)
      detailResponses.forEach((res) => console.log("Step 2 data:", res.data));

      // STEP 3: for each, follow the species URL to get an English description
      const speciesRequests = detailResponses.map((res) => {
        const data = res.data;
        return axios.get(data.species.url).then((speciesRes) => {
          const entry = speciesRes.data.flavor_text_entries.find(
            (e) => e.language.name === "en"
          );
          const description = entry
            ? entry.flavor_text.replace(/[\f\n\r]/g, " ") // clean control chars
            : "No description found.";

          console.log(`${data.name}: ${description}`); // Step 3 requirement

          return {
            name: data.name,
            image: data.sprites.front_default,
            description,
          };
        });
      });

      return Promise.all(speciesRequests);
    })
    .then((pokemonData) => {
      // BONUS: render name + image + description as cards
      pokemonData.forEach((p) => {
        const card = document.createElement("div");
        card.className = "poke-card";

        const h2 = document.createElement("h2");
        h2.textContent = p.name;

        const img = document.createElement("img");
        img.src = p.image;
        img.alt = p.name;

        const desc = document.createElement("p");
        desc.textContent = p.description;

        card.append(h2, img, desc);
        container.append(card);
      });
    })
    .catch((err) => {
      console.error(err);
      container.textContent = "Could not load Pokémon. Please try again.";
    })
    .finally(() => {
      genBtn.disabled = false;
      loadingEl.classList.add("hidden");
    });
});

// Pokemon Pt 3 - HTML

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Random Pokémon</title>
  <link rel="stylesheet" href="pokemon.css" />
</head>
<body>
  <h1>Random Pokémon</h1>
  <p>Open the console (F12) to see the logged data for each step.</p>

  <button id="gen-btn">Get 3 Random Pokémon</button>
  <p id="loading" class="hidden">Loading...</p>
  <div id="pokemon"></div>

  <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
  <script src="pokemon.js"></script>
</body>
</html>
