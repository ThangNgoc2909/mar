const jwt = require('jsonwebtoken')

exports.generateToken = (payload, expiredIn) => {
    return jwt.sign(payload, process.env.TOKEN_SECRET, {expiresIn: expiredIn});
}