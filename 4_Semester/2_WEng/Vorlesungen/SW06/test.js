function c(f, i) {
    var p = f(i);
    console.log(f(p));
}

c((x) => x * x, y);