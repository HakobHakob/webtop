const fs = require('node:fs');
const path = require('node:path');
const moment = require("moment/moment");
const {DB} = require('../../components/db');
const {makeDirectoryIfNotExists, getAllFilesAndDirs} = require("../../components/functions");

const com_colours = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    underscore: "\x1b[4m",
    blink: "\x1b[5m",
    reverse: "\x1b[7m",
    hidden: "\x1b[8m",
    fg: {
        black: "\x1b[30m",
        red: "\x1b[31m",
        green: "\x1b[32m",
        yellow: "\x1b[33m",
        blue: "\x1b[34m",
        magenta: "\x1b[35m",
        cyan: "\x1b[36m",
        white: "\x1b[37m",
        gray: "\x1b[90m",
        crimson: "\x1b[38m" // Scarlet
    },
    bg: {
        black: "\x1b[40m",
        red: "\x1b[41m",
        green: "\x1b[42m",
        yellow: "\x1b[43m",
        blue: "\x1b[44m",
        magenta: "\x1b[45m",
        cyan: "\x1b[46m",
        white: "\x1b[47m",
        gray: "\x1b[100m",
        crimson: "\x1b[48m"
    }
};

function sleep(t) {
    return new Promise((resolve)=>{
        setTimeout(resolve, t);
    });
}

class Kernel {
    constructor(args, root) {
        this.args = args;
        this.root = root ?? path.normalize(__dirname + '/../..');
        this.migrationPath = this.root + "/migrations";
        this.seederPath = this.root + "/seeders";
        this.controllerPath = this.root + '/http/controllers';
        this.commandPath = this.root + '/http/console/commands';
        this.resourcePath = this.root + '/http/resources';
    }

    async help() {
        let help = [
            {command: "node com migrate", description: "Migrate all."},
            {command: "node com migrate table1 table2 ...", description: "Migrate table1, table2 ... by sequence."},
            {
                command: "node com make:migration table1 table2 ...",
                description: "Make a table1, table2 ... migration(s) skeleton file(s)."
            },
            {command: "node com seed", description: "Seed all."},
            {command: "node com seed table1 table2 ...", description: "Seed table1, table2 ... by sequence."},
            {
                command: "node com make:seeder table1 table2 ...",
                description: "Make a table1, table2 ... seeder(s) skeleton file(s)."
            },
            {
                command: "node com make:controller controller1 controller2 ...",
                description: "Make a controller(s) skeleton file(s)."
            },
            {
                command: "node com make:command command1 command2 ...",
                description: "Make a command(s) skeleton file(s)."
            },
            {
                command: "node com make:resource resource1 resource2 ...",
                description: "Make a resource(s) skeleton file(s)."
            },
            {
                command: "node com make:notification notification1 notification2 ...",
                description: "Make a notification(s) skeleton file(s)."
            },
        ];
        let comMaxLen = 0;
        help.forEach((h) => {
            comMaxLen = h.command.length > comMaxLen ? h.command.length : comMaxLen;
        })
        let helpText = help.map((h) => {
            let ws = " ".repeat(comMaxLen - h.command.length);
            return com_colours.fg.green + h.command + ws + com_colours.fg.yellow + " " + h.description;
        }).join("\n") + com_colours.reset;
        // console.log(helpText);
        return helpText;
    }

    async migrate() {
        let message = [];
        let fileExt = ".js";
        let tables = [];
        for (let i = 1; i < this.args.length; i++) {
            tables.push(this.args[i]);
        }
        let filesOrDirs = fs.readdirSync(this.migrationPath);
        let files = filesOrDirs.filter((fileOrDir)=>{
            return fs.statSync(this.migrationPath + "/" + fileOrDir).isFile() && fileOrDir.endsWith(fileExt);
        });
        let filesObj = files.map((file)=>{
            let time = '', name = '';
            let newFile = file.slice(0, -fileExt.length);
            let index = file.indexOf("-");
            if(index > -1){
                time = newFile.slice(0, index);
                name = newFile.slice(index + 1);
            }
            return {time, name};
        });
        filesObj.sort((a, b)=>{
            return a.time - b.time;
        });
        let filesObjToBeUp = [];
        if(tables.length){
            for(let fileObj of filesObj){
                if(
                    tables.includes(fileObj.name)
                    || tables.includes(fileObj.time + '-' + fileObj.name)
                    || tables.includes(fileObj.time + '-' + fileObj.name + fileExt)
                ){
                    filesObjToBeUp.push(fileObj);
                }
            }
        }else{
            filesObjToBeUp.push(...filesObj);
        }

        for(let fileObj of filesObjToBeUp){
            try {
                const MyTableClass = require("../../migrations/" + fileObj.time + '-' + fileObj.name);
                await new MyTableClass().up();
                message.push(fileObj.time + '-' + fileObj.name + fileExt);
            }catch (e) {
                console.error(e);
            }
        }
        if(message.length){
            message.unshift("Migrating files:");
        }else{
            message.push("Noting to migrate.");
        }
        return message.join(" ");
    }

    async makeMigration() {
        let message = [];
        let fileExt = ".js";
        let tables = [];
        for (let i = 1; i < this.args.length; i++) {
            tables.push(this.args[i]);
        }
        for (const table of tables) {
            try {
                let tableClass = table;
                tableClass = tableClass[0].toUpperCase() + tableClass.slice(1);
                tableClass += "Migration";
                let mf = fs.readFileSync(__dirname + '/kernel/migration.js', 'utf8');
                let mfArr = mf.split('/*migration-separator*/');
                mfArr[0] = "const {DB} = require(\"../components/db\");\n" +
                    "const table = \"" + table + "\";//change as you see fit․\nclass " + tableClass;
                mfArr.push("module.exports = " + tableClass + ";");
                mf = mfArr.join("");
                makeDirectoryIfNotExists(this.migrationPath);
                let fileName = moment().format('yyyyMMDDHHmmssSSS') + '-' + table + fileExt;
                fs.writeFileSync(this.migrationPath + '/' + fileName, mf);
                message.push(fileName);
            }catch (e) {
                console.error(e);
            }
            await sleep(50);
        }
        if(message.length){
            message.unshift("Making migration files:");
        }else{
            message.push("Noting to make.");
        }
        return message.join(" ");
    }

    async seed() {
        let message = [];
        let fileExt = ".js";
        let tables = [];
        for (let i = 1; i < this.args.length; i++) {
            tables.push(this.args[i]);
        }
        let filesOrDirs = fs.readdirSync(this.seederPath);
        let files = filesOrDirs.filter((fileOrDir)=>{
            return fs.statSync(this.seederPath + "/" + fileOrDir).isFile() && fileOrDir.endsWith(fileExt);
        });
        let filesObj = files.map((file)=>{
            let time = '', name = '';
            let newFile = file.slice(0, -fileExt.length);
            let index = file.indexOf("-");
            if(index > -1){
                time = newFile.slice(0, index);
                name = newFile.slice(index + 1);
            }
            return {time, name};
        });
        filesObj.sort((a, b)=>{
            return a.time - b.time;
        });
        let filesObjToBeUp = [];
        if(tables.length){
            for(let fileObj of filesObj){
                if(
                    tables.includes(fileObj.name)
                    || tables.includes(fileObj.time + '-' + fileObj.name)
                    || tables.includes(fileObj.time + '-' + fileObj.name + fileExt)
                ){
                    filesObjToBeUp.push(fileObj);
                }
            }
        }else{
            filesObjToBeUp.push(...filesObj);
        }

        for(let fileObj of filesObjToBeUp){
            try {
                const MyTableClass = require("../../seeders/" + fileObj.time + '-' + fileObj.name);
                await new MyTableClass().up();
                message.push(fileObj.time + '-' + fileObj.name + fileExt);
            }catch (e) {
                console.error(e);
            }
        }
        if(message.length){
            message.unshift("Seeding files:");
        }else{
            message.push("Noting to seed.");
        }
        return message.join(" ");
    }

    async makeSeeder() {
        let message = [];
        let fileExt = ".js";
        let tables = this.args.slice(1);
        for (const table of tables) {
            try {
                let tableClass = table;
                tableClass = tableClass[0].toUpperCase() + tableClass.slice(1);
                tableClass += "Seeder";
                let mf = fs.readFileSync(__dirname + '/kernel/seeder.js', 'utf8');
                let mfArr = mf.split('/*seeder-separator*/');
                mfArr[0] = "const {DB} = require(\"../components/db\");\n" +
                    "const bcrypt = require(\"bcrypt\");\n" +
                    "const moment = require(\"moment/moment\");\n" +
                    "const table = \"" + table + "\";//change as you see fit․\nclass " + tableClass;
                mfArr.push("module.exports = " + tableClass + ";");
                mf = mfArr.join("");
                makeDirectoryIfNotExists(this.seederPath);
                let fileName = moment().format('yyyyMMDDHHmmssSSS') + '-' + table + fileExt;
                fs.writeFileSync(this.seederPath + '/' + fileName, mf);
                message.push(fileName);
            }catch (e) {
                console.error(e);
            }
            await sleep(50);
        }
        if(message.length){
            message.unshift("Making seeder files:");
        }else{
            message.push("Noting to make.");
        }
        return message.join(" ");
    }

    async makeController(){
        return await this._makeAny(this.controllerPath, ".js", "controller", "Controller");
    }

    async makeCommand(){
        return await this._makeAny(this.commandPath, ".js", "command", "Command",
            {2: (arg, dirLessArg, className, fileName) => {
                    return "\"" + dirLessArg + "\"";
                }});
    }

    async launchCommand(){
        let command = this.args[0];
        if(!command){
            return "No command.";
        }
        let commandLaunched = false;
        let files = getAllFilesAndDirs(this.commandPath).files;
        // console.log(files);
        for(let file of files){
            try {
                let slash = file.relativePath ? "/" : "";
                const MyCommandClass = require("./commands/" + file.relativePath + slash + file.file);
                if(MyCommandClass.command !== command){
                    continue;
                }
                await new MyCommandClass(this.args.slice(1)).handle();
                commandLaunched = true;
            }catch (e) {
                console.error(e);
            }
        }
        return commandLaunched ? "" : "Command not found or not launched.";
    }

    async makeResource(){
        return await this._makeAny(this.resourcePath, ".js", "resource", "Resource");
    }

    async _makeAny(itemPath = this.root, fileExt = ".js", kernelResource = "resource", classSuffix = "", replacements = {}){
        let message = [];
        let argItems = this.args.slice(1);
        for (let arg of argItems) {
            try {
                let ii = arg.lastIndexOf('/');
                let className = ii > -1 ? arg.slice(ii + 1) : arg;
                let additionalPath = ii > -1 ? arg.slice(0, ii) : '';
                let dirLessArg = className;
                let fileName = className + classSuffix + fileExt;
                if(fs.existsSync(path.join(itemPath, additionalPath, fileName))){
                    message.push("(Can not create already exists file " + fileName +")");
                    continue;
                }
                className = className[0].toUpperCase() + className.slice(1) + classSuffix;
                let mf = fs.readFileSync(__dirname + '/kernel/' + kernelResource + '.js', 'utf8');
                let mfArr = mf.split('/*' + kernelResource + '-separator*/');
                let relPath = path.relative(path.join(itemPath, additionalPath), this.root + "/components/db")
                    .replace(/\\/ig, "/");
                mfArr[0] = "const {DB} = require(\"" + relPath + "\");\n" +
                    "const bcrypt = require(\"bcrypt\");\n" +
                    "const moment = require(\"moment/moment\");\n" +
                    "class " + className;
                for (let repl in replacements){
                    mfArr[repl] = typeof replacements[repl] === 'function' ? replacements[repl](arg, dirLessArg, className, fileName) : replacements[repl];
                }
                mfArr.push("module.exports = " + className + ";");
                mf = mfArr.join("");
                makeDirectoryIfNotExists(path.join(itemPath, additionalPath));
                fs.writeFileSync(path.join(itemPath, additionalPath, fileName), mf);
                message.push(path.join(additionalPath, fileName));
            }catch (e) {
                console.error(e);
            }
        }
        if(message.length){
            message.unshift("Making " + kernelResource + " files:");
        }else{
            message.push("Noting to make.");
        }
        return message.join(" ");
    }

    async distributor() {
        if (this.args.length > 0) {
            switch (this.args[0]) {
                case "make:seeder":
                    return await this.makeSeeder();
                case "make:migration":
                    return await this.makeMigration();
                case "migrate":
                    return await this.migrate();
                case "seed":
                    return await this.seed();
                case "help":
                    return await this.help();
                case "make:controller":
                    return await this.makeController();
                case "make:command":
                    return await this.makeCommand();
                case "make:resource":
                    return await this.makeResource();
                default: return await this.launchCommand();
            }
        } else {
            return "No arguments.";
        }
    }
}

async function nodeCommand(command) {
    let args = command.split(/\s+/ig);
    return await new Kernel(args).distributor();
}

module.exports = {Kernel, nodeCommand};