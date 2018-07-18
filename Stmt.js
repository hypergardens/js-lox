class Base {
    accept(visitor) {
    }
}

class Expression extends Base {
    constructor(expression) {
        super();
        this.expression = expression;
    }
    accept(visitor) {
        return visitor.visitExpressionStmt(this);
    }
}

class Print extends Base {
    constructor(expression) {
        super();
        this.expression = expression;
    }
    accept(visitor) {
        return visitor.visitPrintStmt(this);
    }
}

class Var extends Base {
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

class If extends Base {
    constructor(condition, thenBranch, elseBranch) {
        //      expr       stmt        stmt
        super();
        this.condition = condition;
        this.thenBranch = thenBranch;
        this.elseBranch = elseBranch;
    }
    accept(visitor) {
        return visitor.visitIfStmt(this);
    }
}

class While extends Base {
    constructor(condition, body) {
        //      expr       stmt
        super();
        this.condition = condition;
        this.body = body;
    }
    accept(visitor) {
        return visitor.visitWhileStmt(this);
    }
}
class Block extends Base {
    constructor(statements) {
        super();
        this.statements = statements;
    }
    accept(visitor) {
        return visitor.visitBlockStmt(this);
    }
}

class Null extends Base {
    constructor() {
        //      tok,  expr
        super();
    }
    accept(visitor) {
        return visitor.visitNullStmt(this);
    }
}

// class FunctionStmt extends Base {
//     constructor(name, parameters, body) {
//         super();
//         //      tok , tok[],      Base[]
//     }
// }

module.exports = {
    Base,
    Expression,
    Print,
    Var,
    Block,
    If,
    While,
    Null
}