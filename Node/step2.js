const fs = require("fs");
const axios = require("axios");

/** Read the file at `path` and print its contents to the console. */
function cat(path) {
  fs.readFile(path, "utf8", function (err, data) {
    if (err) {
      console.error(`Error reading ${path}:\n  ${err}`);
      process.exit(1);
    }
    console.log(data);
  });
}

/** Fetch the content at `url` and print it to the console. */
async function webCat(url) {
  try {
    const resp = await axios.get(url);
    console.log(resp.data);
  } catch (err) {
    console.error(`Error fetching ${url}:\n  ${err}`);
    process.exit(1);
  }
}

/** Decide whether `arg` is a URL and dispatch to webCat, else cat. */
function handleArg(arg) {
  if (arg.startsWith("http://") || arg.startsWith("https://")) {
    webCat(arg);
  } else {
    cat(arg);
  }
}

const arg = process.argv[2];
handleArg(arg);
