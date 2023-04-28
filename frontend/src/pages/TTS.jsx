import React, { useState, useEffect } from "react";

import { useSelector } from "react-redux";

import { RxReset } from "react-icons/rx";

import NotFound from "./NotFound";

function TTS() {
    const { user } = useSelector((state) => state.auth);

    const [value, setValue] = useState("");

    const [audioElement, setAudioElement] = useState(null);

    const generateAudio = (text) => {
        const endpoint = `http://localhost:5000/api/text-to-speech?text=${value}`;
        fetch(endpoint)
            .then((response) => {
                console.log(response);
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }

                return response.arrayBuffer();
            })
            .then((buffer) => {
                const blob = new Blob([buffer], { type: "audio/mpeg" });
                console.log(blob);
                const newAudioElement = document.createElement("audio");
                newAudioElement.src = URL.createObjectURL(blob);

                setAudioElement(newAudioElement);
            })
            .catch((error) => {
                console.error("Error fetching audio:", error);
            });
    };

    const download = (url) => {
        const link = document.createElement("a");
        link.href = url;

        const date = new Date();
        const filename = `audio-tts-${date.getFullYear()}${
            date.getMonth() + 1
        }${date.getDate()}-${date.getHours()}${date.getMinutes()}${date.getSeconds()}.mp3`;

        link.download = filename;
        link.click();
    };

    return (
        <>
            {user ? (
                <>
                    {" "}
                    <div className=" font-[Poppins] bg-gray-300">
                        <div className="container p-10">
                            <div className="form-group mt-5">
                                <textarea
                                    id="textarea"
                                    rows="10"
                                    className="form-control"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    placeholder="Enter your text here..."
                                ></textarea>
                            </div>

                            <div className="form-group w-[80%] m-auto d-flex justify-content-around text-center mt-3">
                                <button
                                    className="btn bg-[#E09F3e] hover:bg-[#e09f3e83] focus:bg-[#E09F3e] w-50 me-4 space-x-2 flex justify-center items-center"
                                    onClick={() => generateAudio(value)}
                                >
                                    Generate Audio
                                </button>

                                <button
                                    className="btn bg-[#E09F3e] hover:bg-[#e09f3e83] focus:bg-[#E09F3e] w-50 me-4 space-x-2 flex justify-center items-center"
                                    onClick={() => download(audioElement.src)}
                                    disabled={audioElement ? false : true}
                                >
                                    Download Audio
                                </button>
                                <button
                                    id="resetBtn"
                                    className="btn btn-danger w-50 me-4 space-x-2 flex justify-center items-center"
                                    onClick={() => {
                                        setValue("");
                                        setAudioElement(null);
                                    }}
                                >
                                    <RxReset /> <span>Reset Transcript</span>
                                </button>
                            </div>
                            <div className="mt-3 ">
                                {audioElement && (
                                    <audio
                                        controls
                                        style={{ width: "100%" }}
                                        src={audioElement.src}
                                    />
                                )}
                            </div>
                        </div>
                    </div>{" "}
                </>
            ) : (
                <>
                    {" "}
                    <NotFound
                        title={"Not Authorized"}
                        body={"Please sign in to access Script features."}
                        status="401"
                    />{" "}
                </>
            )}
        </>
    );
}

export default TTS;
