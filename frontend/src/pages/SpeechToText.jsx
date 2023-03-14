import { useState, useRef, useEffect } from "react";

import axios from "axios";

import { useDispatch } from "react-redux";

import { BsFillPlayFill, BsFillStopFill, BsDownload } from "react-icons/bs";

import { RxReset } from "react-icons/rx";

import NotFound from "./NotFound";

import SpeechRecognition, {
    useSpeechRecognition,
} from "react-speech-recognition";

// import Modal from "../components/Modal";

import Uploader from "../components/Uploader";

const mimeType = "audio/webm";

function SpeechToText() {
    //* INITIALIZING THE SPEECHRECOGNITION API
    const {
        transcript,
        resetTranscript,
        browserSupportsSpeechRecognition,
        isMicrophoneAvailable,
    } = useSpeechRecognition();

    const [isListening, setIsListening] = useState(false);

    const [isRecording, setIsRecording] = useState(false);

    // const [modalOpen, setModalOpen] = useState(false);

    // const [recordingTitle, setRecordingTitle] = useState("");

    // const [errorMessage, setErrorMessage] = useState("");

    //* INTIALIZING THE MEDIARECORDER API
    const mediaRecorder = useRef(null);

    const [stream, setStream] = useState(null);

    const [audioChunks, setAudioChunks] = useState([]);

    const [audioURL, setAudioURL] = useState(null);

    // * FETCH AUDIO DATA FROM THE DATABASE
    const [audioList, setAudioList] = useState([]);

    const [audioListURL, setAudioListURL] = useState(null);

    const dispatch = useDispatch();

    // useEffect(() => {
    //     if (isError) {
    //         toast.error(message);
    //     }

    //     axios
    //         .get("http://localhost:5000/api/audio")
    //         .then(({ data }) => {
    //             setAudioListURL(data);
    //             // setFile(null);
    //             // setInputContainsFile(false);
    //             // setCurrentlyUploading(false);
    //             // toast.success("Successfully uploaded your audio file");
    //         })
    //         .catch((err) => {
    //             if (err.response.status === 400) {
    //                 const errMsg = err.response.data;
    //                 if (errMsg) {
    //                     console.log(errMsg);
    //                     alert(errMsg);
    //                 } else {
    //                     console.log("other error", err);
    //                     // setInputContainsFile(false);
    //                     // setCurrentlyUploading(false);
    //                 }
    //             }
    //         });
    // }, []);

    const audioListExample = [
        "sfsfsdsdgsdgsdgdgsa",
        "awrewwfsfjiasjfakjsf",
        "sdfskjfnsdnawfn",
    ];

    if (!browserSupportsSpeechRecognition) {
        return (
            <NotFound
                title={"Not Supported"}
                body={"Browser doesn't support speech recognition."}
                status="405"
            />
        );
    }

    if (!isMicrophoneAvailable) {
        return (
            <NotFound
                title={"Microphone Access Denied"}
                body={"Please allow access to the microphone to continue."}
                status="403"
            />
        );
    }

    //* MICROPHONE ACCESS
    let constraints = {
        audio: true,
        video: false,
    };

    async function getMedia(constraints) {
        try {
            let streamData = await navigator.mediaDevices.getUserMedia(
                constraints
            );
            setStream(streamData);
        } catch (err) {
            console.log(err);
        }
    }

    getMedia(constraints);

    //* TRANSCRIBING START BUTTON
    const start = () => {
        setIsListening(true);
        SpeechRecognition.startListening({
            continuous: true,
        });
    };

    //* RECORDING START BUTTON
    const recordStart = () => {
        setIsRecording(true);

        const media = new MediaRecorder(stream, { type: mimeType });

        mediaRecorder.current = media;

        mediaRecorder.current.start();

        let localAudioChunks = [];

        mediaRecorder.current.ondataavailable = (event) => {
            if (typeof event.data === "undefined") return;

            if (event.data.size === 0) return;

            localAudioChunks.push(event.data);
        };

        setAudioChunks(localAudioChunks);

        console.log("recording start");
    };

    //* TRANSCRIBING STOP BUTTON
    const stop = () => {
        setIsListening(false);
        SpeechRecognition.stopListening();
    };

    //*  RECORDING STOP BUTTON
    const recordStop = () => {
        setIsRecording(false);

        mediaRecorder.current.stop();

        mediaRecorder.current.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: mimeType });

            const audioUrl = URL.createObjectURL(audioBlob);

            setAudioURL(audioUrl);

            setAudioChunks([]);
        };

        console.log("recording stop");
        //setModalOpen(true);
    };

    // *TRANSCRIPT RESET BUTTON
    const reset = () => {
        resetTranscript();
    };

    return (
        <>
            <div className="h-[100vh] font-[Poppins]">
                <div className="container mt-48">
                    <h1 className="text-center font-bold text-4xl mb-3">
                        Speech to Text in Javascript
                    </h1>

                    <div className="form-group w-[80%] m-auto d-flex justify-content-around text-center mt-3">
                        <button
                            id="recordBtn"
                            className="btn btn-danger w-50 me-4 space-x-2 flex justify-center items-center"
                            onClick={isRecording ? recordStop : recordStart}
                        >
                            {isRecording ? (
                                <>
                                    <BsFillStopFill />{" "}
                                    <span>Stop Recording</span>
                                </>
                            ) : (
                                <>
                                    <BsFillPlayFill />{" "}
                                    <span>Start Recording</span>
                                </>
                            )}
                        </button>

                        <Uploader />

                        <button
                            id="transcribeBtn"
                            className="btn btn-success w-50 me-4 space-x-2 flex justify-center items-center"
                            onClick={isListening ? stop : start}
                        >
                            {isListening ? (
                                <>
                                    <BsFillStopFill />{" "}
                                    <span>Stop Transcribing</span>
                                </>
                            ) : (
                                <>
                                    <BsFillPlayFill />{" "}
                                    <span>Start Transcribing</span>
                                </>
                            )}
                        </button>
                        <button
                            id="resetBtn"
                            className="btn btn-primary w-50 me-4 space-x-2 flex justify-center items-center"
                            onClick={reset}
                        >
                            <RxReset /> <span>Reset Transcript</span>
                        </button>
                    </div>
                    {/** AUDIO RECORDED PREVIEW */}
                    <div className="container space-y-5 mt-5">
                        <h1 className="text-2xl font-bold">
                            Recorded Audio Preview
                        </h1>

                        <div className="flex items-center justify-between">
                            <audio
                                src={audioURL}
                                controls
                                className="w-[80%]"
                            ></audio>
                            <a
                                className="flex items-center space-x-2 btn btn-danger px-5 py-2 rounded-lg"
                                href={audioURL}
                                download
                            >
                                <BsDownload /> <span>Download</span>
                            </a>
                        </div>
                    </div>

                    <div className="form-group mt-5">
                        <textarea
                            id="textarea"
                            rows="6"
                            className="form-control"
                            value={transcript}
                            readOnly
                        ></textarea>
                    </div>

                    <div className="container space-y-5 mt-5">
                        <h1 className="text-2xl font-bold">Audio List</h1>

                        <div>
                            {audioListExample.map((audio) => (
                                <audio src={audio} controls></audio>
                            ))}
                        </div>
                        {/* <div className="flex items-center justify-between">
                            <audio
                                src={audioURL}
                                controls
                                className="w-[80%]"
                            ></audio>
                            <a
                                className="flex items-center space-x-2 btn btn-danger px-5 py-2 rounded-lg"
                                href={audioURL}
                                download
                            >
                                <BsDownload /> <span>Download</span>
                            </a>
                        </div> */}
                    </div>
                </div>
            </div>

            {/* <Modal
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
            /> */}
        </>
    );
}

export default SpeechToText;
