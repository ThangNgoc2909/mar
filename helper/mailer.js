const nodemailer = require('nodemailer')
const {google} = require('googleapis')
const oauth_link = 'https://developers.google.com/oauthplayground'
const dotenv = require('dotenv')
dotenv.config();

const {EMAIL, CLIENT_ID, CLIENT_SECRET, MAILING_REFRESH_TOKEN} = process.env

const auth = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    oauth_link
)


exports.sendVerificationEmail = async (email, name, url) => {
    auth.setCredentials(
        { refresh_token: MAILING_REFRESH_TOKEN }
    )

    const accessToken = await auth.getAccessToken();
    const port = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'Oauth2',
            user: EMAIL,
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            refreshToken: MAILING_REFRESH_TOKEN,
            accessToken
        }
    });
    const mailOptions = {
        from: EMAIL,
        to: email,
        subject: "Email verification",
        html: `<div style="padding:20px"><span>Activate your account!</span></div><a href="${url}" style="width:200px;padding:10px 15px;background:#4c649b;color:#fff;text-decoration:none;font-weight:600">Confirm your account</a>`
    };
    port.sendMail(mailOptions, (err, res) => {
        if (err) return err;
        return res;
    });
}