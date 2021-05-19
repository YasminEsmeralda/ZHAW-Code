
var secretNumber;
var range = 10;
var attempts = 0;

function setMessage(message) {
    // TODO: show the message in the element with id="message"
    document.getElementById("message").innerHTML = message;
}

setMessage("This is a Test Message");

function initGame(){
    secretNumber = Math.floor(Math.random() * range) + 1;

    // TODO: Set the value of the input element to an empty string "".
    document.getElementById("nr").value = "";
    document.getElementById("range").innerHTML = range;
    document.getElementById("attempts").innerHTML = attempts;
    
    // TODO: Set the message to an empty string "".
    setMessage("");

    // TODO: Enable the "Guess" button and disable the "Reset" button. 
    //       This can be done by setting the disabled attribute to true or false. 
    //       E.g. if you have an element <button id="myButton">, the following 
    //       code will disable the button: 
    //       document.getElementById("myButton").disabled = true;
    document.getElementById("reset").disabled = true;
}

function predict(){

    var nr = parseInt(document.getElementById("nr").value);

    if (isNaN(nr)) {
        setMessage("Please enter a number");
    } else if (nr <= range && nr >= 1) {
        if (nr < secretNumber) {
            setMessage("Your guess it too low");
        } else if (nr > secretNumber) {
            setMessage("Your guess it too high");
        } else if (nr == secretNumber) {
            setMessage("Excellent!")
        }
        attempts ++;
    } else {
        setMessage("Your Number must be between 1 and " + range);
    }
    
    document.getElementById("reset").disabled = false;
    document.getElementById("attempts").innerHTML = attempts;
        
    // TODO: Implement the game as described in the task description.
}

function changeRange() {
    if (range == 10) {
        secretNumber = Math.floor(Math.random() * 1000) + 1;
        range = 1000;
    } else {
        secretNumber = Math.floor(Math.random() * 10) + 1;
        range = 10;
    }
    initGame(); 
}

initGame(); 