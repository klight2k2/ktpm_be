require("dotenv").config();

const path = require("path");
const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
var morgan = require("morgan");

const route = require("./routes/index");

const app = express();

const mysql = require("mysql2");

const PORT = process.env.PORT || 3001;

var connection = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  database: "itss",
  insecureAuth: true,
  password: "",
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
  idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

app.use(morgan("common"));

app.use(bodyParser.json());
app.use(cors());
// app.use(function(req, res, next) {
// 	res.header("Access-Control-Allow-Origin", "*");
// 	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
// 	next();
//   });
// route(app)
app.use("/api", route);
app.listen(PORT, function () {
  console.log("Example app listening at", PORT);
});
