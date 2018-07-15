const { makeEnum, toks, keywords } = require('./loxLibs')

class Lox {
    run(source="") {
        // HACK: we're just using the components individually.
    }
    static error(token, message) {
        // HACK: line or token as first arg;
        if (Number.isInteger(token)){
            // not token, but line number;
            this.report(token, "", message);
        } else if (token.type == toks.EOF) {
            this.report(token.line, " at end ", message);
        } else {
            this.report(token.line, ` at ${token.lexeme} `, message);
        }
    }
    static report(line, where, message) {
        console.error("[line " + line + "] Error" + where + ": " + message);
        Lox.hadError = true;
    }
    static runtimeError(error) {
        console.error(`[line ${error.token.line}] ${error.message}`)
        Lox.hadRuntimeError = true;
    }
}
Lox.hadError = false;
Lox.hadRuntimeError = false;

module.exports = { Lox };