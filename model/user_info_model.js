const mongoose = require("mongoose");

const userInfoModel = new mongoose.Schema({
  email: { type: String, require: true },
  username: { type: String },
  password: { type: String, require: true },
  verified: { type: Boolean, require: true },
  additionalInform: [
    {
      date_of_birth: { type: Date },
      phone_number: { type: String },
      gender: { type: Number, require: true },
    },
  ],
});

module.exports = mongoose.model("User", userInfoModel);
