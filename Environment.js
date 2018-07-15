let { LoxRuntimeError } = require('./LoxRuntimeError');
let { Lox } = require('./Lox');
class Environment {
    constructor() {
        this.values = {};
    }
    define(token, value) {
        // str
        this.values[token] = value;
    }
    lookup(token) {
        // HACK: this is called get() in the tutorial
        if (this.values[token.lexeme] !== undefined) {
            return this.values[token.lexeme];
        }
        // Lox.error(token, `Undefined variable ${token.lexeme}.`);
        // CARE: sometimes this doesn't work as intended
        throw new LoxRuntimeError(token, `Undefined variable ${token.lexeme}.`);
    }
    assign(token, value) {
        if (this.values[token.lexeme] !== undefined) {
            this.values[token.lexeme] = value;
            return;
        }

        throw new LoxRuntimeError(token, `Undefined variable ${token.lexeme}.`);
    }
}

module.exports = { Environment };