const express = require("express");

const mongoose = require("mongoose");

const app = express();

const cors = require("cors");

const dotenv = require("dotenv").config();

const PORT = process.env.PORT || 5000;

// DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));

db.once("open", () => console.log("Connected to the database"));

// * MIDDLEWARE
app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// * ROUTES

app.listen(PORT, () => console.log(`Server running at PORT ${PORT}`));
