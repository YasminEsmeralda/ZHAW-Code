
console.log("--- Exercise 4a ---");

// In this exercise you will write a program that calculates the travel time for
// two different types of drivers: slow and fast. Follow the instructions below.

// Complete this function so that it returns the time needed to travel the 
// distance 'distanceKm' at 130 kilometers per hour
function driveFast(distanceKm) {
    console.log("out of my way!");

    var kmPerHour = 130;
    return distanceKm/kmPerHour;
}

// Test the function driveFast() with the following code:
console.log(driveFast(65)); // expected output: 
                            // out of my way!
                            // 0.5 

// Complete this function so that it returns the time needed to travel the 
// distance 'distanceKm' at 50 kilometers per hour
function driveSlow(distanceKm) {
    console.log("slow down...");

    var kmPerHour = 50;
    return distanceKm/kmPerHour;

}

// Test the function driveSlow() with the following code:
console.log(driveSlow(75)); // expected output: 
                            // slow down...
                            // 1.5 

// Complete this function so that it writes the travel time to the
// console in the following format:
// "Travel time: <x> hours"
// (where <x> is the travelTime calculated with 'travelfunction' and 'distanceKm')
function calculateTravelTime(travelFunction, distanceKm) {
    
    var hours = travelFunction(distanceKm);

    console.log("Travel Time: " + hours + " hours");
} 

// Test your program with the following code:
calculateTravelTime(driveFast, 260); // expected output: 
                                     // out of my way!
                                     // Travel time: 2 hours
calculateTravelTime(driveSlow, 260); // expected output: 
                                     // slow down...
                                     // Travel time: 5.2 hours


console.log("--- End of exercise 4a ---");
