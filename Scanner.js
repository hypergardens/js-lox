const {makeEnum, toks, keywords} = require('./loxLibs.js')
const Token = require('./Token');

class Lox {
    run(source="") {
        let scanner = new Scanner(source);
        let tokens = scanner.scanTokens();
        for (let i=0; i<tokens.length; i++) {
            console.log(tokens[i]);
        }
    }
    // runLine() {
    //     const readline = require('readline');

    //     this.run(readline());
    // }
    static error(line, message) {
        this.report(line, "", message)
    }
    static report(line, where, message) {
        console.log("[line " + line + "] Error" + where + ": " + message);
        Lox.hadError = true;
    }
}

class Scanner {
    constructor(source="") {
        this.source = source;
        this.tokens = [];
        this.start = 0;
        this.current = 0;
        this.line = 1;
    }
    scanTokens() {
        while (!this.isAtEnd()) {
            this.start = this.current;
            this.scanToken();
        }
        this.tokens.push(new Token(toks.EOF, "", null, this.line));
    }
    scanToken() {
        let c = this.advance();
        console.log('char:', c);
        switch (c) {
            case '(': this.addToken(toks.LEFT_PAREN); break;
            case ')': this.addToken(toks.RIGHT_PAREN); break;
            case '{': this.addToken(toks.LEFT_BRACE); break;
            case '}': this.addToken(toks.RIGHT_BRACE); break;
            case ',': this.addToken(toks.COMMA); break;
            case '.': this.addToken(toks.DOT); break;
            case '-': this.addToken(toks.MINUS); break;
            case '+': this.addToken(toks.PLUS); break;
            case ';': this.addToken(toks.SEMICOLON); break;
            case '*': this.addToken(toks.STAR); break;
            case '!': this.addToken(this.match('=') ? toks.BANG_EQUAL : toks.BANG); break;
            case '=': this.addToken(this.match('=') ? toks.EQUAL_EQUAL : toks.EQUAL); break;
            case '<': this.addToken(this.match('=') ? toks.LESS_EQUAL : toks.LESS); break;
            case '>': this.addToken(this.match('=') ? toks.GREATER_EQUAL : toks.GREATER); break;
            case '/':
                if (this.match('/')) {
                    // comment till end of line
                    while (this.peek() != '\n' && !this.isAtEnd()) this.advance();
                } else if (this.match('*')) {
                    this.blockComment();
                } else {
                    this.addToken(toks.SLASH);
                }
                break;
            case ' ':
            case '\r':
            case '\t':
                // Ignore whitespace.
                break;
        
            case '\n':
                this.line++;
                break;

            case '"': this.string(); break;
            default:
                if (this.isDigit(c)) {
                    console.log('digit', c)
                    this.number();
                } else if (this.isAlpha(c)) {
                    this.identifier();
                } else {
                    Lox.error(this.line, "Unexpected character.");
                }
                break;

        }
    }
    identifier() {
        while (this.isAlphaNumeric(this.peek())) this.advance();

        let text = this.source.substring(this.start, this.current);

        let tokType = keywords[text] === undefined ? toks.IDENTIFIER : keywords[text];
        
        console.log('identifier:', text, 'type:', tokType);

        this.addToken(tokType);
    }
    blockComment() {
        // while (this.peek() != '*' && this.peekNext() != '/' && !this.isAtEnd()) this.advance();
        let foundEnd = false;
        while (!this.isAtEnd() && !foundEnd) {
            if (this.match('*') && this.match('/')) {
                foundEnd = true;
            }
            this.advance();
        }
        // this.advance();
        // this.advance();
    }
    string() {
        while (this.peek() != '"' && !this.isAtEnd()) {
            if (this.peek() == '\n') this.line++;

            this.advance();
        }

        // Unterminated string
        if (this.isAtEnd()) {
            Lox.error(this.line, "Unterminated string");
            return;
        }

        // The closing ""
        this.advance();

        let value = this.source.substring(this.start + 1, this.current - 1);
        this.addToken(toks.STRING, value);
    }
    match(expected) {
        if (this.isAtEnd()) return false;
        if (this.source.charAt(this.current) != expected) return false;
        
        this.current++;
        return true;
    }
    peek() {
        if (this.isAtEnd()) return '\0';
        return this.source.charAt(this.current);
    }
    peekNext() {
        if (this.current + 1 >= this.source.length) return '\0';
        return this.source.charAt(this.current + 1);
    }
    isAlpha(c) {
        return (c >= 'a' && c <= 'z') ||
            (c >= 'A' && c <= 'Z') ||
            c == '_';
    }
    isAlphaNumeric(c) {
        return this.isAlpha(c) || this.isDigit(c);
    }
    number() {
        while (this.isDigit(this.peek())) this.advance();

        // Look for fractional part
        if (this.peek() == '.' && this.isDigit(this.peekNext())) {
            // Consume the .
            this.advance();

            while (this.isDigit(this.peek())) this.advance();
        }

        let value = this.source.substring(this.start, this.current);
        this.addToken(toks.NUMBER, Number(value));
    }
    isDigit(c) {
        return c >= '0' && c <= '9';
    }
    advance() {
        this.current++;
        return this.source.charAt(this.current - 1);
    }
    addToken(tokType, literal=null) {
        let text = this.source.substring(this.start, this.current);
        this.tokens.push(new Token(tokType, text, literal, this.line));
    }
    isAtEnd() {
        return this.current >= this.source.length;
    }
}
let loxScanner = new Scanner(`
a /* b * c */ d
`);
loxScanner.scanTokens();
console.log(loxScanner.tokens);