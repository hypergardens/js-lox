let { LoxRuntimeError } = require('./LoxRuntimeError');
class Environment {
    constructor() {
        this.values = {};
    }
    define(name, value) {
        // str
        this.values[name] = value;
    }
    lookup(token) {
        // HACK: this is called get() in the tutorial
        if (this.values[token.lexeme] !== undefined) {
            return this.values[token.lexeme];
        }
        throw new LoxRuntimeError(token, `Undefined variable ${token.lexeme}.`)
    }
}

module.exports = { Environment };