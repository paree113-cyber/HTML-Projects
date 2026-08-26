// Doc

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Giphy Party</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h1>Giphy Party</h1>

  <form id="search-form">
    <input id="search-input" type="text" placeholder="Search for a GIF..." required />
    <button type="submit" id="search-btn">Search</button>
    <button type="button" id="remove-btn">Remove All</button>
  </form>

  <p id="status" role="status" aria-live="polite"></p>

  <!-- spinner, hidden until a request is in flight -->
  <div id="spinner" class="spinner hidden" aria-hidden="true"></div>

  <div id="gifs"></div>

  <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
  <script src="index.js"></script>
</body>
</html>

// Index

// working API key - I had to use the initial one sent as the one I generated from spoonacular would not work on a public profile for you to view (my private API = "0f8d3ad404ea481fb4319486314969e0";) profile: https://vermillion-malasada-a7ba5a.netlify.app/ //

const giphyApiKey = "MhAodEJIJxQMxW9XqxKjyXfNYdLoOIym";

const searchUrl = "https://api.giphy.com/v1/gifs/search";

const form = document.querySelector("#search-form");
const input = document.querySelector("#search-input");
const gifsContainer = document.querySelector("#gifs");
const removeBtn = document.querySelector("#remove-btn");
const searchBtn = document.querySelector("#search-btn");
const status = document.querySelector("#status");
const spinner = document.querySelector("#spinner");

function setStatus(message) {
  status.textContent = message;
}

// flip the UI between "loading" and "ready" states
function setLoading(isLoading) {
  searchBtn.disabled = isLoading;                 // block double-submits
  searchBtn.textContent = isLoading ? "Searching..." : "Search";
  spinner.classList.toggle("hidden", !isLoading); // show/hide spinner
}

form.addEventListener("submit", async function (evt) {
  evt.preventDefault();

  const searchTerm = input.value.trim();

  if (!searchTerm) {
    setStatus("Please type something to search for.");
    return;
  }

  setStatus(`Searching for "${searchTerm}"...`);
  setLoading(true);

  try {
    const response = await axios.get(searchUrl, {
      params: {
        api_key: giphyApiKey,
        q: searchTerm,
        limit: 25,
      },
    });

    console.log(response.data);

    const gifs = response.data.data;

    if (!gifs || gifs.length === 0) {
      setStatus(`No GIFs found for "${searchTerm}". Try another term.`);
      return;
    }

    addGif(gifs);
    setStatus("");
    input.value = "";
  } catch (err) {
    console.error("Giphy request failed:", err);
    setStatus("Something went wrong reaching Giphy. Please try again.");
  } finally {
    // runs whether the request succeeded or failed
    setLoading(false);
  }
});

function addGif(gifs) {
  const randomIndex = Math.floor(Math.random() * gifs.length);
  const gifUrl = gifs[randomIndex].images.original.url;

  const img = document.createElement("img");
  img.src = gifUrl;
  img.alt = "A GIF from Giphy";
  gifsContainer.append(img);
}

removeBtn.addEventListener("click", function () {
  gifsContainer.innerHTML = "";
  setStatus("");
});

// Style

img {
  max-width: 240px;
  margin: 8px;
  border-radius: 8px;
}

#status {
  color: #555;
  font-style: italic;
}

/* hidden helper */
.hidden {
  display: none;
}

/* spinner */
.spinner {
  width: 36px;
  height: 36px;
  margin: 12px auto;
  border: 4px solid #ddd;
  border-top-color: #8b5cf6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* disabled button state */
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
