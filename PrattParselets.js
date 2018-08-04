const Expr = require('./Expr') 
let { toks } = require('./loxLibs');

class Prefix {
    parse(parser, token) {}
}
class Variable extends Prefix {
    parse(parser, token) {
        return new Expr.Variable(token);
    }
}
class PrefixOperator extends Prefix {
    parse(parser, token) {
        let right = parser.parseExpression();
        return new Expr.Unary(token, right);
    }
}

let precedence = {
    ASSIGNMENT  : 10,
    CONDITIONAL : 20,
    SUM         : 30,
    PRODUCT     : 40,
    EXPONENT    : 50,
    PREFIX      : 60,
    POSTFIX     : 70,
    CALL        : 80,
}

class Infix {
    parse(parser, left, token) {}
    getPrecedence() {}
}
class BinaryOperator extends Infix {
    parse(parser, left, token) {
        let right = parser.parseExpression(this.getPrecedence());
        return new Expr.Binary(left, token, right);
    }
}
class PostfixOperator extends Infix  {
    parse(parser, left, token) {
        let right = parser.parseExpression(this.getPrecedence());
        return new Expr.Unary(left, token);
    }
}
class Plus extends BinaryOperator{
    getPrecedence() {
        return precedence.SUM;
    }
}
class Times extends BinaryOperator{
    getPrecedence() {
        return precedence.PRODUCT;
    }
}
class Conditional extends Infix  {
    parse(parser, left, token) {
        let thenArm = parser.parseExpression();
        parser.consume(toks.COLON, `Expected ':' in conditional operator.`);
        let elseArm = parser.parseExpression();
        return new Expr.Conditional(left, thenArm, elseArm);
    }
}
module.exports = {
    Prefix, Variable, PrefixOperator, Plus, Times, BinaryOperator, PostfixOperator, Conditional
}