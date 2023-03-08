import { useState } from "react";

import { BsFillPlayFill, BsFillStopFill } from "react-icons/bs";

const SpeechRecognition =
    window.webkitSpeechRecognition || window.SpeechRecognition;

const recognition = new SpeechRecognition();

function SpeechToText() {
    recognition.continuous = true;

    const [recording, setRecording] = useState(false);

    const [recognizing, setRecognizing] = useState(false);

    const [transcription, setTranscription] = useState("");

    const onChange = (e) => {
        setTranscription((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const reset = () => {
        setRecognizing(false);
    };

    const startFunction = () => {
        setRecording(true);
        recognition.start();
        setRecognizing(true);
        console.log("starting recording");
    };

    const stopFunction = () => {
        setRecording(false);
        recognition.stop();
        reset();
        recognition.onspeechend = console.log("end");
        console.log("stopping recording");
    };

    recognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                setTranscription(`${event.results[i][0].transcript} `);
                console.log(`${event.results[i][0].transcript}`);
            }
        }

        console.log("result");
    };

    return (
        <>
            <div className="h-[100vh]">
                <div className="container mt-48">
                    <h1 className="text-center font-bold">
                        Speech to Text in Javascript
                    </h1>
                    <div className="form-group">
                        <textarea
                            id="textarea"
                            rows="6"
                            className="form-control"
                            value={transcription}
                            onChange={onChange}
                        ></textarea>
                    </div>
                    <div className="form-group w-50 m-auto d-flex justify-content-around text-center mt-3">
                        <button
                            id="recordBtn"
                            className="btn btn-danger w-50 me-4 flex justify-center items-center"
                            onClick={recording ? stopFunction : startFunction}
                        >
                            {recording ? (
                                <>
                                    <BsFillStopFill /> Stop Recording
                                </>
                            ) : (
                                <>
                                    <BsFillPlayFill /> Start Recording
                                </>
                            )}
                        </button>
                        <button
                            id="resetBtn"
                            className="btn btn-primary w-50"
                            onClick={() => setTranscription("")}
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default SpeechToText;
