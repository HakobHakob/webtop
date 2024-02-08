const { DB } = require("../../../components/db")
const table = "users" //change as you see fit

class Migration /*migration-separator*/ {
  constructor() {
    //
  }

  async up() {
    await DB(table).createTable([
      DB.column("id").id(),
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
