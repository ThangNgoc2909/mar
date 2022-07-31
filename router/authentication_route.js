const express = require('express')
const UserController = require("../controller/user_controller");

const router = express.Router()

router.route('/signup').post(UserController.signUp)

router.route('/login').post(UserController.login)

router.route('/activate').post(UserController.activateAccount)

module.exports = router
