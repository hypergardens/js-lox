class LoxReturn extends Error {
    constructor(value) {
        super(null);
        this.value = value;
    }
}

module.exports = { LoxReturn };