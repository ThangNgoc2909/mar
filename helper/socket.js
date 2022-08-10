
module.exports = (app, io, db) => {
  io.on("connection", function (socket) {
    socket.on("_getUsers", ({ senderEmail }) => {
      io.emit("_allUser", data);
    });
  });
};
