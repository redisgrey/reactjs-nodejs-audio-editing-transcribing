import { useState, useEffect } from "react";

import { useSelector, useDispatch } from "react-redux";

import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";

import { login, reset } from "../features/auth/authSlice";

import { LockClosedIcon } from "@heroicons/react/20/solid";

import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

function Login() {
    const [loginForm, setLoginForm] = useState({
        emailAddress: "",
        password: "",
    });

    const { emailAddress, password } = loginForm;

    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const dispatch = useDispatch();

    const { user, isLoading, isSuccess, message } = useSelector(
        (state) => state.auth
    );

    useEffect(() => {
        if (isSuccess) {
            toast.success("Successfully signed in to your account!");
            navigate("/dashboard");
        }

        dispatch(reset());
    }, [user, isSuccess, message, navigate, dispatch]);

    const onChange = (e) => {
        setLoginForm((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = (e) => {
        e.preventDefault();

        const userData = {
            emailAddress,
            password,
        };

        dispatch(login(userData))
            .unwrap()
            .then((response) => {
                console.log("response: ", response);
                if (response && response.data) {
                    console.log(response.data);
                } else {
                    console.error("Response or data is undefined");
                }
            })
            .catch((error) => {
                console.log("error: ", error);
                setError(error);
                setTimeout(() => {
                    setError(null);
                }, 5000);
            });
    };

    return (
        <>
            <div className="flex h-[100vh] bg-gray-200 items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                            Sign in to your account
                        </h2>
                        {error ? (
                            <>
                                {" "}
                                <div className="mt-4 bg-red-500 p-3 rounded-lg text-white text-sm">
                                    {error}
                                </div>{" "}
                            </>
                        ) : null}
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={onSubmit}>
                        <div className="-space-y-px rounded-md shadow-sm">
                            <div>
                                <label
                                    htmlFor="emailAddress"
                                    className="sr-only"
                                >
                                    Email address
                                </label>
                                <input
                                    id="emailAddress"
                                    name="emailAddress"
                                    type="email"
                                    required
                                    value={emailAddress}
                                    onChange={onChange}
                                    className="relative  block w-full rounded-t-md border-0 py-1.5 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    placeholder="Email address"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="sr-only ">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={onChange}
                                    className="relative block w-full rounded-b-md border-0 py-1.5 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    placeholder="Password"
                                />
                            </div>
                        </div>
                        <span
                            className="relative bottom-7 left-[415px]"
                            onClick={togglePasswordVisibility}
                        >
                            {showPassword ? (
                                <AiFillEyeInvisible />
                            ) : (
                                <AiFillEye />
                            )}
                        </span>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm">
                                Not yet Registered?
                                <a
                                    className="ms-1 font-medium text-[#2081C3] hover:text-[#2082c373]"
                                    href="/sign-up"
                                >
                                    Sign Up
                                </a>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative flex w-full justify-center rounded-md bg-[#e09F3E] py-2 px-3 text-sm font-semibold text-black hover:bg-[#e09f3e8e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <LockClosedIcon
                                        className="h-5 w-5 text-[#2081C3] group-hover:text-[#2081C3]"
                                        aria-hidden="true"
                                    />
                                </span>
                                {isLoading ? "Loading ..." : "Sign In"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default Login;
