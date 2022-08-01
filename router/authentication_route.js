const express = require('express')
const UserController = require("../controller/user_controller");

const router = express.Router()

router.route('/signup').post(UserController.signUp)

router.route('/login').post(UserController.login)

router.route('/activate').post(UserController.activateAccount)

router.route('/otpVerification').post(UserController.loginOtp)

router.route('/verifyOtp').post(UserController.otpVerification)

module.exports = router
