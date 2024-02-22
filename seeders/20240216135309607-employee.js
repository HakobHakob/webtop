const { DB } = require("../components/db")
const bcrypt = require("bcrypt")
const moment = require("moment/moment")
const table = "employees" //change as you see fit․
class EmployeeSeeder {
  constructor() {
    //
  }

  async up() {
    await DB(table).create([
      {
        first_name: "Root",
        last_name: "Root",
        email: "root@mail.com",
        password: bcrypt.hashSync("123456", 8),
        image: null,
        images: null,
        rank: JSON.stringify({
          hy: "React-ի մասնագետ",
          en: "React developer",
          ru: "Разработчик React",
        }),
        title: JSON.stringify({
          hy: "Main React developer",
          en: "React-ի գլխավոր մասնագետ",
          ru: "Главный разработчик React",
        }),
        description: JSON.stringify({
          hy: "Լավ աշխատակից",
          en: "Good working.",
          ru: "Хороший работник.",
        }),
        active: 1,
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
module.exports = EmployeeSeeder
