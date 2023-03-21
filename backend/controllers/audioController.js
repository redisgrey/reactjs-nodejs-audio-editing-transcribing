const Audio = require("../models/Audio");

// @desc    Save Audio to Database
// @route   POST /api/audios
// @access  Private
const saveAudio = async (req, res) => {
    let { name, url } = req.body;

    console.log(req.body);
    if (!name || !url) {
        res.status(400);

        throw new Error("Please add all fields");
    }

    const audio = await Audio.create(
        {
            name,
            url,
        },
        { timeout: 30000 }
    );

    if (audio) {
        res.json({
            message: "Audio saved successfully!",
        });
    } else {
        res.status(400);

        throw new Error("Invalid audio data");
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
