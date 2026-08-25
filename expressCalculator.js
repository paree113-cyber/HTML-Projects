// Core requirements

const express = require('express');
const app = express();
const ExpressError = require('./expressError');

const { convertAndValidateNumsArray, findMode, findMean, findMedian } = require('./helpers');

app.get('/mean', function(req, res, next) {
  if (!req.query.nums) {
    throw new ExpressError('You must pass a query key of nums with a comma-separated list of numbers.', 400)
  }
  let numsAsStrings = req.query.nums.split(',');
  let nums = convertAndValidateNumsArray(numsAsStrings);
  if (nums instanceof Error) {
    throw new ExpressError(nums.message);
  }


  let result = {
    operation: "mean",
    result: findMean(nums)
  }

  return res.send(result);
});

app.get('/median', function(req, res, next) {
  if (!req.query.nums) {
    throw new ExpressError('You must pass a query key of nums with a comma-separated list of numbers.', 400)
  }
  let numsAsStrings = req.query.nums.split(',');
  let nums = convertAndValidateNumsArray(numsAsStrings);
  if (nums instanceof Error) {
    throw new ExpressError(nums.message);
  }

  let result = {
    operation: "median",
    result: findMedian(nums)
  }

  return res.send(result);
  
});

app.get('/mode', function(req, res, next) {
  if (!req.query.nums) {
    throw new ExpressError('You must pass a query key of nums with a comma-separated list of numbers.', 400)
  }
  let numsAsStrings = req.query.nums.split(',');
  let nums = convertAndValidateNumsArray(numsAsStrings);
  if (nums instanceof Error) {
    throw new ExpressError(nums.message);
  }

  let result = {
    operation: "mode",
    result: findMode(nums)
  }

  return res.send(result);

 
});

app.use(function (req, res, next) {
  const err = new ExpressError("Not Found",404);
  return next(err);
});

app.use(function (err, req, res, next) {
  res.status(err.status || 500);

  return res.json({
    error: err,
    message: err.message
  });
});


app.listen(3000, function() {
  console.log(`Server starting on port 3000`);
});


// Computations - frequency counter from an array

function createFrequencyCounter(arr) {
  return arr.reduce(function(acc, next) {
    acc[next] = (acc[next] || 0) + 1;
    return acc;
  }, {});
}

// Find common element

function findMode(arr) {
  let freqCounter = createFrequencyCounter(arr);

  let count = 0;
  let mostFrequent;

  for (let key in freqCounter) {
    if (freqCounter[key] > count) {
      mostFrequent = key;
      count = freqCounter[key];
    }
  }

  return +mostFrequent;
}

function convertAndValidateNumsArray(numsAsStrings) {
  let result = [];

  for (let i = 0; i < numsAsStrings.length; i++) {
    let valToNumber = Number(numsAsStrings[i]);

    if (Number.isNaN(valToNumber)) {
      return new Error(
        `The value '${numsAsStrings[i]}' at index ${i} is not a valid number.`
      );
    }

    result.push(valToNumber);
  }
  return result;
}

function findMean(nums){
  if(nums.length === 0) return 0;
  return nums.reduce(function (acc, cur) {
    return acc + cur;
  }) / nums.length
}

function findMedian(nums){

  nums.sort((a, b) => a - b);

  let middleIndex = Math.floor(nums.length / 2);
  let median;

  if (nums.length % 2 === 0) {
    median = (nums[middleIndex] + nums[middleIndex - 1]) / 2;
  } else {
    median = nums[middleIndex];
  }
  return median
}



module.exports = {
  createFrequencyCounter,
  findMean,
  findMedian,
  findMode,
  convertAndValidateNumsArray
};


// Testing

const {
  findMean,
  findMedian,
  findMode,
} = require("./helpers");

describe("#findMedian", function(){
  it("finds the median of an even set", function(){ 
    expect(findMedian([1, -1, 4, 2])).toEqual(1.5)
  })
  it("finds the median of an odd set", function () { 
    expect(findMedian([1, -1, 4])).toEqual(1)
  })
})

describe("#findMean", function () {
  it("finds the mean of an empty array", function () { 
    expect(findMean([])).toEqual(0)
  })
  it("finds the mean of an array of numbers", function () { 
    expect(findMean([1,-1,4,2])).toEqual(1.5)
  })
})

describe("#findMode", function () {
  it("finds the mode", function () { 
    expect(findMode([1,1,1,2,2,3])).toEqual(1)
  })
})

// Error codes - extends the normal JS error so we can add a status

class ExpressError extends Error {
  constructor(message, status) {
    super();
    this.message = message;
    this.status = status;
    console.error(this.stack);
  }
}


module.exports = ExpressError;

// Working project

{
  "name": "solution-part-1",
  "version": "1.0.0",
  "main": "app.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "description": "",
  "dependencies": {
    "express": "^4.16.3"
  }
}

// Further Study

const express = require('express');
const fs = require('fs');
const app = express();
const ExpressError = require('./expressError');

const { convertAndValidateNumsArray, findMode, findMean, findMedian } = require('./helpers');

/** Further study: save a result object to results.json with a timestamp. */
function saveToFile(result) {
  let toSave = Object.assign({}, result, { timestamp: new Date().toISOString() });
  fs.writeFileSync('results.json', JSON.stringify(toSave, null, 2));
}

/** Further study: honor the Accept header - return html or json. */
function sendResult(req, res, result) {
  // optional ?save=true writes the result to a file
  if (req.query.save === 'true') {
    saveToFile(result);
  }

  if (req.accepts('html') && !req.accepts('json')) {
    let items = '';
    for (let key in result) {
      items += `<li>${key}: ${result[key]}</li>`;
    }
    return res.send(`<html><body><ul>${items}</ul></body></html>`);
  }

  return res.json(result);
}

app.get('/mean', function(req, res, next) {
  if (!req.query.nums) {
    throw new ExpressError('You must pass a query key of nums with a comma-separated list of numbers.', 400)
  }
  let numsAsStrings = req.query.nums.split(',');
  let nums = convertAndValidateNumsArray(numsAsStrings);
  if (nums instanceof Error) {
    throw new ExpressError(nums.message);
  }

  let result = {
    operation: "mean",
    value: findMean(nums)
  }

  return sendResult(req, res, result);
});

app.get('/median', function(req, res, next) {
  if (!req.query.nums) {
    throw new ExpressError('You must pass a query key of nums with a comma-separated list of numbers.', 400)
  }
  let numsAsStrings = req.query.nums.split(',');
  let nums = convertAndValidateNumsArray(numsAsStrings);
  if (nums instanceof Error) {
    throw new ExpressError(nums.message);
  }

  let result = {
    operation: "median",
    value: findMedian(nums)
  }

  return sendResult(req, res, result);
});

app.get('/mode', function(req, res, next) {
  if (!req.query.nums) {
    throw new ExpressError('You must pass a query key of nums with a comma-separated list of numbers.', 400)
  }
  let numsAsStrings = req.query.nums.split(',');
  let nums = convertAndValidateNumsArray(numsAsStrings);
  if (nums instanceof Error) {
    throw new ExpressError(nums.message);
  }

  let result = {
    operation: "mode",
    value: findMode(nums)
  }

  return sendResult(req, res, result);
});

/** Further study: /all does all three operations at the same time. */
app.get('/all', function(req, res, next) {
  if (!req.query.nums) {
    throw new ExpressError('You must pass a query key of nums with a comma-separated list of numbers.', 400)
  }
  let numsAsStrings = req.query.nums.split(',');
  let nums = convertAndValidateNumsArray(numsAsStrings);
  if (nums instanceof Error) {
    throw new ExpressError(nums.message);
  }

  let result = {
    operation: "all",
    mean: findMean(nums),
    median: findMedian(nums),
    mode: findMode(nums)
  }

  return sendResult(req, res, result);
});

app.use(function (req, res, next) {
  const err = new ExpressError("Not Found", 404);

  return next(err);
});

app.use(function (err, req, res, next) {
  res.status(err.status || 500);

  return res.json({
    error: err,
    message: err.message
  });
});

app.listen(3000, function() {
  console.log(`Server starting on port 3000`);
});
