// an expression visitor
class TreeVisitor {
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
    // visitPrintStmt(stmt){
    //     throw 'Not implemented!'
    // }
    // visitExpressionStmt(stmt) {
    //     throw 'Not implemented!'
    // }
}

module.exports = { TreeVisitor };