import React, { useState } from "react";

import { RxReset } from "react-icons/rx";

import { BsDownload } from "react-icons/bs";

import { TextToSpeech } from "tts-react";

function TTS2() {
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
            <div className="h-[100vh] font-[Poppins]">
                <div className="container mt-48">
                    <h1 className="text-center font-bold text-4xl mb-3">
                        Speech to Text in Javascript
                    </h1>
                    <div className="form-group mt-5">
                        <textarea
                            id="textarea"
                            rows="6"
                            className="form-control"
                            value={value}
                            onChange={setValueDownload}
                        ></textarea>
                    </div>

                    <div className="form-group w-[80%] m-auto d-flex justify-content-around text-center mt-3">
                        <button
                            id="resetBtn"
                            className="btn btn-primary w-50 me-4 space-x-2 flex justify-center items-center"
                            onClick={() => setValue("")}
                        >
                            <RxReset /> <span>Reset Transcript</span>
                        </button>
                        <a
                            className="flex items-center w-50 justify-center space-x-2 btn btn-danger px-5 py-2 rounded-lg"
                            href={textURL}
                            download
                        >
                            <BsDownload /> <span>Download Transcript</span>
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
                        markBackgroundColor="#55AD66"
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
            </div>
        </>
    );
}

export default TTS2;
