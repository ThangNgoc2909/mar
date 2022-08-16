const express = require('express')
const UserController = require("../controller/user_controller");

const router = express.Router()

router.route('/signup').post(UserController.signUp)

router.route('/login').post(UserController.login)

router.route('/otpVerification').post(UserController.loginOtp)

router.route('/verifyOtp').post(UserController.otpVerification)

router.route('/activateAccount').post(UserController.emailActivation)

router.route('/getAuthorizationUrl').post(UserController.getAuthorizationUrl)

router.route('/getAuthorizationUrl').get(UserController.getAuthentication)

module.exports = router
