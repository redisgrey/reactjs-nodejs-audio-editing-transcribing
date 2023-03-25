const express = require("express");

const router = express.Router();

const {
    registerUser,
    loginUser,
    logoutUser,
} = require("../controllers/userController");

const errorMiddleware = require("../middlewares/errorMiddleware");

//*ROUTES
router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/logout", logoutUser);

// Add the error middleware function to the router
router.use(errorMiddleware);

module.exports = router;
