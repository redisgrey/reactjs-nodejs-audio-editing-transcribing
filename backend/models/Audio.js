const mongoose = require("mongoose");

const audioSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    data: {
        type: Buffer,
        required: true,
    },
    contentType: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model("Audio", audioSchema);
