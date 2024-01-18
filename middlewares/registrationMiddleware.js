const express = require("express")

const { User } = require("../models")

module.exports = class authController {
  static register(req, res) {
    User.create({
      MOBILE_NO: req.body.mobile,
      PASSWORD: req.body.password,
      SALT: "",
    })
      .then(function (data) {
        res.json(data.toJSON())
      })
      .catch((err) => {
        res.json({
          error: err.errors[0].message,
        })
      })
  }
  static login(req, res) {
    var message = []
    var success = false
    var status = 404
    User.findOne({
      where: {
        MOBILE_NO: req.body.mobile,
      },
    }).then(function (user) {
      if (user) {
        message.push("user found")
        if (user.validPassword(req.body.password)) {
          status = 200
          success = true
          message.push("You are authorised")
        } else {
          message.push("Check Credentials")
        }
      } else {
        message.push("Check Credentials")
      }

      res.json({ status, success, message })
    })
  }
}
