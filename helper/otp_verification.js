const crypto = require('crypto');
const { sendSMS } = require('../helper/send_message')
const key = "otp-secret-key"

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env 

exports.createOtp = async (params, callback) => {
    const otp = Math.floor(1000 + Math.random() * 9000);
    const bodySMS = `Your OTP is ${otp}`
    const ttl = 5 * 60 * 1000
    const expireDate = Date.now() + ttl;
    const data = `${params.phone}.${otp}.${expireDate}`
    const hash = crypto.createHmac("sha256", key).update(data).digest("hex")
    const phoneNumber = params.phone.replace('0', '+84')
    console.log('phoneNumber', phoneNumber);
    sendSMS(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, bodySMS, phoneNumber)
    const fullHash = `${hash}.${expireDate}`
    return callback(null, fullHash)
}

exports.verifyOtp = async (params, callback) => {
    let [hashValue, expires] = params.hash.split('.');
    console.log(expires);
    let now = Date.now()
    if (now > parseInt(expires)) return callback("OTP Expired")
    let data = `${params.phone}.${params.otp}.${expires}`
    let newCalculateHash = crypto.createHmac("sha256", key).update(data).digest("hex")
    if (newCalculateHash === hashValue) {
        return callback(null, "Success")
    } else {
        return callback(null, "Invalid OTP")
    }
}
