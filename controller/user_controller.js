const { validateEmail } = require('../helper/validation');
const { generateToken } = require('../helper/token');
const User = require('../model/user_model');
const bcrypt = require('bcrypt');
const { sendVerificationEmail } = require('../helper/mailer');
const jwt = require('jsonwebtoken');
const {createOtp, verifyOtp} = require('../helper/otp_verification')

signUp = async (req, res) => {
    try {
        const {
            email,
            userName,
            password,
            verified,
        } = req.body;

        if (!validateEmail(email)) {
            return res.status(400).json({
                message: "Invalid email address"
            });
        }

        const check = await User.findOne({ email })
        if (check) {
            return res.status(400).json({
                message: "This email address already exists, try with a differnet email address"
            });
        }
        const encryptedPassword = await bcrypt.hash(password, 12)

        const user = await new User({
            email,
            userName,
            password: encryptedPassword,
            verified
        }).save();
        res.send({
            id: user._id,
            verified: user.verified,
            message: "Register successfully!"
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

emailActivation = async (req, res) => {
    try {
        const {deeplink, email} = req.body
    await sendVerificationEmail(email, deeplink)
    const user = await User.findOne({email})
    if (!user) {
        return res.status(400).json({message: "The email address you entered is not connected to account"})
    }
    await User.findByIdAndUpdate(user.id, {verified: true})
    res.send({
        id: user._id,
        verified: user.verified,
        user: user,
        message: "Account activate successfully!"
    })
    } catch (err) {
        res.status(500).json({message: err.message})
    }
}

login = async (req, res) => {
    try {
        const {email, password} = req.body
        const user = await User.findOne({email})
        if (!user) {
            return res.status(400).json({message: "The email address you entered is not connected to account"})
        }
        const check = bcrypt.compare(password, user.password);
        if (!check) {
            return res.status(400).json({message: "Invalid credentials. Please try again!"})
        }   
        const token = generateToken({id: user._id.toString()}, "7d")
        if (user.verified === false) {
            return res.status(400).json({message: "Account has not been activated!"})
        }
        res.send({
            id: user._id,
            verified: user.verified,
            token: token,
            user: user,
            message: "Login successfully!"
        })
    } catch (err) {
        res.status(500).json({message: err.message})
    }
}

loginOtp = async (req, res, next) => {
    createOtp(req.body, (err, results) => {
        if (err) {
            return next(err)
        }
        return res.status(200).send({
            message: "Success",
            data: results
        })
    })
}

otpVerification = async (req, res, next) => {
    verifyOtp(req.body, (err, results) => {
        if (err) {
            return next(err)
        }
        return res.status(200).send({
            message: "Success",
            data: results,
        })
    })
}

module.exports = {
    signUp,
    login,
    loginOtp,
    otpVerification,
    emailActivation,
}