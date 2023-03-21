const express = require("express");

const router = express.Router();

const {
    saveAudio,
    getAllAudio,
    deleteAudio,
} = require("../controllers/audioController");

//*ROUTES
router.post("/", saveAudio);

router.get("/", getAllAudio);

router.put("/", deleteAudio);

module.exports = router;
