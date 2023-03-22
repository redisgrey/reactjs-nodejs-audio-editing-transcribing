import React, { useState } from "react";

import { useSelector } from "react-redux";

import { RxReset } from "react-icons/rx";

import { BsDownload } from "react-icons/bs";

import { TextToSpeech } from "tts-react";

import NotFound from "./NotFound";

function TTS() {
    const { user } = useSelector((state) => state.auth);

    const [value, setValue] = useState("");

    const [textURL, setTextURL] = useState(null);

    const setValueDownload = (e) => {
        setValue(e.target.value);

        const textBlob = new Blob([e.target.value], { type: "text/plain" });

        const textDownloadURL = URL.createObjectURL(textBlob);

        setTextURL(textDownloadURL);
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
                                    onChange={setValueDownload}
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
                                <a
                                    className="flex items-center w-50 justify-center space-x-2 text-white btn bg-red-500 hover:bg-red-300 px-5 py-2 rounded-lg"
                                    href={textURL}
                                    download
                                >
                                    <BsDownload />{" "}
                                    <span>Download Transcript</span>
                                </a>
                            </div>
                        </div>
                        <div className="mt-10 container">
                            <h1 className="font-bold text-3xl text-center">
                                Check your transcript here.
                            </h1>
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
