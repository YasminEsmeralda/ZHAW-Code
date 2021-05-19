
console.log("--- Exercise 3c ---");

let things = ["desk","pencil","mug","chair","lamp"];

// complete the following function so that it writes the following output to the console:
// - "I found <x> at position <i>", where <i> is the index of the element in the array "things"
// - If the array does not contain <x>, the output should be "I did not find that thing"

function findThing(x) {
    var index = (things.indexOf(x));

    if (index > 0) {
        console.log('I found ' + '"' + x + '"' + ' at position ' + index);
    } else {
        console.log("I did not find that thing");
    }
    
}

// Test your program with the following code:
findThing("chair");  // expected output: "I found "chair" at position 3"
findThing("pencil"); // expected output: "I found "pencil" at position 1"
findThing("knife");  // expected output: "I did not find that thing"

console.log("--- End of exercise 3c ---");
