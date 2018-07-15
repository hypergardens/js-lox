let { UnaryExpr, LiteralExpr, BinaryExpr, GroupingExpr, VariableExpr } = require('./Expr');
let { PrintStmt, ExpressionStmt, VarStmt, NullStmt } = require('./Stmt');

let { toks } = require('./loxLibs');
// let { Scanner } = require('./Scanner');
let { AstPrinter } = require('./AstPrinter');
let { Lox } = require('./Lox');

class ParseError extends Error {

}

class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.current = 0;
    }
    // program → statement* EOF ;
    parse() {
        let statements = [];
        while (!this.isAtEnd()) {
            statements.push(this.declaration());
        }
        return statements;
    }
    
    // declaration → varDecl
    //             | statement ;
    declaration() {
        try {
            if (this.match(toks.VAR)) return this.varDecl();
            return this.statement();
        } catch (e) {
            console.log(e.message);
            this.synchronise();
            return null;
        }
    }
    // varDecl → "var" IDENTIFIER ( "=" expression )? ";" ;
    varDecl() {
        let name = this.consume(toks.IDENTIFIER, `Expect variable name.`);
        let initialiser = null;
        if (this.match(toks.EQUAL)) {
            initialiser = this.expression();
        }
        this.consume(toks.SEMICOLON, `Expect ';' after variable declaration.`);
        return new VarStmt(name, initialiser);
    }

    // statement → printStmt
    //           | exprStmt ;
    statement() {
        if (this.match(toks.PRINT)) return this.printStatement();
        return this.expressionStatement();
    }
    
    // printStmt → "print" expression ";" ;
    printStatement() {
        let value = this.expression();
        this.consume(toks.SEMICOLON, `Expect ';' after value.`);
        return new PrintStmt(value);
    }
    
    // exprStmt  → expression ";" ;
    expressionStatement() {
        let expr = this.expression();
        this.consume(toks.SEMICOLON, `Expect ';' after expression.`);
        return new ExpressionStmt(expr);
    }

    // expression → equality ;
    expression() {
        return this.equality();
    }
    
    // equality → comparison ( ( "!=" | "==" ) comparison )* ;
    equality() {
        let expr = this.comparison();
        while (this.match(toks.BANG_EQUAL, toks.EQUAL_EQUAL)) {
            // token
            let operator = this.previous();
            // expr
            let right = this.comparison();
            // ((a == b) == c) == d
            expr = new BinaryExpr(expr, operator, right);
        }
        return expr;
    }
    // comparison → addition ( ( ">" | ">=" | "<" | "<=" ) addition )* ;
    comparison() {
        let expr = this.addition();
        while (this.match(toks.GREATER, toks.GREATER_EQUAL,
                          toks.LESS, toks.LESS_EQUAL,)) {
            // token
            let operator = this.previous();
            // expr
            let right = this.addition();
            // (a > b) < c
            expr = new BinaryExpr(expr, operator, right);
        }
        return expr;
    }
    // addition → multiplication ( ( "-" | "+" ) multiplication )* ;
    addition() {
        let expr = this.multiplication();
        while (this.match(toks.PLUS, toks.MINUS)) {
            // token
            let operator = this.previous();
            // expr
            let right = this.multiplication();
            // (a + b) - c
            expr = new BinaryExpr(expr, operator, right);
        }
        return expr;
    }

    multiplication() {
        let expr = this.unary();
        while (this.match(toks.SLASH, toks.STAR)) {
            // token
            let operator = this.previous();
            // expr
            let right = this.unary();
            // (a + b) - c
            expr = new BinaryExpr(expr, operator, right);
        }
        return expr;
    }
    // unary → ( "!" | "-" ) unary
    //       | primary ;
    unary() {
        if (this.match(toks.BANG, toks.MINUS)) {
            // token
            let operator = this.previous();
            // expr
            let right = this.unary();
            return new UnaryExpr(operator, right);
        }
        return this.primary();
    }
    // primary → NUMBER | STRING | "false" | "true" | "nil"
    //         | "(" expression ")" ;
    primary() {
        if (this.match(toks.FALSE)) return new LiteralExpr(false);
        if (this.match(toks.TRUE)) return new LiteralExpr(true);
        if (this.match(toks.NIL)) return new LiteralExpr(null);
        if (this.match(toks.NUMBER, toks.STRING)){
            return new LiteralExpr(this.previous().literal);
        }
        if (this.match(toks.IDENTIFIER)) {
            return new VariableExpr(this.previous());
        }
        if (this.match(toks.LEFT_PAREN)) {
            let expr = this.expression();
            this.consume(toks.RIGHT_PAREN, "Expect ')' after expression.");
            return new GroupingExpr(expr);
        }

        throw this.error(this.peek(), "Expect expression");
    }
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
        Lox.error(token, message);
        return new ParseError();
    }
    synchronise() {
        this.advance();

        while (!this.isAtEnd()) {
            if (this.previous().type == toks.SEMICOLON) return;

            switch (this.peek().type) {
                case toks.CLASS:
                case toks.FUN:
                case toks.VAR:
                case toks.FOR:
                case toks.IF:
                case toks.WHILE:
                case toks.PRINT:
                case toks.RETURN:
                    return;
              }
        
            this.advance();
        }
    }
}

module.exports = { Parser };