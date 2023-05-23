import axios from "axios";

const register = async (userData) => {
    const response = await axios.post("/api/users/register", userData);

    if (response.data) {
        localStorage.setItem("user", JSON.stringify(response.data));
    }

    return response.data;
};

const login = async (userData) => {
    const response = await axios.post("/api/users/login", userData);

    if (response.data) {
        localStorage.setItem("user", JSON.stringify(response.data));
    }

    return response.data;
};

const logout = async () => {
    const response = await axios.post("/api/users/logout");

    if (response.data) {
        localStorage.removeItem("user");
    }

    return response.data;
};

const authService = {
    register,
    login,
    logout,
};

export default authService;
