const mongoose = require("mongoose");

const audioSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    url: {
        type: String,
    },
});

module.exports = mongoose.model("Audio", audioSchema);
