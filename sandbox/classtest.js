const Thing = {
    Subthing: class {
        constructor(a, b) {
            console.log(`made a ${a}, ${b} subthing`);
            this.a = a;
            this.b = b;
        }
        log() {
            console.log(`this is a ${this.a}, ${this.b} subthing`);
        }
    }
}

let sub1 = new Thing.Subthing(4, 3);
let sub2 = new Thing.Subthing(5, 6);
sub1.log();
sub2.log();