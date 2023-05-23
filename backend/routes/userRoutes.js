const express = require("express");

const router = express.Router();

const {
    registerUser,
    loginUser,
    logoutUser,
} = require("../controllers/userController");

const errorMiddleware = require("../middlewares/errorMiddleware");

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/logout", logoutUser);

router.use(errorMiddleware);

module.exports = router;
