let loxLibs = {};

function makeEnum(...args) {
    let hash = {};
    let ctr = 1;
    for (let arg of args) {
        hash[arg] = arg;
    }
    return Object.freeze(hash);
}

let toks = makeEnum(
    // Single-character tokens.
    'LEFT_PAREN', 'RIGHT_PAREN', 'LEFT_BRACE', 'RIGHT_BRACE',
    'COMMA', 'DOT', 'MINUS', 'PLUS', 'SEMICOLON', 'SLASH', 'STAR',
    'COLON', 'QMARK', 'TILDE', 'CARET',

    // One or two character tokens.
    'BANG', 'BANG_EQUAL',
    'EQUAL', 'EQUAL_EQUAL',
    'GREATER', 'GREATER_EQUAL',
    'LESS', 'LESS_EQUAL',

    // Literals.
    'IDENTIFIER', 'STRING', 'NUMBER',

    // Keywords.
    'AND', 'CLASS', 'ELSE', 'FALSE', 'FUN', 'FOR', 'IF', 'NIL', 'OR',
    'PRINT', 'RETURN', 'SUPER', 'THIS', 'TRUE', 'VAR', 'WHILE',

    'EOF'
);

let keywords = {};
keywords["and"] =    toks.AND;
keywords["class"] =  toks.CLASS;
keywords["else"] =   toks.ELSE;
keywords["false"] =  toks.FALSE;
keywords["for"] =    toks.FOR;
keywords["fun"] =    toks.FUN;
keywords["if"] =     toks.IF;
keywords["nil"] =    toks.NIL;
keywords["or"] =     toks.OR;
keywords["print"] =  toks.PRINT;
keywords["return"] = toks.RETURN;
keywords["super"] =  toks.SUPER;
keywords["this"] =   toks.THIS;
keywords["true"] =   toks.TRUE;
keywords["var"] =    toks.VAR;
keywords["while"] =  toks.WHILE;


module.exports = {
    toks: toks,
    makeEnum: makeEnum,
    keywords: keywords
};