/*
Auth
https://www.digitalocean.com/community/tutorials/nodejs-jwt-expressjs

The req is the sent request (GET, POST, DELETE, PUT, etc.).
The res is the response that can be sent back to the user in a multitude of ways (res.sendStatus(200), res.json(), etc.).
The next is a function that can be called to move the execution past the piece of middleware and into the actual app.get server response.
*/

// Validation

const validation = [
    oneOf([
      check("username")
        .notEmpty()
        .exists()
        .withMessage("Username is required")
        .isLength({ min: 3, max: 6 })
        .withMessage("Username must be least from 3 to 6 characters"),
  
      check("username")
        .notEmpty()
        .exists()
        .withMessage("Username is required")
        .isEmail()
        .withMessage("Username not valid"),
    ]),
    check("password").notEmpty().exists().withMessage("Password is required"),
  ]
//   https://www.youtube.com/watch?v=_svzevhv4vg&ab_channel=NikitaDev

// Generate secret key
const SEKRET_KEY = require("crypto").randomBytes(64).toString("hex")