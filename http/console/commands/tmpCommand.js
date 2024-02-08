const { ValidateClass } = require("../../../components/validate")
class TmpCommand {
  constructor(args = []) {
    this.args = args
  }
  static command = "tmp"
  async handle() {
    // let a = path.relative(__dirname, __dirname + "/../../../components/db");
    // console.log(a);
    // let dir = path.dirname("/users/joe/notes.txt");
    // console.log(dir);
    let b = new ValidateClass(
      { body: { name: "Name", email: "mail@mail.com" } },
      (v) => {
        return {
          name: v.number(),
          email: v.number(),
        }
      }
    )
    console.log(b)
  }
}

module.exports = TmpCommand
