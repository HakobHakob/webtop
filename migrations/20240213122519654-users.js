const { DB } = require("../components/db")

const table = "users"
class UsersMigration {
  constructor() {
    //
  }

  async up() {
    await DB(table).createTable([
      DB.column("id").id(),
      DB.column("first_name").varchar(255),
      DB.column("last_name").varchar(255),
      DB.column("email").varchar(255).unique(),
      DB.column("photo").varchar(255).nullable(),
      DB.column("password").text().nullable(),
      DB.column("role").varchar(255).nullable(),
      DB.column("email_verified_at").timestamp().nullable(),
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
module.exports = UsersMigration
