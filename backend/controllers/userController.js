const User = require("../models/User");

const jwt = require("jsonwebtoken");

const bcrypt = require("bcrypt");

// @desc    Register New User
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
    let {
        fullName,

        emailAddress,
        password,
    } = req.body;

    if (!fullName || !emailAddress || !password) {
        res.status(400);

        throw new Error("Please add all fields");
    }

    //Check password pattern
    let passwordFormat =
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;

    if (password.match(passwordFormat)) {
        // Hash the password
        const salt = await bcrypt.genSalt(10);

        var hashedPassword = await bcrypt.hash(password, salt);
    } else {
        res.json(
            "Password should be between 8 to 15 characters which contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character"
        );
    }

    // Check if user exists
    const userExists = await User.findOne({ emailAddress });

    if (userExists) {
        res.status(400);

        throw new Error("User already exists");
    }

    // Create User
    const user = await User.create({
        fullName,

        emailAddress,
        password: hashedPassword,
    });

    if (user) {
        res.json({
            message: "Account successfully created!",
        });
    } else {
        res.status(400);

        throw new Error("Invalid user data");
    }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
// * email address
// * password
const loginUser = async (req, res) => {
    const { emailAddress, password } = req.body;

    if (!emailAddress || !password) {
        res.status(400);

        throw new Error("Please add all fields");
    }

    const user = await User.findOne({ emailAddress: emailAddress });

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            id: user.id,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);

        throw new Error("Invalid credentials");
    }
};

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

module.exports = {
    registerUser,
    loginUser,
};
