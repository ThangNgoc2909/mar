const { validateEmail } = require('../helper/validation');
const { generateToken } = require('../helper/token');
const { google } = require("googleapis");
const dotenv = require("dotenv");
const User = require('../model/user_model');
const bcrypt = require('bcrypt');
const { sendVerificationEmail } = require('../helper/mailer');
const jwt = require('jsonwebtoken');
const {createOtp, verifyOtp} = require('../helper/otp_verification')
const urlParse = require('url-parse')
const queryParse = require('query-string');
const axios = require('axios');
const promise = require('bluebird');
const oauth_link = "https://developers.google.com/oauthplayground";
dotenv.config();

const {
    EMAIL,
    CLIENT_ID,
    CLIENT_SECRET,
    MAILING_REFRESH_TOKEN,
    MAILING_ACCESS_TOKEN,
  } = process.env;

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

getAuthorizationUrl = async (req, res) => {
    const oauth2Client = new google.auth.OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      "http://localhost:3005/getAuthorizationUrl"
    );
    const scopes = ["https://mail.google.com/"];
  
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      include_granted_scopes: true,
    });
    res.send({
      url
    });
  };
  
  getAuthentication = async (req, res) => {
    const queryUrl = new urlParse(req.url)
    const codeUrl = queryParse.parse(queryUrl.query).code;
    console.log(codeUrl)
    const oauth2Client = new google.auth.OAuth2(
        CLIENT_ID,
        CLIENT_SECRET,
        "http://localhost:3005/getAuthorizationUrl"
      );
    const tokens = await oauth2Client.getToken(codeUrl);
    console.log(tokens)
    return
    try {
        const results = await axios({
            method: "POST",
            headers: {
                authorization: "Bearer " + tokens.tokens.access_token
            },
            "Content-Type": "application/json",
            url: `https://www.googleapis.com/fitness/v1/users/userId/dataset:aggregate`,
            data: {
                "aggregateBy": [
                    {
                      "dataTypeName": "com.google.step_count.delta",
                      "dataSourceId": "derived:com.google.step_count.delta:com.google.android.gms:merge_estimated_steps"
                    }
                  ],
                  "bucketByTime": {
                    durationMillis: 86400000
                  },
                  "startTimeMillis": 1585785599000,
                  "endTimeMillis": 158595839000,
            }
        })
        console.log(results)
    } catch (err) {
        console.log(err)
    }
  }

module.exports = {
    signUp,
    login,
    loginOtp,
    otpVerification,
    emailActivation,
    getAuthorizationUrl,
    getAuthentication
}

//4/0AdQt8qivDaIMCDGQhkTHLocPgI4yAYGdNwuJcel53GGAI1cFd2Gcm-gmtgEKpaYrXCFaag