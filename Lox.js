const { makeEnum, toks, keywords } = require('./loxLibs')

class Lox {
    run(source="") {
    }
    // runLine() {
    //     const readline = require('readline');

    //     this.run(readline());
    // }
    static error(token, message) {
        if (token.type == toks.EOF) {
            this.report(token.line, " at end ", message);
        } else {
            this.report(token.line, ` at ${token.lexeme} `, message);
        }
    }
    static report(line, where, message) {
        console.log("[line " + line + "] Error" + where + ": " + message);
        Lox.hadError = true;
    }
}

module.exports = { Lox };