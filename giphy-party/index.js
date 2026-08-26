// working API key //
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

function setLoading(isLoading) {
  searchBtn.disabled = isLoading;
  searchBtn.textContent = isLoading ? "Searching..." : "Search";
  spinner.classList.toggle("hidden", !isLoading);
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