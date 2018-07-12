let { toks } = require('./loxLibs.js');
class Token {
    constructor(tokenType, lexeme, literal, line) {
        if (toks[tokenType] === undefined) {
            throw "Undefined token type " + tokenType;
        }
        this.tokenType = tokenType;
        this.lexeme = lexeme;
        this.literal = literal;
        this.line = line;
    }
    toString() {
        return this.tokenType + " " + this.lexeme + this.literal;
    }
}

module.exports = Token;