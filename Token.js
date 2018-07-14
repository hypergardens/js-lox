let { toks } = require('./loxLibs.js');
class Token {
    constructor(type, lexeme, literal, line) {
        if (toks[type] === undefined) {
            throw "Undefined token type " + type;
        }
        this.type = type;
        this.lexeme = lexeme;
        this.literal = literal;
        this.line = line;
    }
    toString() {
        return this.type + " " + this.lexeme + this.literal;
    }
}

module.exports = Token;