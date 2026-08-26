const fs = require("fs");

/** Read the file at `path` and print its contents to the console.
 *
 * If the file can't be read, print the error and exit with a failure code.
 */
function cat(path) {
  fs.readFile(path, "utf8", function (err, data) {
    if (err) {
      console.error(`Error reading ${path}:\n  ${err}`);
      process.exit(1);
    }
    console.log(data);
  });
}

// Read the path from the command line: `node step1.js one.txt`
const path = process.argv[2];
cat(path);
