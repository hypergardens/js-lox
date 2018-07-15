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

// class FunctionStmt extends Stmt {
//     constructor(name, parameters, body) {
//         super();
//         //      tok , tok[],      Stmt[]
//     }
// }

module.exports = {
    ExpressionStmt,
    PrintStmt
}