const { LoxCallable } = require('./LoxCallable')
const { Environment } = require('./Environment')

class LoxFunction extends LoxCallable {
    constructor(declaration) {
        super();
        //      Stmt.Function:
        // (FUN twice (a b) ((EXPR (* a 1)) (EXPR (* b 3))))
        this.declaration = declaration;
    }
    loxCall(interpreter, args) {
        let environment = new Environment(interpreter.globals);
        for (let i=0; i<this.declaration.parameters.length; i++) {
            environment.define(this.declaration.parameters[i].lexeme, args[i]);
        }
        try {
            interpreter.executeBlock(this.declaration.body, environment);
        } catch (e) {
            if (e.isReturn) {
                return e.value
            } else throw e;
        }
        return null;
    }
    arity() {
        return this.declaration.parameters.length;
    }
    toString() {
        return `<fn ${this.declaration.name.lexeme}>`;
    }
}

module.exports = { LoxFunction };