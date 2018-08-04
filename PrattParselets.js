const Expr = require('./Expr') 
let { toks } = require('./loxLibs');

class Base {
    constructor(precedence) {
        this.precedence = precedence;
    }
}

class Variable extends Base {
    parse(parser, token) {
        return new Expr.Variable(token);
    }
}

class PrefixOperator extends Base {
    parse(parser, token) {
        let right = parser.parseExpression(this.precedence);
        return new Expr.Unary(token, right);
    }
}

class BinaryOperator extends Base {
    constructor(precedence, rightAssoc=false) {
        super(precedence);
        this.rightAssoc = rightAssoc;
    }
    parse(parser, left, token) {
        let right = parser.parseExpression(this.rightAssoc ? this.precedence-1 : this.precedence);
        return new Expr.Binary(left, token, right);
    }
}

class PostfixOperator extends Base  {
    parse(parser, left, token) {
        let right = parser.parseExpression(this.precedence);
        return new Expr.Unary(left, token);
    }
}

class Conditional extends Base  {
    parse(parser, left, token) {
        let thenArm = parser.parseExpression(this.precedence);
        parser.consume(toks.COLON, `Expected ':' in conditional operator.`);
        let elseArm = parser.parseExpression(this.precedence);
        return new Expr.Conditional(left, thenArm, elseArm);
    }
}
module.exports = {
    Variable, PrefixOperator, BinaryOperator, PostfixOperator, Conditional
}