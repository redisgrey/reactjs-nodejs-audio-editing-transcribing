const mongoose = require("mongoose");

const audioSchema = new mongoose.Schema({
    audioURL: {
        type: String,

        required: [true, "Please upload your audio"],
    },
});

module.exports = mongoose.model("Audio", audioSchema);
