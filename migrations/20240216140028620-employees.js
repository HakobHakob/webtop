const { DB } = require("../components/db")
const table = "employees" //change as you see fit․
class EmployeesMigration {
  constructor() {
    //
  }

  async up() {
    await DB(table).createTable([
      DB.column("id").id(),
      DB.column("first_name").varchar(255),
      DB.column("last_name").varchar(255).nullable(),
      DB.column("password").text().nullable(),
      DB.column("email").varchar(255).unique(),
      DB.column("image").varchar(255).nullable(),
      DB.column("images").json().nullable(),
      DB.column("rank").json().nullable(),
      DB.column("title").json().nullable(),
      DB.column("description").json().nullable(),
      DB.column("active").tinyint().default(1),
      DB.column("created_at").timestamp().nullable(),
      DB.column("updated_at").timestamp().nullable(),
    ])
    /*Or can create*/
    /*
        await DB(table).addColumns([
            DB.column('name').varchar().nullable(),
            DB.column('email').varchar().nullable(),
        ]);

        await DB(table).changeColumn(DB.column('name').text());

        await DB(table).deleteColumn("name");
        */
  }

  async down() {
    await DB(table).deleteTable()
  }
}
module.exports = EmployeesMigration
