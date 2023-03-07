const express = require("express");

const router = express.Router();

const {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
    updatePassword,
} = require("../controllers/userController");

//*ROUTES
router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/forgot-password", forgotPassword);

router.get("/reset-password/:id/:token", resetPassword);

router.post("/update-password", updatePassword);

module.exports = router;
