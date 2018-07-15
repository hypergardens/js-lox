const { TreeVisitor } = require('./TreeVisitor');
// an expression visitor
class AstPrinter extends TreeVisitor{
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
        if (typeof expr.value === 'string') return `"${expr.value}"`;
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

module.exports = { AstPrinter };