import React, { useState } from "react";

import { RxReset } from "react-icons/rx";

import { useSpeechSynthesis } from "react-speech-kit";

function TextToSpeech() {
    const [value, setValue] = useState("");

    const [voiceIndex, setVoiceIndex] = useState(null);

    const { speak, voices } = useSpeechSynthesis();

    const voice = voices[voiceIndex] || null;

    // *TRANSCRIPT RESET BUTTON
    const reset = () => {
        setValue("");
        setVoiceIndex(null);
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
                            onChange={(e) => setValue(e.target.value)}
                        ></textarea>
                    </div>

                    <div className="form-group mt-5">
                        <select
                            id="voice-select"
                            className="form-control form-control-lg"
                            value={voiceIndex || ""}
                            onChange={(e) => {
                                setVoiceIndex(e.target.value);
                            }}
                        >
                            <option value="">Default</option>
                            {voices.map((option, index) => (
                                <option key={option.voiceURI} value={index}>
                                    {`${option.lang} - ${option.name}`}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group w-[80%] m-auto d-flex justify-content-around text-center mt-3">
                        <button
                            id="listenBtn"
                            className="btn btn-danger w-50 me-4 space-x-2 flex justify-center items-center"
                            onClick={() =>
                                speak({
                                    text: value,
                                    voice,
                                })
                            }
                        >
                            Listen
                        </button>

                        <button
                            id="resetBtn"
                            className="btn btn-primary w-50 me-4 space-x-2 flex justify-center items-center"
                            onClick={reset}
                        >
                            <RxReset /> <span>Reset Transcript</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default TextToSpeech;
