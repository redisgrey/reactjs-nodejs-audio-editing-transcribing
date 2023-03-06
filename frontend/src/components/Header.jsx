import React, { useState } from "react";

function Header() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <header className="h-[80px] shadow-lg py-2 font-[Poppins] bg-white w-[100%] fixed top-0 z-[100]">
                <nav>
                    {/* NAVIGATION IN MID SCREEN ONWARDS */}
                    <div className="hidden justify-between items-center md:flex">
                        <div className="flex justify-around w-[200px]">
                            <a
                                className="hover:text-[#00000079]"
                                href="/features"
                            >
                                Features
                            </a>
                            <a
                                className="hover:text-[#00000079]"
                                href="/pricing"
                            >
                                Pricing
                            </a>
                        </div>
                        <div>
                            <a href="/">
                                <img
                                    className="w-[150px] h-[60px]"
                                    src="./images/logo.png"
                                    alt="Logo"
                                />
                            </a>
                        </div>
                        <div className="flex w-[100px] justify-center">
                            <a
                                className="hover:text-[#00000079]"
                                href="/sign-in"
                            >
                                Sign In
                            </a>
                        </div>
                    </div>

                    {/* NAVIGATION IN SMALL SCREEN */}
                    <div className="flex justify-between items-center md:hidden">
                        <div>
                            <img
                                className="w-[150px] h-[60px]"
                                src="./images/logo.png"
                                alt="Logo"
                            />
                        </div>
                        {/* HAMBURGER ICON */}
                        <div className="fixed top-2 right-10">
                            {open === true ? (
                                <button
                                    id="hamburgerBtn"
                                    className="block open hamburger md:hidden focus:outline-none"
                                    onClick={() => setOpen(false)}
                                >
                                    <span className="hamburger-top"></span>
                                    <span className="hamburger-middle"></span>
                                    <span className="hamburger-bottom"></span>
                                </button>
                            ) : (
                                <button
                                    id="hamburgerBtn"
                                    className="block hamburger md:hidden focus:outline-none"
                                    onClick={() => setOpen(true)}
                                >
                                    <span className="hamburger-top"></span>
                                    <span className="hamburger-middle"></span>
                                    <span className="hamburger-bottom"></span>
                                </button>
                            )}
                        </div>
                    </div>
                    {open === true ? (
                        <div>
                            <div className="flex flex-col justify-center items-center relative z-50 space-y-10 p-10 shadow-lg bg-white">
                                <a
                                    className="hover:text-[#00000079]"
                                    href="/features"
                                >
                                    Features
                                </a>
                                <a
                                    className="hover:text-[#00000079]"
                                    href="/pricing"
                                >
                                    Pricing
                                </a>
                                <a
                                    className="hover:text-[#00000079]"
                                    href="/sign-in"
                                >
                                    Sign In
                                </a>
                            </div>
                        </div>
                    ) : null}
                </nav>
            </header>
        </>
    );
}

export default Header;
