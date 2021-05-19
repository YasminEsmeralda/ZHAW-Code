function prettify(arr) {
    console.log("\n-------------");
    console.log(arr.join(" & \n"));
    console.log("-------------");
}

var characters = ["Luke", "Leia", "Anakin"];
var c1 = characters.map(character => character + " Skywalker");
//prettify(c1);

var c2 = c1.map(character => {
    if (character.includes("Leia")) {
        return "Leia Organa";
    } else {
        return character;
    }
})

c2.push("Yoda", "Rey");

//prettify(c2);

//filter function
var c3 = c2.filter(character => !character.includes("Skywalker"));

prettify(c3);