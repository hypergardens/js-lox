class Stmt {
    accept(visitor) {
    }
}

class ExpressionStmt extends Stmt {
    constructor(expression) {
        super();
        this.expression = expression;
    }
    accept(visitor) {
        return visitor.visitExpressionStmt(this);
    }
}

class PrintStmt extends Stmt {
    constructor(expression) {
        super();
        this.expression = expression;
    }
    accept(visitor) {
        return visitor.visitPrintStmt(this);
    }
}

class VarStmt extends Stmt {
    constructor(name, initialiser) {
        //      tok,  expr
        super();
        this.name = name;
        this.initialiser = initialiser;
    }
    accept(visitor) {
        return visitor.visitVarStmt(this);
    }
}
class NullStmt extends Stmt {
    constructor() {
        //      tok,  expr
        super();
    }
    accept(visitor) {
        return visitor.visitNullStmt(this);
    }
}

// class FunctionStmt extends Stmt {
//     constructor(name, parameters, body) {
//         super();
//         //      tok , tok[],      Stmt[]
//     }
// }

module.exports = {
    Stmt,
    ExpressionStmt,
    PrintStmt,
    VarStmt,
    NullStmt
}