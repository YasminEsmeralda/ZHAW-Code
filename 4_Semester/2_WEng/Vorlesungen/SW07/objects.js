var p1 = {
    name: "Yasmin",
    lastname: "Lützelschwab",
    sayHello: function() {
        console.log("Hello, I'm " + this.name) // attribut vom aktuellen objekt
    }
}
//console.log(p1.name);
//p1.sayHello();

//nachträglich Sachen zum Objekt hinzufügen
p1.printLast = function(){
    console.log("My lastname is: " + this.lastname)
}
//p1.printLast();

//p2 ist eine Reference auf p1 -> keine Objektkopie
var p2 = p1;
//ändert auch den Namen von p1
p2.name = "Thomas";
p1.sayHello();
p2.sayHello();