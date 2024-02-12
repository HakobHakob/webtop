const {DB} = require("../../../components/db");
const bcrypt = require("bcrypt");
const moment = require("moment/moment");
const {nodeCommand} = require("../kernel");
class DevInitCommand {
    constructor(args = []) {
        this.args = args;
    }
    static command = "devInit";
    async handle()
    {
        console.log(this.args);
        await nodeCommand("migrate");
        await nodeCommand("seed");
    }
}

module.exports = DevInitCommand;