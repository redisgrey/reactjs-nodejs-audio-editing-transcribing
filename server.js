const express = require("express");

const { MongoClient } = require("mongodb");

const app = express();

const cors = require("cors");

const dotenv = require("dotenv").config();

const PORT = process.env.PORT || 5000;

// DATABASE CONNECTION
const client = new MongoClient(process.env.MONGO_URI);

if (client) {
    console.log("Connected to the database");
}

// * MIDDLEWARE
app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// * ROUTES
app.use("/api/users", require("./backend/routes/userRoutes"));

app.use("/api/audio", require("./backend/routes/audioRoutes"));

app.listen(PORT, () => console.log(`Server running at PORT ${PORT}`));
