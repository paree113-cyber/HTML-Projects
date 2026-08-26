// Same key and value

function createInstructor(firstName, lastName){
  return {
    firstName: firstName,
    lastName: lastName
  }
}

// Same key and value ES2015

function createInstructor(firstName, lastName){
  return {
    firstName,
    lastName
  }
}

// Computed property names

var favoriteNumber = 42;

var instructor = {
  firstName: "Colt"
}

instructor[favoriteNumber] = "That is my favorite!"

// Computer property names ES2105

let favoriteNumber = 42;

const instructor = {
  firstName: "Colt",
  [favoriteNumber]: "That is my favorite!"
}

// Object methods

var instructor = {
  firstName: "Colt",
  sayHi: function(){
    return "Hi!";
  },
  sayBye: function(){
    return this.firstName " + "says bye!";
  }
}

// Object methods ES2015

const instructor = {
  firstName: "Colt",
  sayHi(){
    return "Hi!";
  },
  sayBye(){
    return this.firstName + " says bye!";
  }
}

// createAnimal function

const d = createAnimal("dog", "bark", "Woooof!")
// {species: "dog", bark: ƒ}
d.bark()  //"Woooof!"

const s = createAnimal("sheep", "bleet", "BAAAAaaaa")
// {species: "sheep", bleet: ƒ}
s.bleet() //"BAAAAaaaa"

function createAnimal(species, verb, noise){
  return {
    species,
    verb{
      return noise;
    }
  }
}
