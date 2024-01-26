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
npx sequelize-cli db:seed:all
npx sequelize-cli db:seed:undo
npx sequelize-cli db:seed:undo --seed name-of-seed-as-in-data
npx sequelize-cli db:seed:undo:all
```

group auth middleware
translate
auth
socket
