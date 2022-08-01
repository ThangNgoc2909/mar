const otpGen = require('otp-generator');
const crypto = require('crypto')
const key = "otp-secret-key"

exports.createOtp = async (params, callback) => {
    const otp = otpGen.generate(4, {
        specialChars: false,
        upperCaseAlphabets: false,
    })
    const ttl = 5 * 60 * 1000
    const expireDate = Date.now() + ttl;
    const data = `${params.phone}.${otp}.${expireDate}`
    console.log(otp);
    const hash = crypto.createHmac("sha256", key).update(data).digest("hex")
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
