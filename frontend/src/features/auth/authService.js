import axios from "axios";

// Register user
const register = async (userData) => {
    const response = await axios.post(
        "http://localhost:5000/api/users/register",
        userData
    );

    if (response.data) {
        localStorage.setItem("user", JSON.stringify(response.data));
    }

    return response.data;
};

// Login user
const login = async (userData) => {
    const response = await axios.post(
        "http://localhost:5000/api/users/login",
        userData
    );

    if (response.data) {
        localStorage.setItem("user", JSON.stringify(response.data));
    }

    return response.data;
};

// Forgot Password
const forgotPassword = async (userData) => {
    const response = await axios.post(
        "http://localhost:5000/api/users/forgot-password",
        userData
    );

    if (response.data) {
        localStorage.setItem("user", JSON.stringify(response.data));
    }

    return response.data;
};

// Reset Password
const resetPassword = async (userData) => {
    const response = await axios.get(
        `http://localhost:5000/api/users/reset-password/:id/:token`,
        userData
    );

    if (response.data) {
        localStorage.setItem("user", JSON.stringify(response.data));
    }

    return response.data;
};

// Update Password
const updatePassword = async (userData) => {
    const response = await axios.post(
        `http://localhost:5000/api/users/update-password`,
        userData
    );

    if (response.data) {
        localStorage.setItem("user", JSON.stringify(response.data));
    }

    return response.data;
};

const authService = {
    register,
    login,
    forgotPassword,
    resetPassword,
    updatePassword,
};

export default authService;
