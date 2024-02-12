const {DB} = require("../../../components/db");
const bcrypt = require("bcrypt");
const moment = require("moment/moment");
const {nodeCommand} = require("../kernel");
class TestCommand {
    constructor(args = []) {
        this.args = args;
    }
    static command = "test";
    async handle()
    {
        console.log(this.args, "TEST");
    }
}

module.exports = TestCommand;