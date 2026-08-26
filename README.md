# HTML Projects

A collection of projects built throughout my coursework, spanning JavaScript
fundamentals through full-stack applications.

## A Note on Structure

The projects in this repo vary in how they're organized, and that's intentional.
Most of the earlier work was small, focused exercises built to practice specific
JavaScript and web concepts, one topic at a time. Those didn't require a full
application stack, so they were committed as standalone script files (mixed-media
code) rather than fully scaffolded projects.

The later projects are complete full-stack applications with a proper structure:
an Express backend, organized frontend scripts, package management, and API
integration.

I was also still learning to use GitHub during this period, so some of the earlier
commits and folder layouts look a little clunky. I've left them as they were rather
than cleaning them up after the fact, since they reflect how my workflow and
understanding grew over time.

## Full-Stack Projects (own backend)

- **Checkers** — Interactive 2D Checkers game with an Express backend, DOM
  frontend, save/resume via API + JSON, and a Gemini-powered CPU opponent.
  See its folder's README.
- **expressCalculator** — Express API that computes mean, median, and mode from
  query parameters.

## Frontend Apps (UI + external API)

- **giphyPartyV2** — GIF search app built with modular browser JavaScript
  (`api.js`, `ui.js`, `storage.js`) that calls the Giphy API.
- **giphyParty** — Earlier, simpler version of the GIF search app.
- **Promises** — Browser exercises using fetch/promises (Pokémon, cards, numbers).

## Node / CLI Exercises

- **Node.js** — Node file-system and command-line practice.

## JavaScript Fundamentals & Exercises

These are focused, single-concept practice files:

- **Promises.js** — Promises and async patterns
- **arrowFunctions.js** — Arrow function syntax
- **destructuring.js** — Array/object destructuring
- **restSpread.js** — Rest and spread operators
- **let.Const** — Block-scoped variable declarations
- **objectEnhancement.js** — ES6 object shorthand/enhancements
- **mapsSet.js** — Map and Set data structures
- **forEach.map.filter.js** — Core array iteration methods
- **reduce.js** — Array reduce
- **find.findIndex.js** — Finding elements in arrays
- **someEvery.js** — Array boolean tests
- **howWebWorks** — Notes/exercise on how the web works

## Running

Full-stack projects (like Checkers) have their own setup instructions in their
folder's README — typically `npm install` then `npm start`. The fundamentals
files are standalone scripts you can run with `node <filename>` or read directly.
