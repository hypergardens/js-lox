class Environment {
    constructor() {
        this.values = {};
    }
    define(name, value) {
        this.values[name] = value;
    }
    lookup() {
        // HACK: this is called get() in the tutorial
    }
}