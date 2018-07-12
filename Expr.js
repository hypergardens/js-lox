let Token = require('./Token.js');
let { toks } = require('./loxLibs.js');

// an expression visitor
class AstPrinter {
    print(expr) {
        return expr.accept(this);
    }
    visitBinaryExpr(expr) {
        return this.parenthesise(expr.operator.lexeme, expr.left, expr.right);
    }
    visitGroupingExpr(expr) {
        return this.parenthesise("group", expr.expression);
    }
    visitLiteralExpr(expr) {
        if (expr.value == null) return "nil";
        // TODO: check if toString() is necessary
        return expr.value;
    }
    visitUnaryExpr(expr) {
        return this.parenthesise(expr.operator.lexeme, expr.right);
    }
    parenthesise(name, ...exprs) {
        let strArr = [];
        strArr.push("(" + name);
        for (let expr of exprs) {
            strArr.push(" ");
            strArr.push(expr.accept(this));
        }
        strArr.push(')');
        return strArr.join('');
    }
}

// class Binary {
//     constructor(left, operator, right) {
//         this.left = left;
//         this.operator = operator;
//         this.right = right;
//         this.expType = 'Binary';
//     }
//     accept(visitor) {
//         visitor.visitBinaryExpr(this);
//     }
// }

function createExprClass(name, fields) {
    class GeneratedExpr {
        constructor(...values) {
            for (let i=0; i<fields.length; i++) {
                this[fields[i]] = values[i];
            }
            this.expType = name;
        }
        accept(visitor) {
            return visitor['visit' + name + 'Expr'](this);
        }
    }
    return GeneratedExpr;
}

const Unary = createExprClass('Unary', ['operator', 'right']);
const Literal = createExprClass('Literal', ['value']);
const Binary = createExprClass('Binary', ['left', 'operator', 'right']);
const Grouping = createExprClass('Grouping', ['expression'])
console.log(Unary);
let un = new Unary('a', '-');
let bi = new Binary('a', '-', 'b');

let astPrinter = new AstPrinter();
let expression = new Binary(
    new Unary(
        new Token(toks.MINUS, "-", null, 1),
        new Literal(123)),
    new Token(toks.STAR, "*", null, 1),
    new Grouping(
        new Literal(45.67)));

console.log(astPrinter.print(expression));

// console.log(Object.getOwnPropertyNames(Literal.prototype));

class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.current = 0;
    }
    expression() {
        return this.equality();
    }
    
    equality() {
        let expr = this.comparison();
        // while (match())
            
    }
    
}