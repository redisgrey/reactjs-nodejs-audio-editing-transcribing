const User = require("../models/User");

const jwt = require("jsonwebtoken");

const bcrypt = require("bcrypt");

const registerUser = async (req, res) => {
    try {
        let { fullName, emailAddress, password } = req.body;

        if (!fullName || !emailAddress || !password) {
            res.status(400);
            throw new Error("Please add all fields");
        }

        let emailFormat = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*\.com$/;

        if (!emailAddress.match(emailFormat)) {
            res.status(400);
            throw {
                status: 400,
                message: "Email address should be a valid email address.",
            };
        }

        let passwordFormat =
            /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;

        if (password.match(passwordFormat)) {
            const salt = await bcrypt.genSalt(10);
            var hashedPassword = await bcrypt.hash(password, salt);
        } else {
            res.status(400);
            throw new Error(
                "Password should be between 8 to 15 characters which contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character"
            );
        }

        const userExists = await User.findOne({ emailAddress });

        if (userExists) {
            throw {
                status: 400,
                message:
                    "User already exists. Please choose a different email address.",
            };
        }

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
    } catch (err) {
        console.error(err);
        if (err.status && err.message) {
            res.status(err.status).json({ message: err.message });
        } else {
            res.status(500).send("Something went wrong!");
        }
    }
};

const loginUser = async (req, res) => {
    try {
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
                firstName: user.fullName.split(" ")[0],
            });
        } else {
            throw {
                status: 400,
                message: "Wrong email address or password. Please try again.",
            };
        }
    } catch (err) {
        console.error(err);
        if (err.status && err.message) {
            res.status(err.status).json({ message: err.message });
        } else {
            res.status(500).send("Something went wrong!");
        }
    }
};

const logoutUser = async (req, res) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (decoded) {
                res.json("User successfully logged out!");
            }
        } catch (error) {
            console.log(error);

            res.status(401);

            throw new Error("Not Authorized");
        }
    }
};

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
};
