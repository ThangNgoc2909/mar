const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const oauth_link = "https://developers.google.com/oauthplayground";
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
dotenv.config();

const {
  EMAIL,
  CLIENT_ID,
  CLIENT_SECRET,
  MAILING_REFRESH_TOKEN,
  MAILING_ACCESS_TOKEN,
} = process.env;

const auth = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, oauth_link);

exports.sendVerificationEmail = async (email, url) => {
  auth.setCredentials({ refresh_token: MAILING_REFRESH_TOKEN })
  const accessToken = auth.getAccessToken();
  const html = fs.readFileSync(path.resolve(__dirname, "../index.html"), {
    encoding: "utf-8",
  });
  const replaceHtml = html.replace("####", `${url}`);
  const port = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "Oauth2",
      user: EMAIL,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      refreshToken: MAILING_REFRESH_TOKEN,
      accessToken: accessToken,
    },
  });
  const mailOptions = {
    from: EMAIL,
    to: email,
    subject: "Email verification",
    html: replaceHtml,
  };
  port.sendMail(mailOptions, (err, res) => {
    if (err) return err;
    return res;
  });
};