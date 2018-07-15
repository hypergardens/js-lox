class LoxRuntimeError extends Error {
    constructor(token, message) {
        super(message);
        this.token = token;
    }
}

module.exports = { LoxRuntimeError };