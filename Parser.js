let Expr = require('./Expr');
let Stmt = require('./Stmt');

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
        return new Stmt.Var(name, initialiser);
    }

    // statement → exprStmt
    //           | forStmt
    //           | ifStmt
    //           | whileStmt
    //           | printStmt
    //           | block ;
    statement() {
        if (this.match(toks.FOR)) return this.forStatement();
        if (this.match(toks.IF)) return this.ifStatement();
        if (this.match(toks.WHILE)) return this.whileStatement();
        if (this.match(toks.PRINT)) return this.printStatement();
        if (this.match(toks.LEFT_BRACE)) return new Stmt.Block(this.block());
        return this.expressionStatement();
    }


    // forStmt    → "for" "("
    //                 ( varDecl | exprStmt | ";" )
    //                 expression? ";"
    //                 expression? ")" statement ;
    forStatement() {
        this.consume(toks.LEFT_PAREN, "Expect '(' after 'for'.");
        let initialiser;
        if (this.match(toks.SEMICOLON)) {
            initialiser = null;
        } else if (this.match(toks.VAR)) {
            initialiser = this.varDecl();
        } else {
            initialiser = this.expressionStatement();
        }

        let condition = null;
        if (!this.check(toks.SEMICOLON)) {
            condition = this.expression();
        }
        this.consume(toks.SEMICOLON, "Expect ';' after loop condition.");
        
        let increment = null;
        if (!this.check(toks.RIGHT_PAREN)) {
            increment = this.expression();
        }
        this.consume(toks.RIGHT_PAREN, "Expect ')' after 'for' clauses.");

        let body = this.statement();

        // desugaring
        if (increment !== null) {
            // TEST: test this heavily, desugaring can be picky
            body = new Stmt.Block([body, new Stmt.Expression(increment)]);
        }
        
        if (condition === null){
            condition = new Expr.Literal(true);
        }
        body = new Stmt.While(condition, body);
        
        if (initialiser !== null) {
            body = new Stmt.Block([initialiser, body]);
        }

        return body;
    }

    // block → "{" declaration* "}"
    block() {
        let statements = [];
        while (!this.check(toks.RIGHT_BRACE) && !this.isAtEnd()) {
            statements.push(this.declaration());
        }
        this.consume(toks.RIGHT_BRACE, "Expect '}' after block.")
        return statements;
    }

    // whileStmt → "while" "(" expression ")" statement;
    whileStatement() {
        this.consume(toks.LEFT_PAREN, "Expected '(' after while.");
        let condition = this.expression();
        this.consume(toks.RIGHT_PAREN, "Expected ')' after condition.");
        let body = this.statement();
        return new Stmt.While(condition, body);
    }

    // ifStmt    → "if" "(" expression ")" statement ( "else" statement )? ;
    ifStatement() {
        this.consume(toks.LEFT_PAREN, "Expect '(' after 'if'.");
        let condition = this.expression();
        this.consume(toks.RIGHT_PAREN, "Expect ')' after condition.");
        let thenBranch = this.statement();
        let elseBranch = null;
        if (this.match(toks.ELSE)) {
            elseBranch = this.statement();
        }
        return new Stmt.If(condition, thenBranch, elseBranch);
    }
    
    // printStmt → "print" expression ";" ;
    printStatement() {
        let value = this.expression();
        this.consume(toks.SEMICOLON, `Expect ';' after value.`);
        return new Stmt.Print(value);
    }
    
    // exprStmt  → expression ";" ;
    expressionStatement() {
        let expr = this.expression();
        this.consume(toks.SEMICOLON, `Expect ';' after expression.`);
        return new Stmt.Expression(expr);
    }

    // expression → assignment ;
    expression() {
        return this.assignment();
    }

    // assignment → IDENTIFIER "=" assignment
    //            | logic_or ;
    assignment() {
        let expr = this.or();
        if (this.match(toks.EQUAL)) {
            let equalsToken = this.previous();
            let rightValue = this.assignment();
            
            if (expr instanceof Expr.Variable) {
                let nameToken = expr.name;
                return new Expr.Assign(nameToken, rightValue);
            }
            this.error(equalsToken, "Invalid assignment target.");
        }
        return expr;
    }

    // logic_or   → logic_and ( "or" logic_and )* ;
    or() {
        let expr = this.and();

        while (this.match(toks.OR)) {
            // token
            let operator = this.previous();
            // expr
            let right = this.and();
            // ((a or b) or c)
            expr = new Expr.Logical(expr, operator, right);
        }
        return expr;
    }

    // logic_and  → equality ( "and" equality )* ;
    and() {
        let expr = this.equality();

        while (this.match(toks.AND)) {
            // token
            let operator = this.previous();
            // expr
            let right = this.equality();
            // ((a and b) and c)
            expr = new Expr.Logical(expr, operator, right);
        }
        return expr;
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
            expr = new Expr.Binary(expr, operator, right);
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
            expr = new Expr.Binary(expr, operator, right);
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
            expr = new Expr.Binary(expr, operator, right);
        }
        return expr;
    }
    
    // multiplication → unary ( ( "/" | "*" ) unary )* ;
    multiplication() {
        let expr = this.unary();
        while (this.match(toks.SLASH, toks.STAR)) {
            // token
            let operator = this.previous();
            // expr
            let right = this.unary();
            // (a + b) - c
            expr = new Expr.Binary(expr, operator, right);
        }
        return expr;
    }

    // unary → ( "!" | "-" ) unary
    //       | call;
    unary() {
        if (this.match(toks.BANG, toks.MINUS)) {
            // token
            let operator = this.previous();
            // expr
            let right = this.unary();
            return new Expr.Unary(operator, right);
        }
        return this.call();
    }

    // call → primary ( "(" arguments? ")" )*
    call() {
        let expr = this.primary();
        while (true) {
            if (this.match(toks.LEFT_PAREN)) {
                expr = this.finishCall(expr);
            } else {
                break;
            }
        }
        return expr;
    }
    // arguments → expression ( "," expression )* ;
    finishCall(callee) {
        let args = [];
        let maxArgs = 8;
        if (!this.check(toks.RIGHT_PAREN)) {
            do {
                if (args.length >= maxArgs) {
                    this.error(this.peek(), `Cannot have more than ${maxArgs} args.`);
                }
                args.push(this.expression());
            } while (this.match(toks.COMMA));
        }
        let paren = this.consume(toks.RIGHT_PAREN, "Expect ')' after args.");
        return new Expr.Call(callee, paren, args);
    }
    // primary → NUMBER | STRING | "false" | "true" | "nil"
    //         | "(" expression ")" ;
    primary() {
        if (this.match(toks.FALSE)) return new Expr.Literal(false);
        if (this.match(toks.TRUE)) return new Expr.Literal(true);
        if (this.match(toks.NIL)) return new Expr.Literal(null);
        if (this.match(toks.NUMBER, toks.STRING)){
            return new Expr.Literal(this.previous().literal);
        }
        if (this.match(toks.IDENTIFIER)) {
            return new Expr.Variable(this.previous());
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