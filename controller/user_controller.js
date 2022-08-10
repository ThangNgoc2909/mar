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
        // const emailVerificationToken = generateToken({id: user._id.toString()}, '30m');
        // const url = `${process.env.BASE_URL}/activate/${emailVerificationToken}`
        // await sendVerificationEmail(user.email, user.userName, url)
        res.send({
            id: user._id,
            verified: user.verified,
            message: "Register successfully!"
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

activateAccount = async (req, res) => {
    const {token} = req.body;
    const user = jwt.verify(token, process.env.TOKEN_SECRET)
    console.log(user);
    const check = await User.findById(user.id)
    if (check.verified === true) {
        return res.status(400).json({message: "this email is already activated"})
    } else {
        await User.findByIdAndUpdate(user.id, {verified: true})
        return res.status(200).json({message: "Account has been activated"})
    }
}

login = async (req, res) => {
    try {
        const {email, password} = req.body
        const user = await User.findOne({email})
        console.log(user)
        if (!user) {
            return res.status(400).json({message: "The email address you entered is not connected to account"})
        }
        const check = bcrypt.compare(password, user.password);
        if (!check) {
            return res.status(400).json({message: "Invalid credentials. Please try again!"})
        }
        const token = generateToken({id: user._id.toString()}, "7d")
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
    activateAccount,
    loginOtp,
    otpVerification
}