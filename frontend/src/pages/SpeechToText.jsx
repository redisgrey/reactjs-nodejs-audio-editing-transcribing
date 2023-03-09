import { useState } from "react";

import { BsFillPlayFill, BsFillStopFill } from "react-icons/bs";

import NotFound from "./NotFound";

import SpeechRecognition, {
    useSpeechRecognition,
} from "react-speech-recognition";

function SpeechToText() {
    const { transcript, resetTranscript, browserSupportsSpeechRecognition } =
        useSpeechRecognition();

    const [isListening, setIsListening] = useState(false);

    if (!browserSupportsSpeechRecognition) {
        return (
            <NotFound
                title={"Not Supported"}
                body={"Browser doesn't support speech recognition."}
                status="405"
            />
        );
    }

    const start = () => {
        setIsListening(true);
        SpeechRecognition.startListening({
            continuous: true,
        });
    };
    const stop = () => {
        setIsListening(false);
        SpeechRecognition.stopListening();
    };
    const reset = () => {
        resetTranscript();
    };

    return (
        <>
            <div className="h-[100vh]">
                <div className="container mt-48">
                    <h1 className="text-center font-bold text-4xl mb-3">
                        Speech to Text in Javascript
                    </h1>
                    <div className="form-group">
                        <textarea
                            id="textarea"
                            rows="6"
                            className="form-control"
                            value={transcript}
                        ></textarea>
                    </div>
                    <div className="form-group w-50 m-auto d-flex justify-content-around text-center mt-3">
                        <button
                            id="recordBtn"
                            className="btn btn-danger w-50 me-4 flex justify-center items-center"
                            onClick={isListening ? stop : start}
                        >
                            {isListening ? (
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
                            onClick={reset}
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
