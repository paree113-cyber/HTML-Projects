const fs = require('fs');
const process = require('process');
const axios = require('axios');

/** handle output: write to file if out given, else print */
async function handleOutput(text, out) {
  if (out) {
    try {
      await fs.promises.writeFile(out, text, 'utf8');
    } catch (err) {
      console.error(`Couldn't write ${out}: ${err}`);
      process.exit(1);
    }
  } else {
    console.log(text);
  }
}

/** read file at path and return its contents. */
async function cat(path) {
  try {
    return await fs.promises.readFile(path, 'utf8');
  } catch (err) {
    console.error(`Error reading ${path}: ${err}`);
    process.exit(1);
  }
}

/** read page at URL and return its contents. */
async function webCat(url) {
  try {
    let resp = await axios.get(url);
    return resp.data;
  } catch (err) {
    console.error(`Error fetching ${url}: ${err}`);
    process.exit(1);
  }
}

/** read one path or URL and return its contents. */
async function getContent(path) {
  if (path.slice(0, 4) === 'http') {
    return webCat(path);
  } else {
    return cat(path);
  }
}

/** read every path/URL in sequence, then print or write the result. */
async function main(paths, out) {
  let text = '';
  for (let path of paths) {
    text += await getContent(path);
  }
  await handleOutput(text, out);
}

let paths;
let out;

if (process.argv[2] === '--out') {
  out = process.argv[3];
  paths = process.argv.slice(4);
} else {
  paths = process.argv.slice(2);
}

main(paths, out);
