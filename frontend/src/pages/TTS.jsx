import React, { useState, useEffect } from "react";

import { useSelector } from "react-redux";

import { RxReset } from "react-icons/rx";

import { BsDownload } from "react-icons/bs";

import { TextToSpeech } from "tts-react";

import NotFound from "./NotFound";

function TTS() {
    const { user } = useSelector((state) => state.auth);

    const [value, setValue] = useState("");

    const [voices, setVoices] = useState([]);

    const [selectedVoice, setSelectedVoice] = useState(null);

    useEffect(() => {
        const availableVoices = window.speechSynthesis
            .getVoices()
            .filter((voice) => voice.name.includes("Microsoft"));
        setVoices(availableVoices);
        setSelectedVoice(availableVoices[0]);
    }, []);

    const handleVoiceChange = (event) => {
        const voiceName = event.target.value;
        const selectedVoice = voices.find((voice) => voice.name === voiceName);
        setSelectedVoice(selectedVoice);
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
                                    id="resetBtn"
                                    className="btn bg-[#2081c3] hover:bg-[#2082c373] w-50 me-4 space-x-2 flex justify-center items-center"
                                    onClick={() => setValue("")}
                                >
                                    <RxReset /> <span>Reset Transcript</span>
                                </button>
                            </div>
                        </div>

                        <div className="mt-10 container p-5 bg-gray-400">
                            <h1 className="font-bold text-3xl text-center">
                                Check your generated audio here.
                            </h1>
                            <div className="flex justify-center my-4">
                                <select onChange={handleVoiceChange}>
                                    {voices.map((voice) => (
                                        <option
                                            key={voice.name}
                                            value={voice.name}
                                        >
                                            {voice.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <TextToSpeech
                                voice={selectedVoice}
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
