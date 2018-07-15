const { TreeVisitor } = require('./TreeVisitor');
let { Expr, UnaryExpr, LiteralExpr, BinaryExpr, GroupingExpr, VariableExpr } = require('./Expr');
let { Stmt, PrintStmt, ExpressionStmt, VarStmt } = require('./Stmt');
let { Token } = require('./Token');
// an expression visitor
class AstPrinter extends TreeVisitor{
    print(statements) {
        let representation = ["["];
        for (let statement of statements) {
            console.log(statement);
            if (statement instanceof Stmt) {
                representation.push("  " + statement.accept(this));
            } else {
                representation.push(`  (ERROR ${statement})`);
            }
        }
        return representation.join("\n") + "\n]";
    }
    visitVarStmt(stmt) {
        return this.parenthesise("VAR", stmt.name, "=", stmt.initialiser);
    }
    visitPrintStmt(stmt) {
        return this.parenthesise("PRINT", stmt.expression);
    }
    visitExpressionStmt(stmt) {
        return this.parenthesise("EXPR", stmt.expression);
    }
    visitNullStmt(stmt) {
        return this.parenthesise("NULLSTMT");
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
            if (typeof arg === 'string') {
                strArr.push(arg);
            } else if (arg instanceof Expr) {
                // arg is expr
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