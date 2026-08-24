// ES5 Function that takes a variable number of arguments

function filterOutOdds() {
  var nums = Array.prototype.slice.call(arguments);
  return nums.filter(function(num) {
    return num % 2 === 0
  });

// ES2015 Function that takes a variable number of arguments

const filterOutOdds = (...args) => args.filter(v => v % 2 === 0)

// Find min

const findMin = (...args) => Math.min(...args)

findMin(1,4,12,-3) // -3
findMin(1,-1) // -1
findMin(3,1) // 1

// Merge objects

const mergeObjects = (obj1, obj2) => ({...obj1, ...obj2})

doubleAndReturnArgs([1,2,3],4,4) // [1,2,3,8,8]
doubleAndReturnArgs([2],10,4) // [2, 20, 8]

// Slice and Dice - remove and return items

const removeRandom = items => {
  let idx = Math.floor(Math.random() * items.length);
  return [...items.slice(0, idx), ...items.slice(idx + 1)];
}

const extend = (array1, array2) => {
  return [...array1, ...array2];
}

const addKeyVal = (obj, key, val) => {

  let newObj = { ...obj }
  newObj[key] = val;
  return newObj;
}

const removeKey = (obj, key) => {

  let newObj = { ...obj }
  delete newObj[key]
  return newObj;
}

const combine = (obj1, obj2) => {
  return { ...obj1, ...obj2 };
}

const update = (obj, key, val) => {

  let newObj = { ...obj }
  newObj[key] = val;
  return newObj;
}
