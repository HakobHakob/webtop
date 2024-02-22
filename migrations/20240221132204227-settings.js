const { DB } = require("../components/db")

const table = "settings" //change as you see fit․
class SettingsMigration {
  constructor() {
    //
  }

  async up() {
    await DB(table).createTable([
      DB.column("id").id(),
      DB.column("key").varchar(255).unique(),
      DB.column("name").varchar(255).nullable(),
      DB.column("description").json().nullable(),
      DB.column("value").text().nullable(),
      DB.column("file").varchar(255).nullable(),
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
module.exports = SettingsMigration
