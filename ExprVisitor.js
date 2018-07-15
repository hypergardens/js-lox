// an expression visitor
class ExprVisitor {
    visitBinaryExpr(expr) {
        throw 'Not implemented!'
    }
    visitGroupingExpr(expr) {
        throw 'Not implemented!'
    }
    visitLiteralExpr(expr) {
        throw 'Not implemented!'
    }
    visitUnaryExpr(expr) {
        throw 'Not implemented!'
    }
}

module.exports = { ExprVisitor };