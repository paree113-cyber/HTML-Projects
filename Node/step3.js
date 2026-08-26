const fs = require("fs");
const axios = require("axios");

/** Read content from a local file path. Returns a promise of the text. */
function readFromFile(path) {
  return fs.promises.readFile(path, "utf8").catch((err) => {
    throw new Error(`Error reading ${path}:\n  ${err}`);
  });
}

/** Read content from a URL using axios. Returns a promise of the text. */
async function readFromURL(url) {
  try {
    const resp = await axios.get(url);
    return resp.data;
  } catch (err) {
    throw new Error(`Error fetching ${url}:\n  ${err}`);
  }
}

/** Return the right content-getter for `source` (URL vs file path). */
function getContent(source) {
  const isURL = source.startsWith("http://") || source.startsWith("https://");
  return isURL ? readFromURL(source) : readFromFile(source);
}

/** Write `content` to `path`, or throw a friendly error. */
function writeToFile(path, content) {
  return fs.promises.writeFile(path, content).catch((err) => {
    throw new Error(`Couldn't write ${path}:\n  ${err}`);
  });
}

/** Get content from `source` and either print it or write it to `outPath`. */
async function output(source, outPath) {
  try {
    const content = await getContent(source);
    if (outPath) {
      await writeToFile(outPath, content);
    } else {
      console.log(content);
    }
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

/** Parse argv into { outPath, source }. Supports optional `--out <file>`. */
function parseArgs(argv) {
  let outPath = null;
  const args = argv.slice(2);
  if (args[0] === "--out") {
    outPath = args[1];
    args.splice(0, 2);
  }
  return { outPath, source: args[0] };
}

const { outPath, source } = parseArgs(process.argv);
output(source, outPath);
