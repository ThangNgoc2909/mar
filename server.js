const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const logger = require("morgan");
const mongoose = require("mongoose");
const authenticationRoute = require("./router/authentication_route.js");
const getAccessToken = require("./helper/mailer.js");
dotenv.config();
const app = express();

//Socket.io
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const PORT = process.env.PORT || 5000;
const mongoUrl = process.env.MONGO_URL;

mongoose
  .connect(mongoUrl)
  .then(() => console.log("database connected success"))
  .catch((err) => console.log("error connecting to mongodb", err));

const options = {
  origin: PORT,
  useSuccessStatus: 200,
};

app.use(express.json());

//middleware
app.use(logger("dev"));

app.use(cors(options));

app.use("/", authenticationRoute);

io.on("connection", (socket) => {
  console.log(socket.id);
});

server
  .createServer(async function (req, res) {
    if (req.url == "/") {
      res.writeHead(301, { Location: getAccessToken });
      if (req.url.startsWith("/oauth2callback")) {
        // Handle the OAuth 2.0 server response
        let q = url.parse(req.url, true).query;

        if (q.error) {
          console.log("Error:" + q.error);
        } else {
          let { tokens } = await oauth2Client.getToken(q.code);
          oauth2Client.setCredentials(tokens);
          console.log(tokens)
        }
      }
    }
  })
  .listen(PORT, () => {
    console.log(`Server is listening at port ${PORT}`);
  });
