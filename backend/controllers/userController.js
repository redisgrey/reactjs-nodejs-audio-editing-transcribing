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

// @desc    Forgot Password
// @route   POST /api/users/forgot-password
// @access  Public
// * email address
const forgotPassword = async (req, res) => {
    const { emailAddress } = req.body;

    try {
        if (!emailAddress) {
            res.status(400);

            throw new Error("Please add all fields");
        }

        const user = await User.findOne({ emailAddress: emailAddress });

        if (!user) {
            res.json("User does not exist!");
        }

        const secret = process.env.JWT_SECRET + user.password;

        const token = jwt.sign(
            { email: user.emailAddress, id: user._id },
            secret,
            {
                expiresIn: "5m",
            }
        );

        const link = `http://localhost:5000/reset-password/${user._id}/${token}`;

        console.log(link);
    } catch (error) {
        console.log(error);
    }
};

// @desc    Reset Password
// @route   GET /api/users/reset-password/:id/:token
// @access  Private
const resetPassword = async (req, res) => {
    const { id, token } = req.params;
    console.log(req.params);
    try {
        const user = await User.findOne({ _id: id });

        if (!user) {
            res.json("User does not exist!");
        }

        const secret = process.env.JWT_SECRET + user.password;

        const verify = jwt.verify(token, secret);

        res.send("Verified");
    } catch (error) {
        console.log(error);
        res.send("Not Verified");
    }
};

// @desc    Update Password
// @route   POST /api/users/reset-password/:id/:token
// @access  Private
const updatePassword = async (req, res) => {
    const { id, token } = req.params;
    const { password, confirmPassword } = req.body;
    try {
        if (password !== confirmPassword) {
            res.json("Passwords does not Match!");
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

        const user = await User.findOne({ _id: id });

        if (!user) {
            res.json("User does not exist!");
        }

        const secret = process.env.JWT_SECRET + user.password;

        const verify = jwt.verify(token, secret);

        const changePassword = await User.updateOne(
            { _id: id },
            { $set: { password: hashedPassword } }
        );

        if (changePassword) {
            res.json("Password Updated");
        }
    } catch (error) {
        console.log(error);
    }
};

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

module.exports = {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
    updatePassword,
};
