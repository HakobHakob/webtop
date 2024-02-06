// https://schadokar.dev/posts/how-to-send-email-in-nodejs-with-expressjs/
const nodemailer = require("nodemailer")
const { conf } = require("../../config/app_config")

let transporter = nodemailer.createTransport(conf.mail.transporter)

let userNotification = async (
  email,
  subject = "",
  message = "",
  type = "text"
) => {
  if (
    email &&
    typeof email === "string" &&
    typeof subject === "string" &&
    typeof message === "string" &&
    (type === "text" || type === "html")
  ) {
    let options = {
      from: conf.mail.from, //'webtop@info.com'
      to: email,
      subject: subject,
      [type]: message, //text or html: message
    }
    try {
      await transporter.sendMail(options)
      return true
    } catch (e) {
      console.error(e)
      return false
    }
  }
  console.error(
    "Something went wrong in the sendmail method.Not required arguments for userNotification."
  )
  return false
}

// const userNotification = async (mailObj) => {
//   const { from, to, subject, text } = mailObj

//   try {
//     // Create a transporter
//     const transporter = nodemailer.createTransport(conf.mail.transporter)

//     // send mail with defined transport object
//     const mailOptions = {
//       from: conf.mail.from, // sender address
//       to: to, // list of receivers
//       subject: subject, // Subject line
//       text: text, // plain text body
//       html: {
//         path: path.resolve(__dirname, "../../views/layouts/main/mail.ejs"),
//       }, // html body
//     }
//     const info = await transporter.sendMail(mailOptions)
//     console.log(`Message sent: ${info.messageId}`)

//     return `Message sent: ${info.messageId}`
//   } catch (error) {
//     console.error(error)
//     throw new Error(
//       `Something went wrong in the sendmail method. Error: ${error.message}`
//     )
//   }
// }

module.exports = { userNotification }
