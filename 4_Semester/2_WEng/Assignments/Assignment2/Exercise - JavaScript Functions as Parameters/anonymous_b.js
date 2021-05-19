
console.log("--- Exercise 4b ---");

let add = (a, b) => { return a + b };
let divide = (a, b) => { return a / b };
let multiply = (a, b) => { return a * b };

// Complete the following function 'compute'
// This function uses 3 other functions and 2 values to make a calculation as follows: 
//
// - Step 1: Make a calculation using the function 'func1' and the values x and y.
//   For example:
//      - 'func1' is 'multiply'
//      - x is 3
//      - y is 4
//      --> result is 12
//
// - Step 2: Make a calculation using the function 'func2' and the values x and y.
//   For example:
//      - 'func2' is 'divide'
//      - x is 3
//      - y is 4
//      --> result is 0.75
//
// - Step 3: Make a calculation using the function 'func3' and the results of the 
//   previous steps and return this value.
//   For example:
//      - 'func3' is 'add'
//      - result of step 1 was 12
//      - result of step 2 was 0.75
//      --> return value is 12.75 
function compute(func1, func2, func3, x, y) {
    return func3(func1(x, y), func2(x, y));
}

// Test your program with the following code:
console.log(compute(add, add, add, 3, 4));                // (x+y)+(x+y) -> expected output: 14 
console.log(compute(divide, multiply, add, 3, 4));        // (x/y)+(x*y) -> expected output: 12.75 
console.log(compute(multiply, divide, multiply, 3, 4));   // (x*y)*(x/y) -> expected output: 9
console.log(compute(divide, divide, add, 3, 4));          // (x/y)+(x/y) -> expected output: 1.5 
console.log(compute(multiply, multiply, multiply, 3, 4)); // (x*y)*(x*y) -> expected output: 144 

console.log("--- End of exercise 4b ---");
