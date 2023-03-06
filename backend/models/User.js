const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,

        required: [true, "Please input your full name"],
    },

    emailAddress: {
        type: String,

        required: [true, "Please input your email address"],

        unique: true,
    },

    password: {
        type: String,

        required: [true, "Please input your password"],
    },
});

module.exports = mongoose.model("User", userSchema);
