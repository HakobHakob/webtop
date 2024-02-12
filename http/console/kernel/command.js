
class Command/*command-separator*/ {
    constructor(args = []) {
        this.args = args;
    }
    static command = /*command-separator*/"test"/*command-separator*/;
    async handle()
    {
        console.log(this.args);
    }
}

