// Part 2: Deck of Cards using PROMISES
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