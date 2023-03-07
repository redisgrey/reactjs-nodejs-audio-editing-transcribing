import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import Header from "./components/Header";

import Welcome from "./pages/Welcome";

import NotFound from "./pages/NotFound";

import Login from "./pages/Login";

import Register from "./pages/Register";

import ForgotPassword from "./pages/ForgotPassword";

import ResetPassword from "./pages/ResetPassword";

function App() {
    return (
        <>
            <Router>
                <Header />
                <Routes>
                    <Route path="/" element={<Welcome />} />

                    <Route path="/sign-up" element={<Register />} />

                    <Route path="/sign-in" element={<Login />} />

                    <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                    />

                    <Route
                        path="/reset-password/:id/:token"
                        element={<ResetPassword />}
                    />

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Router>
            <ToastContainer />
        </>
    );
}

export default App;
