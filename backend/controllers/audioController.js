const Audio = require("../models/Audio");

// @desc    Save Audio to Database
// @route   POST /api/audio
// @access  Private
const saveAudio = async (req, res) => {
    try {
        const audio = new Audio({
            name: req.file.originalname,
            data: req.file.buffer,
            contentType: req.file.mimetype,
        });

        await audio.save();
        res.status(201).send(audio);
    } catch (error) {
        res.status(400).send(error);
    }
};

// @desc    Get All Audio from Database
// @route   GET /api/audio
// @access  Private
const getAllAudio = async (req, res) => {
    try {
        const audio = await Audio.find();
        res.status(200).json(audio);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Something went wrong." });
    }
};

// @desc    Delete Audio in Database
// @route   PUT /api/audio
// @access  Private
const deleteAudio = async (req, res) => {
    try {
        const audio = await Audio.findByIdAndDelete(req.params.id);
        if (!audio) {
            return res.status(404).send();
        }

        res.send(audio);
    } catch (error) {
        res.status(500).send(error);
    }
};

module.exports = {
    saveAudio,
    deleteAudio,
    getAllAudio,
};
