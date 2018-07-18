const { TreeVisitor } = require('./TreeVisitor');
let { toks } = require('./loxLibs');
let { LoxRuntimeError } = require('./LoxRuntimeError');
let { Lox } = require('./Lox');
let { Environment } = require('./Environment');

class Interpreter extends TreeVisitor {
    constructor() {
        super();
        this.environment = new Environment();
    }
    interpret(statements) {
        try {
            for (let statement of statements) {
                this.execute(statement);
            }
        } catch (e) {
            // HACK: this error is wonky
            console.log(e.token, e.message);
            Lox.runtimeError(e.token, e);
        }
    }
    visitLiteralExpr(expr) {
        return expr.value;
    }
    visitLogicalExpr(expr) {
        let left = this.evaluate(expr.left);
        if (expr.operator.type === toks.OR) {
            // truthy and x -> truthy
            if (this.isTruthy(left)) return left;
        } else if (expr.operator.type === toks.AND) {
            // falsey and x -> falsey
            if (!this.isTruthy(left)) return left;
        }

        return this.evaluate(expr.right);
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
    visitVariableExpr(expr) {
        // VariableExpr {name: tok}
        return this.environment.lookup(expr.name);
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
    executeBlock(statements, environment) {
        let previous = this.environment;
        try {
            this.environment = environment;
            for (let statement of statements) {
                this.execute(statement);
            }
        } finally {
            // LEARN: environments handled like ctx states
            // pay attention to this way of handling things. Very sleek
            this.environment = previous;
        }
    }   
    visitBlockStmt(stmt) {
        this.executeBlock(stmt.statements, new Environment(this.environment));
        return null;
    }
    visitIfStmt(stmt) {
        if (this.isTruthy(this.evaluate(stmt.condition))) {
            this.execute(stmt.thenBranch);
        } else if (stmt.elseBranch !== null) {
            this.execute(stmt.elseBranch);
        }
        return null;
    }
    visitWhileStmt(stmt) {
        while (this.isTruthy(this.evaluate(stmt.condition))) {
            this.execute(stmt.body);
        }
        return null;
    }
    visitNullStmt(stmt) {
        return null;
    }
    visitExpressionStmt(stmt) {
        this.evaluate(stmt.expression);
        return null;
    }
    visitPrintStmt(stmt) {
        let value = this.evaluate(stmt.expression);
        console.log(">", this.stringify(value));
        return null;
    }
    visitVarStmt(stmt) {
        let value = null;
        if (stmt.initialiser != null) {
            value = this.evaluate(stmt.initialiser);
        }
        this.environment.define(stmt.name.lexeme, value);
        return null;
    }
    visitAssignExpr(expr) {
        let value = this.evaluate(expr.value);
        this.environment.assign(expr.name, value);
        return value;
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

new Scanner("asdf")

let desugarCode = `
    var a = "global";
    {
        print a;
        a = "local";
        print a;
    }
    print a;    
`

let loxScanner = new Scanner(desugarCode);
loxScanner.scanTokens();
// console.log(loxScanner.tokens);

let program = new Parser(loxScanner.tokens).parse();
let interpreter = new Interpreter();
let printer = new AstPrinter();
// console.log(program);

// console.log(printer.print(program));
interpreter.interpret(program);

// console.log("end parsing");