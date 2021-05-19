class Person {
    constructor (name, last) {
        this.name = name;
        this.last = last;
    }

    //function syntax
    sayHello() {
        console.log("Hello, I'm " + this.name);
    }
}

// bei vielen Objekten ist diese Lösung eleganter
var p1 = new Person("Yasmin", "Lützelschwab");
var p2 = new Person("Thomas", "Nagy");

console.log(p1);
console.log(p2);

p1.sayHello();
p2.sayHello();