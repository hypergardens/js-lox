let { LoxRuntimeError } = require('./LoxRuntimeError');
let { Lox } = require('./Lox');
class Environment {
    constructor(enclosing=null) {
        this.values = {};
        this.enclosing = enclosing;
    }
    define(token, value) {
        // str
        this.values[token] = value;
    }
    lookup(token) {
        // get variable name in scope
        if (this.values[token.lexeme] !== undefined) {
            return this.values[token.lexeme];
        }
        // look in higher scope
        if (this.enclosing !== null) {
            return this.enclosing.lookup(token);
        }
        // Lox.error(token, `Undefined variable ${token.lexeme}.`);
        // CARE: sometimes this doesn't work as intended
        throw new LoxRuntimeError(token, `Undefined variable ${token.lexeme}.`);
    }
    assign(token, value) {
        // assign to variable name in scope
        if (this.values[token.lexeme] !== undefined) {
            this.values[token.lexeme] = value;
            return;
        }
        // look in higher scope and assign there
        if (this.enclosing !== null) {
            this.enclosing.assign(token, value);
            return
        }

        throw new LoxRuntimeError(token, `Assigning to undefined variable ${token.lexeme}.`);
    }
}

module.exports = { Environment };