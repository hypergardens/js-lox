let Expr = require('./Expr');
let Stmt = require('./Stmt');
let { toks } = require('./loxLibs');
let { Lox } = require('./Lox');
let Parselets = require('./PrattParselets');


let PRECEDENCE = {
    ASSIGNMENT  : 10,
    CONDITIONAL : 20,
    SUM         : 30,
    PRODUCT     : 40,
    EXPONENT    : 50,
    PREFIX      : 60,
    POSTFIX     : 70,
    CALL        : 80,
}

let code = `a+b ? c+d*e : -c`;
class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.current = 0;
        this.prefixParselets = {};
        this.infixParselets = {};

        this.registerPrefixParselet(toks.IDENTIFIER, new Parselets.Variable(PRECEDENCE.PREFIX));
        this.prefix(toks.MINUS);
        this.prefix(toks.PLUS);
        this.prefix(toks.TILDE);
        this.prefix(toks.BANG);

        this.registerInfixParselet(toks.QMARK, new Parselets.Conditional(PRECEDENCE.CONDITIONAL));
        this.binary(toks.PLUS, PRECEDENCE.SUM);
        this.binary(toks.STAR, PRECEDENCE.PRODUCT);
        this.binary(toks.CARET, PRECEDENCE.EXPONENT, true);
    }
    prefix(tokenType) {
        this.registerPrefixParselet(tokenType, new Parselets.PrefixOperator(PRECEDENCE.PREFIX));
    }
    binary(tokenType, precedence, rightAssoc=false) {
        this.registerInfixParselet(tokenType, new Parselets.BinaryOperator(precedence, rightAssoc));
    }
    registerPrefixParselet(tokenType, parselet) {
        this.prefixParselets[tokenType] = parselet;
    }
    registerInfixParselet(tokenType, parselet) {
        this.infixParselets[tokenType] = parselet;
    }
    parseExpression(precedence=0) {
        let token = this.advance();
        console.log(`token: ${token}`);
        let prefixParselet = this.prefixParselets[token.type];
        if (prefixParselet == undefined) throw `Could not parse '${token.lexeme}'.`;
        // process initial prefix: `3 | +3 | ~a ...`
        let left = prefixParselet.parse(this, token);
        
        while (precedence < this.getPrecedence()) {
            token = this.peek();
            // look at the next token to determine the parselet
            let infixParselet = this.infixParselets[token.type];
            if (infixParselet == undefined) return left;
            this.advance();
            left = infixParselet.parse(this, left, token);
        }
        return left;
    }
    getPrecedence() {
        let infixParselet = this.infixParselets[this.peek().type];
        if (infixParselet != undefined) return infixParselet.precedence;
        return 0;
    }
    // primary() {
    //     if (this.match(toks.FALSE)) return new Expr.Literal(false);
    //     if (this.match(toks.TRUE)) return new Expr.Literal(true);
    //     if (this.match(toks.NULL)) return new Expr.Literal(null);
    //     if (this.match(toks.NUMBER, toks.STRING)){
    //         return new Expr.Literal(this.previous().literal);
    //     }
    //     if (this.match(toks.IDENTIFIER)) {
    //         return new Expr.Variable(this.previous());
    //     }
    //     throw this.error(this.peek(), `Expected primary instead of ${this.peek().lexeme}`);
    // }
    match(...types) {
        for (let type of types) {
            // console.log('type checking:', type);
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false; 
    }

    consume(type, message) {
        if (this.check(type)) return this.advance();

        throw this.error(this.peek(), message);
    }

    check(tokenType) {
        if (this.isAtEnd()) return false;
        return this.peek().type == tokenType;
    }

    advance() {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }

    isAtEnd() {
        return this.peek().type == toks.EOF;
    }

    peek() {
        return this.tokens[this.current];
    }

    previous() {
        return this.tokens[this.current - 1];
    }

    error(token, message) {
        error(token, message);
        return new ParseError();
    }
    synchronise() {
        this.advance();
        throw `not implemented`;
        while (!this.isAtEnd()) {
            switch (this.peek().type) {
                case toks.LEFT_SQ:
                    return;
              }
        
            this.advance();
        }
    }
}

let { Scanner } = require('./Scanner');
let { AstPrinter } = require('./AstPrinter');


let loxScanner = new Scanner(code);
loxScanner.scanTokens();
console.log(loxScanner.tokens);
let parser = new Parser(loxScanner.tokens);
let expr = parser.parseExpression();
console.log(expr);
console.log(new AstPrinter().print([new Stmt.Expression(expr)]));