const moment = require("moment")
const { DB } = require("./components/db")

/*
SELECT column1, column2, ... FROM
table_name;

INSERT INTO table_name (column1, column2, column3, ...)
VALUES (value1, value2, value3, ...);

DELETE FROM table_name WHERE condition;

UPDATE table_name
SET column1 = value1, column2 = value2, ...
WHERE condition;


*/

async function f() {
  // DB.dataTypes().bigint();
  // let a = DB.dataTypes().varchar(255).default("tambrdam")

  // console.log(a)

  // let createTable = await DB("persons").createTable({
  //   // id: DB.dataTypes().a1().a2().a3,
  //   person_id: "bigint NOT NULL",
  //   last_name: "varchar(255)",
  //   address: "varchar(255)",
  //   city: "varchar(255)",
  // })
  // console.log(createTable)

  // let answer = await DB("users").where("role", "admin").orWhereBetween("id", 1, 10).get();
  // console.log(answer);

  // let answer = await DB("users").where("role", "admin").where(function (query) {
  //     query.where('last_name', 'Root').orWhere('last_name', 'User');
  // }).get();
  // console.log(answer);
  //node com --app=init map=init    esiminch=true
  // let args = process.argv.slice(2);
  // console.log(args);//['--app=init', 'map=init', 'esiminch=true']

  // let page = 1;
  // let perPage = 2;
  // let answer = await DB('sessions')
  //     .where('role', 'admin')
  //     .whereHas('users', 'user_id', 'id', function (query) {
  //         query.where('role', 'admin');
  //         query.orWhere('role', 'user');
  //     }).get();
  // console.log(answer);

  // let nn = await DB('sessions').whereNotNull('refresh').get();
  // console.log(nn);

  // let sum = await DB('sessions').sum('user_id');
  // console.log(sum);

  // let tr = await DB('sessions').truncate();
  // console.log(tr);

  // let l = await DB('sessions').where('role', 'admin').get(['user_id', 'role']);
  // console.log(l);

  // let f = await DB('sessions').where('user_id', '>',  1).first(['user_id', 'role', 'token']);
  // console.log(f);

  // let fi = await DB('users').find("1");
  // console.log(fi);

  // let cn = await DB('sessions').where('user_id', '>', 1).get();
  // console.log(cn);

  // let ex = await DB('sessions').where('user_id', '>', 1).exists();
  // console.log(ex);

  // let d = await DB('sessions').where('user_id', '>', 1).delete();
  // console.log(d);

  // let u = await DB('sessions').where('role', 'admin')
  //     .update({
  //         token: "zprti_token",
  //         role: "geghci",
  //     });
  // console.log(u);

  // let c= await DB('sessions').create({
  //     user_id: 4,
  //     role: 'admin',
  //     token: 'newToken4',
  //     // refresh: moment().format('yyyy-MM-DD HH:mm:ss'),
  //     // updated_at: moment().format('yyyy-MM-DD HH:mm:ss'),
  // });
  // console.log(c);

  // let ca = await DB('sessions').create(
  //         [
  //             {
  //                 user_id: 1,
  //                 role: 'admin',
  //                 token: 'newToken1',
  //                 refresh: moment().format('yyyy-MM-DD HH:mm:ss'),
  //                 updated_at: moment().format('yyyy-MM-DD HH:mm:ss'),
  //             },
  //             {
  //                 user_id: 2,
  //                 role: 'admin',
  //                 token: 'newToken2',
  //                 refresh: moment().format('yyyy-MM-DD HH:mm:ss'),
  //                 updated_at: moment().format('yyyy-MM-DD HH:mm:ss'),
  //             },
  //             {
  //                 user_id: 3,
  //                 role: 'admin',
  //                 token: 'newToken3',
  //                 refresh: moment().format('yyyy-MM-DD HH:mm:ss'),
  //                 updated_at: moment().format('yyyy-MM-DD HH:mm:ss'),
  //             },
  //         ]
  //     )
  // ;
  // console.log(ca);

  process.exit(1)
}

f()
