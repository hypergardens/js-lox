let Token = require('./Token.js');
let { toks } = require('./loxLibs.js');

class BinaryExpr {
    constructor(left, operator, right) {
        this.left = left;
        this.operator = operator;
        this.right = right;
        this.type = 'Binary';
    }
    accept(visitor) {
        return visitor.visitBinaryExpr(this);
    }
}

class UnaryExpr {
    constructor(operator, right) {
        this.operator = operator;
        this.right = right;
        this.type = 'Unary';
    }
    accept(visitor) {
        return visitor.visitUnaryExpr(this);
    }
}

class LiteralExpr {
    constructor(value) {
        this.value = value;
        this.type = 'Literal';
    }
    accept(visitor) {
        return visitor.visitLiteralExpr(this);
    }
}

class GroupingExpr {
    constructor(expression) {
        this.expression = expression;
        this.type = 'Grouping';
    }
    accept(visitor) {
        return visitor.visitGroupingExpr(this);
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
    UnaryExpr, LiteralExpr, BinaryExpr, GroupingExpr
}