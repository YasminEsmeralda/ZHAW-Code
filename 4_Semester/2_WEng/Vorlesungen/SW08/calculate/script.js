function calculate() {
    // Daten werden IMMER als String ausgelesen

    //Wert aus Element x speichern
    let x = parseFloat(document.getElementById("x").value);

    //Wert aus Element y speichern
    let y = parseFloat(document.getElementById("y").value);

    //Wert aus Element operation speichern
    let operation = document.getElementById("operation").value;

    let result = "Please select an operation";

    if (operation == "Add") {
        result = x + y;
    } else if (operation == "Multiply") {
        result = x * y;
    }
    
    document.getElementById("result").innerHTML = result;
}