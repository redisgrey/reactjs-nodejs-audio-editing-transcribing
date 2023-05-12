const express = require("express");

const mongoose = require("mongoose");

const app = express();

const cors = require("cors");

const dotenv = require("dotenv").config();

const path = require("path");

const PORT = process.env.PORT || 5000;

// DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error: "));

db.once("open", () => console.log("Connected to the database"));

// * MIDDLEWARE
app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// * ROUTES
app.use("/api/users", require("./backend/routes/userRoutes"));

app.use("/api/text-to-speech", require("./backend/routes/textToSpeech"));

app.use("/api/speech-to-text", require("./backend/routes/speechToText"));

app.use(express.static(path.join(`${__dirname}/frontend`, "build")));

// Serve index.html for all routes except the ones defined above
app.get(/^(?!\/api\/).*/, function (req, res) {
    res.sendFile(path.join(`${__dirname}/frontend`, "build", "index.html"));
});

app.listen(PORT, () => console.log(`Server running at PORT ${PORT}`));
