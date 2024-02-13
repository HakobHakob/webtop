
const bcrypt = require("bcrypt")
const moment = require("moment/moment")
const { DB } = require("../components/db")

const table = "users" //change as you see fit․
class UsersSeeder {
  constructor() {
    //
  }

  async up() {
    await DB(table).create([
      {
        first_name: "Root",
        last_name: "Root",
        email: "root@mail.com",
        password: bcrypt.hashSync("12345678", 8),
        email_verified_at: moment().format("yyyy-MM-DD HH:mm:ss"),
        role: "admin",
        created_at: moment().format("yyyy-MM-DD HH:mm:ss"),
        updated_at: moment().format("yyyy-MM-DD HH:mm:ss"),
      },
      {
        first_name: "User",
        last_name: "User",
        email: "user@mail.com",
        password: bcrypt.hashSync("12345678", 8),
        email_verified_at: moment().format("yyyy-MM-DD HH:mm:ss"),
        role: "user",
        created_at: moment().format("yyyy-MM-DD HH:mm:ss"),
        updated_at: moment().format("yyyy-MM-DD HH:mm:ss"),
      },
    ])
    /*Or can create*/
    /*
        await DB(table).truncate();
        await DB(table).create(
            {
                first_name: 'Root',
                last_name: 'Root',
                email: 'root@mail.com',
                password: bcrypt.hashSync('12345678', 8),
                email_verified_at: moment().format('yyyy-MM-DD HH:mm:ss'),
                role: 'admin',
                created_at: moment().format('yyyy-MM-DD HH:mm:ss'),
                updated_at: moment().format('yyyy-MM-DD HH:mm:ss'),
            },
        );
        */
  }

  async down() {
    await DB(table).truncate()
  }
}
module.exports = UsersSeeder
