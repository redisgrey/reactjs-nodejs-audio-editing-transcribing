import React, { useState, useEffect } from "react";

import { useSelector } from "react-redux";

import NotFound from "./NotFound";

import SpeechToText from "./SpeechToText";

import TextToSpeech from "./TTS";

function Dashboard() {
    const { user } = useSelector((state) => state.auth);

    const [firstName, setFirstName] = useState("");

    const [speechToText, setSpeechToText] = useState(false);

    const [textToSpeech, setTextToSpeech] = useState(false);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem("user"));

        if (userData) {
            setFirstName(userData.firstName);
        }
    }, []);

    return (
        <>
            {user ? (
                <>
                    <main className="min-h-[100vh] mt-10 bg-gray-200 font-[Poppins]">
                        <div>
                            <div className="container pt-24 pb-6">
                                <section
                                    aria-labelledby="features-heading"
                                    className="pt-6 pb-24"
                                >
                                    <h2
                                        id="features-heading"
                                        className="sr-only"
                                    >
                                        Features
                                    </h2>

                                    <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
                                        <form className="hidden lg:block">
                                            <h3 className="sr-only">
                                                Features
                                            </h3>
                                            <div className="flex flex-col items-start space-y-7 pb-6 ">
                                                <div className="space-y-5">
                                                    <h1 className="text-5xl font-bold ">
                                                        Hello,{" "}
                                                        <span className="text-[#2081c3]">
                                                            {firstName}
                                                        </span>
                                                        !
                                                    </h1>
                                                    <h3 className="text-md text-center">
                                                        How can I help you
                                                        today?
                                                    </h3>
                                                </div>

                                                <button
                                                    className="w-[100%] text-xl p-2 text-white bg-[black] hover:bg-[#00000067]"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setSpeechToText(true);
                                                        setTextToSpeech(false);
                                                    }}
                                                >
                                                    Speech-To-Text
                                                </button>
                                                <button
                                                    className="w-[100%] text-xl p-2 text-white bg-[black] hover:bg-[#00000067]"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setTextToSpeech(true);
                                                        setSpeechToText(false);
                                                    }}
                                                >
                                                    Text-To-Speech
                                                </button>
                                            </div>
                                        </form>

                                        <div className="lg:col-span-3 ">
                                            {speechToText ? (
                                                <SpeechToText />
                                            ) : null}

                                            {textToSpeech ? (
                                                <TextToSpeech />
                                            ) : null}

                                            {!speechToText && !textToSpeech ? (
                                                <>
                                                    <div className=" font-[Poppins]">
                                                        <div className="container bg-gray-300 h-[80vh]  flex flex-col  items-center">
                                                            <h1 className="text-6xl font-bold mt-72 mb-3">
                                                                Start a{" "}
                                                                <span className="text-[#2081c3]">
                                                                    Project
                                                                </span>
                                                            </h1>
                                                            <h3>
                                                                Choose among the
                                                                features listed
                                                                in the left bar
                                                                to load your
                                                                audio editor.
                                                            </h3>
                                                        </div>
                                                    </div>{" "}
                                                </>
                                            ) : null}
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </main>
                </>
            ) : (
                <>
                    <NotFound
                        title={"Not Authorized"}
                        body={"Please sign in to access the dashboard."}
                        status="401"
                    />
                </>
            )}
        </>
    );
}

export default Dashboard;
