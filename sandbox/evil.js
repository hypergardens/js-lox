// testing out some eval macros

function makeOpMacro(op) {
    return eval(`(a, b) => (a ${op} b)`);
}

let add = makeOpMacro('+');
let sub = makeOpMacro('-');
console.log(add(2, 5))
console.log(sub(2, 5))