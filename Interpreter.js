const { ExprVisitor } = require('./ExprVisitor');
let { toks } = require('./loxLibs');
let { LoxRuntimeError } = require('./LoxRuntimeError');
let { Lox } = require('./Lox');

class Interpreter extends ExprVisitor {
    interpret(statements) {
        try {
            for (let statement of statements) {
                this.execute(statement);
            }
        } catch (e) {
            Lox.runtimeError(e);
        }
    }
    visitLiteralExpr(expr) {
        return expr.value;
    }
    visitGroupingExpr(expr) {
        return this.evaluate(expr.expression);
    }
    visitBinaryExpr(expr) {
        let left = this.evaluate(expr.left);
        let right = this.evaluate(expr.right);
        switch (expr.operator.type) {
            case toks.SLASH:
                this.checkNumberOperands(expr.operator, left, right);
                // TODO: divide by zero error
                return Number(left) / Number(right);
            case toks.STAR:
                this.checkNumberOperands(expr.operator, left, right);
                return Number(left) * Number(right);
                
            case toks.GREATER:
                this.checkNumberOperands(expr.operator, left, right);
                return Number(left) > Number(right);
            case toks.GREATER_EQUAL:
                this.checkNumberOperands(expr.operator, left, right);
                return Number(left) >= Number(right);
            case toks.LESS:
                this.checkNumberOperands(expr.operator, left, right);
                return Number(left) < Number(right);
            case toks.LESS_EQUAL:
                this.checkNumberOperands(expr.operator, left, right);
                return Number(left) <= Number(right);

            case toks.BANG_EQUAL:
                return !this.isEqual(left, right);
            case toks.EQUAL_EQUAL:
                return this.isEqual(left, right);

            case toks.MINUS:
                this.checkNumberOperands(expr.operator, left, right);
                return Number(left) - Number(right);
            case toks.PLUS:
                if (typeof left === 'number' && typeof right === 'number') {
                    return Number(left) + Number(right);
                } 
                if (typeof left === 'string' || typeof right === 'string') {
                    // if either is string, concatenate
                    return String(left) + String(right);
                }
                throw new LoxRuntimeError(expr.operator, "Operands must be two numbers or two strings.");
        }

    }
    visitUnaryExpr(expr) {
        let right = this.evaluate(expr.right);
        switch (expr.operator.type) {
            case toks.BANG:
                return !this.isTruthy(right);
            case toks.MINUS:
                this.checkNumberOperand(expr.operator, right);
                return -Number(right);
        }

        // Unreachable
        return null;
    }
    checkNumberOperand(operator, operand) {
        //             token   , obj
        if (typeof operand === 'number') return;
        throw new LoxRuntimeError(operator, "Operand must be a number.");
    }
    checkNumberOperands(operator, left, right) {
        //              token   , obj , obj
        if (typeof left === 'number' && typeof right === 'number') return;
        throw new LoxRuntimeError(operator, "Operands must be numbers.");
    }
    evaluate(expr) {
        return expr.accept(this);
    }
    execute(stmt) {
        return stmt.accept(this);
    }
    visitExpressionStmt(stmt) {
        this.evaluate(stmt.expression);
        return null;
    }
    visitPrintStmt(stmt) {
        let value = this.evaluate(stmt.expression);
        console.log('[LOX]', this.stringify(value));
    }
    isTruthy(obj) {
        if (obj === null) return false;
        if (typeof obj === 'boolean') return Boolean(obj);
        return true;
        // TODO: do more with bools
        // return Boolean(obj)?
    }
    isEqual(a, b) {
        if (a === null && b === null) return true;
        if (a === null) return false;
        // TODO: should I do more here or let JS handle equality?
        return a === b;
    }
    stringify(obj) {
        if (obj === null) return "nil";
        if (typeof obj === 'number') return obj;
        // TODO: there was a bit more here regarding .0 termination for floats
        return obj.toString();
    }
}

let { Scanner } = require('./Scanner');
let { Parser } = require('./Parser');
let { AstPrinter } = require('./AstPrinter');

let loxScanner = new Scanner(`
    print "+----+";
    print "| o o|";
    print "+----+";
    print "A little Lox box.";
    print 10 - 2 * -3 == 16;
`);
loxScanner.scanTokens();
let statements = new Parser(loxScanner.tokens).parse();
let interpreter = new Interpreter();
let printer = new AstPrinter();
interpreter.interpret(statements);
console.log("end parsing");