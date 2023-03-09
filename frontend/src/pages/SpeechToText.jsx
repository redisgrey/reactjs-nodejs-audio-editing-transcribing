import { useState } from "react";

import {
    BsFillPlayFill,
    BsFillStopFill,
    BsFillTrashFill,
} from "react-icons/bs";

import NotFound from "./NotFound";

import SpeechRecognition, {
    useSpeechRecognition,
} from "react-speech-recognition";

import { useReactMediaRecorder } from "react-media-recorder";

import Modal from "../components/Modal";

function SpeechToText() {
    const { transcript, resetTranscript, browserSupportsSpeechRecognition } =
        useSpeechRecognition();

    const { startRecording, stopRecording, mediaBlobUrl, clearBlobUrl } =
        useReactMediaRecorder({ audio: true });

    const [isListening, setIsListening] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);

    const [recordingTitle, setRecordingTitle] = useState("");

    const [errorMessage, setErrorMessage] = useState("");

    const audioList = [];

    if (!browserSupportsSpeechRecognition) {
        return (
            <NotFound
                title={"Not Supported"}
                body={"Browser doesn't support speech recognition."}
                status="405"
            />
        );
    }

    if (mediaBlobUrl) {
        audioList.push(mediaBlobUrl);
    }

    const start = () => {
        setIsListening(true);
        SpeechRecognition.startListening({
            continuous: true,
        });
        startRecording();
    };
    const stop = () => {
        setIsListening(false);
        SpeechRecognition.stopListening();
        stopRecording();
        setModalOpen(true);
    };
    const reset = () => {
        resetTranscript();
    };

    const deleteAudio = () => {
        clearBlobUrl();
    };

    return (
        <>
            <div className="h-[100vh] font-[Poppins]">
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
                    <div className="container space-y-5 mt-5">
                        <h1 className="text-2xl font-bold">Audio Lists</h1>
                        {audioList.length === 0 ? null : (
                            <div className="flex items-center justify-between">
                                <span>{recordingTitle}</span>
                                <audio
                                    src={audioList[0]}
                                    autoplay
                                    loop
                                    controls
                                    className="w-[80%]"
                                ></audio>
                                <button
                                    className="flex items-center space-x-2 btn btn-danger px-5 py-2 rounded-lg"
                                    onClick={deleteAudio}
                                >
                                    <BsFillTrashFill /> <span>Delete</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Modal
                open={modalOpen}
                setOpen={setModalOpen}
                title={"Recording Title:"}
                body={
                    <>
                        <div className="mt-2">
                            <input
                                type="text"
                                id="recordingTitle"
                                value={recordingTitle}
                                onChange={(e) =>
                                    setRecordingTitle(e.target.value)
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                    </>
                }
                footer={
                    <>
                        <button
                            type="button"
                            className="bg-red-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
                            onClick={() => setModalOpen(false)}
                        >
                            Set Recording Title
                        </button>
                    </>
                }
                errorMessage={errorMessage}
            />
        </>
    );
}

export default SpeechToText;
