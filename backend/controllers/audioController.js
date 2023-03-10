const Audio = require("../models/Audio");

// @desc    Upload Audio
// @route   POST /api/users/upload-audio
// @access  Private
const uploadAudio = async (req, res) => {
    let { audioURL } = req.body;

    if (!audioURL) {
        res.status(400);

        throw new Error("Please upload your audio file");
    }

    // Create User
    const audio = await Audio.create({
        audioURL,
    });

    if (audio) {
        res.json({
            message: "Audio Successfully Uploaded",
        });
    } else {
        res.status(400);

        throw new Error("Invalid audio data");
    }
};

module.exports = {
    uploadAudio,
};
