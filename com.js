const moment = require("moment/moment")
const { DB } = require("./components/db")
const { exec, spawn } = require("node:child_process")
const { Kernel } = require("./http/console/kernel")

function sleep(t) {
  return new Promise((resolve) => {
    setTimeout(resolve, t)
  })
}

async function f() {
  let args = process.argv.slice(2)
  let com_answer = await new Kernel(args, __dirname).distributor()
  console.log(com_answer)
  // exec("nodemon start", (error, stdout, stderr) => {
  //     if (error) {
  //         console.log(`error: ${error.message}`);
  //         return;
  //     }
  //     if (stderr) {
  //         console.log(`stderr: ${stderr}`);
  //         return;
  //     }
  //     console.log(`stdout: ${stdout}`);
  // });
  // await sleep(10000);
  // let delTable = await DB("persons").deleteTable();
  // DB.dataTypes().bigint();
  // let a = DB.dataTypes().varchar(255).default('qwerty');
  // console.log(a);
  // let createTable = await DB("persons").createTable([
  //     DB.column("id").id(),
  //     DB.column("user_id").bigint().foreign('users', 'id'),
  //     DB.column("first_name").varchar(255).default('Valod'),
  //     DB.column("address").varchar(255).nullable(),
  //     DB.column("city").varchar(255),
  //     DB.column("created_at").timestamp(),
  //     DB.column("updated_at").timestamp(),
  // ]);
  // console.log(createTable);
  // let changeColumn = await DB("persons").changeColumn(
  //     DB.column("user_id").bigint().dropForeign('users')
  // );
  // console.log(changeColumn);

  // let addColumns = await DB("persons").addColumns([
  //     DB.column("user_id").bigint().foreign('users', 'id'),
  // ]);
  // console.log(addColumns);
  // let a = 5;
  // let answer = await DB("users")
  //     .when(a < 10, function (query) {
  //         query.where("role", "admin");
  //         query.limit(1);
  //     })
  //     // .where("role", "admin")
  //     // .orWhereBetween("id", 1, 10)
  //     .get();
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
