const express = require("express");

const router = express.Router();

const { registerUser, loginUser } = require("../controllers/userController");

const { uploadAudio } = require("../controllers/audioController");

//*ROUTES
router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/upload-audio", uploadAudio);

module.exports = router;
