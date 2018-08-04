const { TreeVisitor } = require('./TreeVisitor');
let Expr = require('./Expr');
let Stmt = require('./Stmt');
let { Token } = require('./Token');
// an expression visitor
class AstPrinter extends TreeVisitor{
    constructor() {
        super();
        this.indentation = 0;
    }
    print(statements) {
        let representation = ["["];
        for (let statement of statements) {
            if (statement instanceof Stmt.Base) {
                representation.push("  " + statement.accept(this));
            } else {
                representation.push(`  (ERROR ${statement})`);
            }
        }
        return representation.join("\n") + "\n]";
    }
    visitBlockStmt(stmt) {
        let args = ["BLOCK"]
        this.indentation += 1;
        for (let statement of stmt.statements) {
            args.push(statement);
            // args.push("\n" + "    ".repeat(this.indentation), statement);
        }
        this.indentation -= 1;
        return this.parenthesise(...args);
    }
    visitIfStmt(stmt) {
        return this.parenthesise("IF", stmt.condition, "THEN", stmt.thenBranch, "ELSE", stmt.elseBranch);
    }
    visitWhileStmt(stmt) {
        return this.parenthesise("WHILE", stmt.condition, "DO", stmt.body);
    }
    visitVarStmt(stmt) {
        return this.parenthesise("VAR", stmt.name, stmt.initialiser);
    }
    visitFunctionStmt(stmt) {
        return this.parenthesise("FUN", stmt.name, stmt.parameters, stmt.body);
    }
    visitPrintStmt(stmt) {
        return this.parenthesise("PRINT", stmt.expression);
    }
    visitReturnStmt(stmt) {
        return this.parenthesise("RETURN", stmt.value);
    }
    visitExpressionStmt(stmt) {
        return this.parenthesise("EXPR", stmt.expression);
    }
    visitNullStmt(stmt) {
        return this.parenthesise("NULLSTMT");
    }
    visitAssignExpr(expr) {
        return this.parenthesise("ASSIGN", expr.name, expr.value);
    }
    visitCallExpr(expr) {
        return this.parenthesise("CALL", expr.callee, expr.args);
    }
    visitLogicalExpr(expr) {
        return this.parenthesise(expr.operator.lexeme, expr.left, expr.right);
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
        if (typeof expr.value === 'string') return `"${expr.value}"`;
        return expr.value;
    }
    visitUnaryExpr(expr) {
        return this.parenthesise(expr.operator.lexeme, expr.right);
    }
    visitVariableExpr(expr) {
        return expr.name.lexeme;
    }
    visitConditionalExpr(expr) {
        return this.parenthesise('?:', expr.cond, expr.thenArm, expr.elseArm);
    }
    // parenthesise(name, ...exprs) {
    //     let strArr = [];
    //     strArr.push("(" + name);
    //     for (let expr of exprs) {
    //         strArr.push(" ");
    //         strArr.push(expr.accept(this));
    //     }
    //     strArr.push(')');
    //     return strArr.join('');
    // }
    // HACK: random arguments passed in as parens
    parenthesise(...args) {
        let strArr = [];
        strArr.push("(");
        for (let i=0; i<args.length; i++) {
            if (i>0) strArr.push(" ");
            let arg = args[i];
            // arg is string
            if (Array.isArray(arg)) {
                // HACK: split array into units recursively
                strArr.push(this.parenthesise(...arg));
            } else if (typeof arg === 'string') {
                strArr.push(arg);
            } else if (arg instanceof Expr.Base) {
                // arg is expr
                strArr.push(arg.accept(this));
            } else if (arg instanceof Stmt.Base) {
                // arg is stmt
                strArr.push(arg.accept(this));
            } else if (arg instanceof Token) {
                // arg is token
                // HACK: should probably use a proper expression
                // console.log(arg);
                strArr.push(arg.lexeme);
            }
        }
        strArr.push(')');
        return strArr.join('');
    }
}
module.exports = { AstPrinter };