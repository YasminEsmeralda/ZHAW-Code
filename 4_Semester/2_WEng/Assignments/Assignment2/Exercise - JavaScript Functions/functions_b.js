
console.log("--- Exercise 3b ---");

// Write a function 'getMaximum' that takes 3 numbers as input
// and returns the largest of these 3 numbers.

function getMaximum(x, y, z) {
    var input = [x, y, z];

    if (toString.call(input) !== "[object Array]")
        return false;
    return Math.max.apply(null, input);

}

// Test your program with the following code:
console.log(getMaximum(1, 3, 5));      // expected output: 5
console.log(getMaximum(6, 7, 0));      // expected output: 7
console.log(getMaximum(414, 223, 54)); // expected output: 414

console.log("--- End of exercise 3b ---");
