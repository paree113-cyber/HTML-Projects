// Further Study: Pokémon using PROMISES
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