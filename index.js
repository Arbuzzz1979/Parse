const express = require("express");
const dotenv = require("dotenv");
const colors = require('colors')
const connectDB = require('./config/db')

const { jobs_parsing } = require("./cron-jobs");

// Load env vars
dotenv.config({ path: "./config/config.env" });

//Connect to database
connectDB();
 
const app = express();
const PORT = process.env.PORT || 3000;

jobs_parsing()
 
const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);