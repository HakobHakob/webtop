# sample_nodejs

```
npx express-generator --view=ejs
```

```
npm i
```

- Additional packages

```
npm i express-ejs-layouts
npm i mysql
npm i sync-mysql
npm i bcrypt
npm i mysql2
npm i express-form-data
npm i express-session
npm i express-validator
npm i express-fileupload
npm i cors
npm install cookie-parser
npm i moment
npm i nodemailer
npm install --save multer
npm i node-cron
npm i joi
npm i jsonwebtoken
npm i dotenv
npm i sequelize
npm i sequelize-cli
npx sequelize-cli init
npm i sharp
npm i winston
npm i uuid
npm i md5
npm i file-type
```

- Migrations

```
npx sequelize-cli model:generate --name User --attributes firstName:string,lastName:string,email:string
npx sequelize-cli migration:generate --name session
npx sequelize-cli db:migrate
npx sequelize-cli db:migrate:undo
npx sequelize-cli db:migrate:undo:all --to XXXXXXXXXXXXXX-create-user.js
```

- Seeders

```
npx sequelize-cli seed:generate --name products-seeder
npx sequelize-cli db:seed --seed <seed-file-name>
npx sequelize-cli db:seed:all
npx sequelize-cli db:seed:undo
npx sequelize-cli db:seed:undo --seed name-of-seed-as-in-data
npx sequelize-cli db:seed:undo:all
```

group auth middleware
translate
auth
socket

# node com help

```
node com migrate                                           Migrate all.
node com migrate table1 table2 ...                         Migrate table1, table2 ... by sequence.
node com make:migration table1 table2 ...                  Make a table1, table2 ... migration(s) skeleton file(s).
node com seed                                              Seed all.
node com seed table1 table2 ...                            Seed table1, table2 ... by sequence.
node com make:seeder table1 table2 ...                     Make a table1, table2 ... seeder(s) skeleton file(s).
node com make:controller controller1 controller2 ...       Make a controller(s) skeleton file(s).
node com make:command command1 command2 ...                Make a command(s) skeleton file(s).
node com make:resource resource1 resource2 ...             Make a resource(s) skeleton file(s).
node com make:notification notification1 notification2 ... Make a notification(s) skeleton file(s).

```
