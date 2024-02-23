const { DB } = require("../components/db")
const table = "tokens" //change as you see fit․
class TokensMigration {
  constructor() {
    //
  }

  async up() {
    await DB(table).createTable([
      DB.column("user_id").bigint(),
      DB.column("role").varchar(255),
      DB.column("token").text(),
      DB.column("refresh_token_date").timestamp().nullable(),
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
module.exports = TokensMigration
