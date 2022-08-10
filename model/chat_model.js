const mongoose = require("mongoose");

const chatModel = new mongoose.Schema(
  {
    chatName: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: false },
    user: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    lastestMessage: {type: mongoose.Schema.Types.ObjectId, ref: 'Message'}
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatModel);
