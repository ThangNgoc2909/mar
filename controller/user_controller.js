const { validateEmail } = require("../helper/validation");
const { generateToken } = require("../helper/token");
const { google } = require("googleapis");
const dotenv = require("dotenv");
const User = require("../model/user_info_model");
const bcrypt = require("bcrypt");
const { sendVerificationEmail } = require("../helper/mailer");
const jwt = require("jsonwebtoken");
const { createOtp, verifyOtp } = require("../helper/otp_verification");
const urlParse = require("url-parse");
const queryParse = require("query-string");
const { LocalStorage } = require("node-localstorage");
const oauth_link = "https://developers.google.com/oauthplayground";
const axios = require("axios");
const open = require("open");
dotenv.config();

const {
  EMAIL,
  CLIENT_ID,
  CLIENT_SECRET,
  MAILING_REFRESH_TOKEN,
  MAILING_ACCESS_TOKEN,
} = process.env;

const localStorage = new LocalStorage("./scratch");

signUp = async (req, res) => {
  try {
    const {
      email,
      phoneNumber,
      dateOfBirth,
      gender,
      userName,
      password,
      verified,
    } = req.body;

    const checkEmailExist = await User.findOne({ email });
    if (checkEmailExist) {
      return res.status(400).json({
        data: {
          message:
            "This email address already exists, try with a differnet email address",
          error_code: 301,
        },
      });
    }
    const encryptedPassword = await bcrypt.hash(password, 12);

    const user = await new User({
      email,
      userName,
      additionalInform: [
        {
          date_of_birth: Date.parse(dateOfBirth),
          phone_number: phoneNumber,
          gender: gender,
        },
      ],
      password: encryptedPassword,
      verified,
    }).save();
    if (user == null) return;
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

emailActivation = async (req, res) => {
  try {
    const { deeplink, email } = req.body;
    await sendVerificationEmail(email, deeplink);
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({
          message: "The email address you entered is not connected to account",
        });
    }
    await User.findByIdAndUpdate(user.id, { verified: true });
    res.send({
      ...userModel,
      message: "Account activate successfully!",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({
          message: "The email address you entered is not connected to account",
        });
    }
    const check = bcrypt.compare(password, user.password);
    if (!check) {
      return res
        .status(400)
        .json({ message: "Invalid credentials. Please try again!" });
    }
    const token = generateToken({ id: user._id.toString() }, "7d");
    if (user.verified === false) {
      return res
        .status(400)
        .json({ message: "Account has not been activated!" });
    }
    res.send({
      id: user._id,
      verified: user.verified,
      token: token,
      user: user,
      message: "Login successfully!",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

loginOtp = async (req, res, next) => {
  createOtp(req.body, (err, results) => {
    if (err) {
      return next(err);
    }
    return res.status(200).send({
      message: "Success",
      data: results,
    });
  });
};

otpVerification = async (req, res, next) => {
  verifyOtp(req.body, (err, results) => {
    if (err) {
      return next(err);
    }
    return res.status(200).send({
      message: "Success",
      data: results,
    });
  });
};

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
  await open(url);
  res.send({ url });
};

getAuthentication = async (req, res) => {
  const queryUrl = new urlParse(req.url);
  const codeUrl = queryParse.parse(queryUrl.query).code;
  console.log(codeUrl);
  const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    "http://localhost:3005/getAuthorizationUrl"
  );
  const tokens = await oauth2Client.getToken(codeUrl);
  localStorage.setItem("accesstoken_expiry_date", tokens.tokens.expiry_date);
  res.send({
    token: tokens,
  });
};

module.exports = {
  signUp,
  login,
  loginOtp,
  otpVerification,
  emailActivation,
  getAuthorizationUrl,
  getAuthentication,
};
