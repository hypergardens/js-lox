let Token = require('./Token.js');
let { toks } = require('./loxLibs.js');

class Base {
    accept(visitor) {
    }
}

class Logical extends Base {
    constructor(left, operator, right) {
        super();
        this.left = left;
        this.operator = operator;
        this.right = right;
        this.type = 'Logical';
    }
    accept(visitor) {
        return visitor.visitLogicalExpr(this);
    }
}

class Binary extends Base {
    constructor(left, operator, right) {
        super();
        this.left = left;
        this.operator = operator;
        this.right = right;
        this.type = 'Binary';
    }
    accept(visitor) {
        return visitor.visitBinaryExpr(this);
    }
}

class Unary extends Base {
    constructor(operator, right) {
        super();
        this.operator = operator;
        this.right = right;
        this.type = 'Unary';
    }
    accept(visitor) {
        return visitor.visitUnaryExpr(this);
    }
}

class Literal extends Base {
    constructor(value) {
        super();
        this.value = value;
        this.type = 'Literal';
    }
    accept(visitor) {
        return visitor.visitLiteralExpr(this);
    }
}

class Grouping extends Base {
    constructor(expression) {
        super();
        this.expression = expression;
        this.type = 'Grouping';
    }
    accept(visitor) {
        return visitor.visitGroupingExpr(this);
    }
}

class Variable extends Base {
    constructor(name) {
        //      tok
        super();
        this.name = name;
    }
    accept(visitor) {
        return visitor.visitVariableExpr(this);
    }
}

class Assign extends Base {
    constructor(name, value) {
        //      tok , expr
        super();
        this.name = name;
        this.value = value;
    }
    accept(visitor) {
        return visitor.visitAssignExpr(this);
    }
}

function createExprClass(name, fields) {
    class GeneratedExpr {
        constructor(...values) {
            for (let i=0; i<fields.length; i++) {
                this[fields[i]] = values[i];
            }
            this.expType = name;
        }
        accept(visitor) {
            return visitor['visit' + name](this);
        }
    }
    return GeneratedExpr;
}

// const UnaryExpr = createExprClass('UnaryExpr', ['operator', 'right']);
// const LiteralExpr = createExprClass('LiteralExpr', ['value']);
// const BinaryExpr = createExprClass('BinaryExpr', ['left', 'operator', 'right']);
// const GroupingExpr = createExprClass('GroupingExpr', ['expression'])

// let astPrinter = new AstPrinter();
// let expression = new BinaryExpr(
//     new UnaryExpr(
//         new Token(toks.MINUS, "-", null, 1),
//         new LiteralExpr(123)),
//     new Token(toks.STAR, "*", null, 1),
//     new GroupingExpr(
//         new LiteralExpr(45.67)));
// console.log(astPrinter.print(expression));

// console.log(Object.getOwnPropertyNames(Literal.prototype));

module.exports = {
    Assign,
    Base,
    Unary,
    Logical,
    Literal,
    Binary,
    Grouping,
    Variable
}