class Toy {
    constructor(name, volume) {
        this.name = name;
        this.volume = volume;
    }
}

class Box {
    constructor(name, volume) {
        this.name = name;
        this.volume = volume;
        this.currentVolume = 0;
        this.toys = [];
    }

    addToy(toy) {
        if ((this.currentVolume + toy.volume) <= this.volume) {
            this.toys.push(toy);
            this.currentVolume += toy.volume;
        } else {
            console.log("Not enough space for toy: " + toy.name);
        }
    }

    printToys() {
        console.log(this.name + "-box contains:");
        for (let toy of this.toys) {
            console.log("- " + toy.name);
        }
    }
}

// create the 2 boxes
var box1 = new Box("Animals", 20);
var box2 = new Box("Cars", 15);

// create the 3 toys and add them to the first box
box1.addToy(new Toy("Teddy", 13));
box1.addToy(new Toy("Monkey", 5));
box1.addToy(new Toy("Elephant", 18));

// print the content of the first box
box1.printToys();

// create the 3 toys and add them to the second box
box2.addToy(new Toy("Bear", 5));
box2.addToy(new Toy("Car", 3));

// print the content of the second box
box2.printToys();