
var pioneer10 = {
    name: "Pioneer 10",
    missionDuration: {
        from: 1972,
        to: 2003
    },
    targets: ["planet5"], 
    success: Boolean(true),
    nation: "USA"
}

var voyager1 = {
    name: "Voyager 1",
    missionDuration: {
        from: 1977,
        to: null
    },
    targets: ["planet5","planet6"], 
    success: Boolean(true),
    nation: "USA"
}

var nozomi = {
    name: "Nozomi",
    missionDuration: {
        from: 1998,
        to: 2003
    },
    targets: ["planet4"],  
    success: Boolean(false),
    nation: "Japan"
}

var spaceProbes = [pioneer10, voyager1, nozomi];

var planets = {
    planet4: "Mars",
    planet5: "Jupiter",
    planet6: "Saturn",
}

// this functions returns true if it finds the value "val" in the array "arr"
function isInArray(val, arr) {
    for (e of arr) {
        if (e === val) {
            return true;
        }
    }
    return false;
}

function showProbesByDestination(destination) {
    var sLines = "---------------------------------";
    var sDestination = "- Destination: " + planets[destination];
    var sSuccess = "This mission was a ";
    var duration = "";

    console.log(sLines);
    console.log(sDestination);
    console.log(sLines);

    for (let index = 0; index < spaceProbes.length; index++) {
        if (isInArray(destination, spaceProbes[index].targets)) {
            console.log("Name    : " + spaceProbes[index].name);
            console.log("Nation  : " + spaceProbes[index].nation);

            if (spaceProbes[index].missionDuration.to == null) {
                duration = "Still on its mission.";
            } else {
                duration = spaceProbes[index].missionDuration.to - spaceProbes[index].missionDuration.from + " years";
            }
            console.log("Duration: " + duration);

            if (spaceProbes[index].success) {
                console.log(sSuccess + " success!" + "\n");
            }else{
                console.log(sSuccess + " failure." + "\n");
            }
        }
    }
}

// Test your program with the following code.
showProbesByDestination("planet4");
showProbesByDestination("planet5");
showProbesByDestination("planet6");

// Expected output of this program:

// ---------------------------------
// - Destination: Mars
// ---------------------------------
// Name    : Nozomi
// Nation  : Japan
// Duration: 5 years
// This mission was a failure.
// 
// ---------------------------------
// - Destination: Jupiter
// ---------------------------------
// Name    : Pioneer 10
// Nation  : USA
// Duration: 31 years
// This mission was a success!
// 
// Name    : Voyager 1
// Nation  : USA
// Duration: Still on its mission.
// This mission was a success!
// 
// ---------------------------------
// - Destination: Saturn
// ---------------------------------
// Name    : Voyager 1
// Nation  : USA
// Duration: Still on its mission.
// This mission was a success!
