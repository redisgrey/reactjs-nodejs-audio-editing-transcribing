import React, { useState, useEffect } from "react";

import { useSelector } from "react-redux";

import { RxReset } from "react-icons/rx";

import NotFound from "./NotFound";

import { TextToSpeech } from "tts-react";

function TTS() {
    const { user } = useSelector((state) => state.auth);

    const [value, setValue] = useState("");

    const generateAndDownloadAudio = (text) => {
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
                const url = URL.createObjectURL(blob);

                download(url);
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

                            <div className="form-group w-[80%] mb-3 m-auto d-flex justify-content-around text-center mt-3">
                                <button
                                    className="btn bg-[#E09F3e] hover:bg-[#e09f3e83] focus:bg-[#E09F3e] w-50 me-4 space-x-2 flex justify-center items-center"
                                    onClick={() =>
                                        generateAndDownloadAudio(value)
                                    }
                                    disabled={value === ""}
                                >
                                    Download Audio
                                </button>

                                <button
                                    id="resetBtn"
                                    className="btn btn-danger w-50 me-4 space-x-2 flex justify-center items-center"
                                    onClick={() => {
                                        setValue("");
                                    }}
                                >
                                    <RxReset /> <span>Reset Transcript</span>
                                </button>
                            </div>

                            <TextToSpeech
                                align="horizontal"
                                allowMuting
                                markBackgroundColor="#E09F3E"
                                markColor="white"
                                markTextAsSpoken
                                onBoundary={function noRefCheck() {}}
                                onEnd={function noRefCheck() {}}
                                onError={function noRefCheck() {}}
                                onPause={function noRefCheck() {}}
                                onPitchChange={function noRefCheck() {}}
                                onRateChange={function noRefCheck() {}}
                                onStart={function noRefCheck() {}}
                                onVolumeChange={function noRefCheck() {}}
                                position="topCenter"
                                rate={1}
                                size="large"
                                volume={1}
                            >
                                <div>
                                    <p>{value}</p>
                                </div>
                            </TextToSpeech>
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
