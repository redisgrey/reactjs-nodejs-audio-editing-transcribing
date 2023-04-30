import { useState, useRef, useEffect } from "react";

import { useSelector } from "react-redux";

import SpeechRecognition, {
    useSpeechRecognition,
} from "react-speech-recognition";

import { BsFillPlayFill, BsFillStopFill, BsDownload } from "react-icons/bs";

import { CgTranscript } from "react-icons/cg";

import { BiUndo, BiRedo } from "react-icons/bi";

import {
    AiOutlineZoomIn,
    AiOutlineZoomOut,
    AiOutlineClear,
    AiOutlineStop,
} from "react-icons/ai";

import { VscDebugRestart } from "react-icons/vsc";

import {
    recordStart,
    recordStop,
    handleLabelClick,
    handleFileChange,
    undo,
    redo,
    handleDeleteRegion,
    handleCutRegion,
    handleReplaceImportFunction,
    handleReplaceRecordFunction,
    removeWaveform,
    bufferToWave,
    loadAudioFromIndexedDB,
} from "../js/audioFunctions";

import NotFound from "./NotFound";

const mimeType = "audio/mpeg";

function SpeechToText() {
    const { user } = useSelector((state) => state.auth);

    //* INTIALIZING THE MEDIARECORDER API
    const mediaRecorder = useRef(null);

    const [isRecording, setIsRecording] = useState(false);

    //* STATES FOR THE MEDIARECORDER API
    const [stream, setStream] = useState(null);

    const [audioChunks, setAudioChunks] = useState([]);

    const inputRef = useRef(null);

    //* STATES FOR THE WAVESURFERJS
    const [waveSurfer, setWaveSurfer] = useState(null);

    const [playing, setPlaying] = useState(false);

    const sliderRef = useRef(null);

    const [regions, setRegions] = useState([]);

    const [currentRegion, setCurrentRegion] = useState(null);

    //* STATES FOR THE REPLACING AUDIO PARTS FUNCTION
    const [isReplacing, setIsReplacing] = useState(false);

    const [selectedRegion, setSelectedRegion] = useState(null);

    const [isReplaceRecording, setIsReplaceRecording] = useState(false);

    const [newMediaRecorder, setNewMediaRecorder] = useState(null);

    //* STATES FOR THE UNDO AND REDO FUNCTION
    const [undoActions, setUndoActions] = useState([]);

    const [redoActions, setRedoActions] = useState([]);

    const [useReplace, setUseReplace] = useState(false);

    const [useCut, setUseCut] = useState(false);

    //* STATES FOR THE TRANSCRIPTION FUNCTION
    const [isTranscribing, setIsTranscribing] = useState(false);

    //* STATES FOR THE BUTTON DISABLING WHEN NOT IN USE
    const [recording, setRecording] = useState(false);

    const [audioImported, setAudioImported] = useState(false);

    useEffect(() => {
        const userId = JSON.parse(localStorage.getItem("user")).id;
        // Check if there is an audio file saved in IndexedDB
        const request = indexedDB.open(`myDatabase-${userId}`); // include the user

        request.onsuccess = (event) => {
            const db = event.target.result;

            if (db.objectStoreNames.contains("audio")) {
                const transaction = db.transaction(["audio"], "readonly");
                const objectStore = transaction.objectStore("audio");
                const request = objectStore.get("audio-to-edit");

                request.onsuccess = (event) => {
                    const audioFile = event.target.result;

                    if (audioFile) {
                        // Load the audio file into WaveSurfer
                        loadAudioFromIndexedDB(
                            setWaveSurfer,
                            setPlaying,
                            setRegions,
                            sliderRef,
                            userId
                        );
                        setRecording(true);
                        setAudioImported(true);
                    }
                };
            } else {
                // Move on with other functionalities in your website
            }
        };

        request.onerror = (event) => {
            console.log(
                "An error occurred while opening the database:",
                event.target.error
            );
            // Move on with other functionalities in your website
        };
    }, []);
    //* RECORDING START BUTTON
    const startRecording = () => {
        navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then((stream) => {
                recordStart(
                    stream,
                    setIsRecording,
                    mediaRecorder,
                    setAudioChunks,
                    mimeType
                );
            })
            .catch((error) => {
                console.error("error ", error);
            });
    };

    //*  RECORDING STOP BUTTON
    const stopRecording = () => {
        recordStop(
            mediaRecorder,
            setIsRecording,
            audioChunks,
            mimeType,
            setWaveSurfer,
            setPlaying,
            sliderRef,
            setRegions
        );
        setRecording(true);
    };

    // * IMPORT AUDIO FUNCTION
    const fileLabelClick = () => {
        handleLabelClick(inputRef);
    };

    const fileChangeHandler = (event) => {
        handleFileChange(
            event,
            setAudioChunks,
            setWaveSurfer,
            setPlaying,
            sliderRef,
            setRegions
        );
        setAudioImported(true);
    };

    const { resetTranscript, transcript } = useSpeechRecognition();

    const handleTranscription = () => {
        SpeechRecognition.startListening({
            continuous: true,
            language: "en-US",
            interimResults: true,
        });
        setIsTranscribing(true);
    };

    const handleStopTranscription = () => {
        SpeechRecognition.stopListening();
        setIsTranscribing(false);
    };

    const downloadTranscript = () => {
        if (transcript.trim() === "") {
            alert("Transcript is empty!");
            return;
        }
        const element = document.createElement("a");
        const file = new Blob([transcript], { type: "text/plain" });
        const now = new Date();
        const dateString = now.toLocaleDateString();
        const timeString = now
            .toLocaleTimeString([], { hour12: false })
            .replace(/:/g, "-");
        const filename = `transcript_${dateString}_${timeString}.txt`;
        element.href = URL.createObjectURL(file);
        element.download = filename;
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
    };

    const resetWaveform = (waveSurfer, setWaveSurfer, setRegions) => {
        removeWaveform(waveSurfer, setWaveSurfer, setRegions);
        resetTranscript();
        setRecording(false);
        setAudioImported(false);

        const userId = JSON.parse(localStorage.getItem("user")).id;
        // Check if there is an audio file saved in IndexedDB
        const request = indexedDB.open(`myDatabase-${userId}`); // include the user

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(["audio"], "readwrite");
            const objectStore = transaction.objectStore("audio");
            const request = objectStore.delete("audio-to-edit");
            request.onsuccess = () => {
                console.log("Audio removed from IndexedDB");
            };
            request.onerror = () => {
                console.error("Error removing audio from IndexedDB");
            };
        };
    };

    const handlePlayPause = () => {
        if (waveSurfer) {
            if (playing) {
                waveSurfer.pause();
            } else {
                waveSurfer.play();
            }
            setPlaying(!playing);
        }
    };

    const handlePlayRegion = (region) => {
        if (currentRegion) {
            waveSurfer.pause();
        }
        waveSurfer.play(region.start, region.end);
        setCurrentRegion(region);
        setPlaying(true);
    };

    const handleRestart = () => {
        waveSurfer.seekTo(0);
        waveSurfer.play();
        setCurrentRegion(null);
        setPlaying(true);
    };

    const undoAction = () => {
        undo(undoActions, regions, waveSurfer, setRegions, redoActions);
        if (useCut || useReplace) {
            setUseCut(false);
            setUseReplace(false);
        }
    };

    const redoAction = () => {
        redo(redoActions, regions, waveSurfer, undoActions);
    };

    const deleteRegion = (region) => {
        handleDeleteRegion(
            region,
            currentRegion,
            waveSurfer,
            setCurrentRegion,
            setUndoActions,
            undoActions
        );
    };

    const cutRegion = (region) => {
        handleCutRegion(
            region,
            waveSurfer,
            regions,
            setUndoActions,
            undoActions
        );
        setUseCut(true);
    };

    const handleReplaceFunction = (region) => {
        setIsReplacing(true);
        setSelectedRegion(region);
    };

    const replaceImport = (region) => {
        handleReplaceImportFunction(
            region,
            waveSurfer,
            regions,
            setIsReplacing,
            setRedoActions,
            setUndoActions,
            undoActions
        );
        setUseReplace(true);
    };

    const replaceRecord = (region) => {
        navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then((stream) => {
                handleReplaceRecordFunction(
                    region,
                    stream,
                    waveSurfer,
                    setIsReplaceRecording,
                    regions,
                    setIsReplacing,
                    setRedoActions,
                    setNewMediaRecorder,
                    setUndoActions,
                    undoActions
                );
                setUseReplace(true);
            })
            .catch((error) => {
                console.error("error ", error);
            });
    };

    const handleReplaceRecordStop = () => {
        newMediaRecorder.stop();
    };

    const handleDownload = (waveSurfer) => {
        console.log("wavesurfer download: ", waveSurfer);
        if (waveSurfer) {
            downloadAudio(waveSurfer);
        } else {
            console.error("WaveSurfer object is undefined.");
        }
    };

    const downloadAudio = (waveSurfer) => {
        // Get the modified audio buffer
        const modifiedBuffer = waveSurfer.backend.buffer;

        // Create a new blob with the audio data
        const audioBlob = bufferToWave(modifiedBuffer);

        // Create a temporary download link and trigger a click event to download the file
        const audioBlobUrl = URL.createObjectURL(audioBlob);
        const link = document.createElement("a");

        // Add timestamp to the file name
        const timestamp = new Date().toISOString();
        const filename = `modified_audio_${timestamp}.wav`;

        link.href = audioBlobUrl;
        link.download = filename;
        link.click();

        // Clean up
        URL.revokeObjectURL(audioBlobUrl);
    };

    return (
        <>
            {user ? (
                <>
                    {" "}
                    <div className="font-[Poppins] ">
                        <div className="container  p-10">
                            <div className=" p-3 px-4 rounded-lg bg-gray-300">
                                <div className="form-group w-[100%] m-auto flex justify-between text-center mt-3">
                                    <button
                                        id="recordBtn"
                                        className="btn bg-[#E09F3e] hover:bg-[#e09f3e83] focus:bg-[#E09F3e] w-50 me-4 space-x-2 flex justify-center items-center"
                                        onClick={
                                            isRecording
                                                ? stopRecording
                                                : startRecording
                                        }
                                        disabled={waveSurfer ? true : false}
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

                                    <input
                                        type="file"
                                        className="hidden"
                                        ref={inputRef}
                                        onChange={fileChangeHandler}
                                        accept="audio/*"
                                        disabled={waveSurfer ? true : false}
                                    />
                                    <label
                                        htmlFor="file"
                                        className="btn btn-secondary w-[50%] me-4 flex space-x-2 text-white justify-center items-center"
                                        onClick={fileLabelClick}
                                    >
                                        <BsDownload /> <span>Import Audio</span>
                                    </label>
                                </div>
                                <div className="mt-3" id="waveform"></div>
                                <div id="timeline"></div>

                                {recording || audioImported ? (
                                    <>
                                        {" "}
                                        <div className="flex space-x-4">
                                            <button
                                                className="btn mt-5 bg-[#E09F3e] hover:bg-[#e09f3e83] focus:bg-[#E09F3e] w-50 me-4 space-x-2 flex justify-center items-center"
                                                onClick={handlePlayPause}
                                            >
                                                {playing ? (
                                                    <>
                                                        <BsFillStopFill />{" "}
                                                        <span>Pause</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <BsFillPlayFill />{" "}
                                                        <span>Play</span>
                                                    </>
                                                )}
                                            </button>{" "}
                                            <button
                                                className="btn mt-5 bg-[#E09F3e] hover:bg-[#e09f3e83] focus:bg-[#E09F3e] w-50 me-4 space-x-2 flex justify-center items-center"
                                                onClick={handleRestart}
                                            >
                                                <VscDebugRestart />{" "}
                                                <span>Restart</span>
                                            </button>
                                            <button
                                                className="btn mt-5 btn-secondary w-50 me-4 space-x-2 flex justify-center items-center"
                                                onClick={() =>
                                                    handleDownload(waveSurfer)
                                                }
                                            >
                                                <BsDownload />{" "}
                                                <span>Download Audio</span>
                                            </button>
                                            <button
                                                className="btn mt-5 bg-red-500 focus:bg-red-500 text-white hover:bg-red-300 w-50 me-4 space-x-2 flex justify-center items-center"
                                                onClick={() =>
                                                    resetWaveform(
                                                        waveSurfer,
                                                        setWaveSurfer,
                                                        setRegions
                                                    )
                                                }
                                            >
                                                <AiOutlineClear />{" "}
                                                <span>Reset</span>
                                            </button>
                                        </div>
                                        <div className="flex space-x-3">
                                            <div className="flex space-x-2 mt-2">
                                                <AiOutlineZoomOut />

                                                <input
                                                    type="range"
                                                    id="slider"
                                                    ref={sliderRef}
                                                    min="0.5"
                                                    max="100"
                                                    step="0.01"
                                                    defaultValue="1"
                                                />

                                                <AiOutlineZoomIn />
                                            </div>
                                        </div>
                                        <div className="mt-2 flex justify-center">
                                            <button
                                                className="btn  bg-[#E09F3e] hover:bg-[#e09f3e83] focus:bg-[#E09F3e] w-50 me-4 space-x-2 flex justify-center items-center"
                                                disabled={
                                                    isTranscribing
                                                        ? true
                                                        : false
                                                }
                                                onClick={handleTranscription}
                                            >
                                                {isTranscribing ? (
                                                    "Transcribing Audio..."
                                                ) : (
                                                    <>
                                                        <CgTranscript />{" "}
                                                        <span>
                                                            Transcribe Audio
                                                        </span>
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                className="btn  bg-red-500 focus:bg-red-500 text-white hover:bg-red-300 w-50 me-4 space-x-2 flex justify-center items-center"
                                                onClick={
                                                    handleStopTranscription
                                                }
                                            >
                                                <AiOutlineStop />{" "}
                                                <span>Stop Transcribing</span>
                                            </button>
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
                                        <div className="flex space-x-3 mt-3">
                                            <button
                                                className="btn  btn-secondary w-50 me-4 space-x-2 flex justify-center items-center"
                                                onClick={downloadTranscript}
                                            >
                                                <BsDownload />{" "}
                                                <span>Download Transcript</span>
                                            </button>

                                            <button
                                                className="btn  bg-red-500 focus:bg-red-500 text-white hover:bg-red-300 w-50 me-4 space-x-2 flex justify-center items-center"
                                                onClick={resetTranscript}
                                            >
                                                <AiOutlineClear />{" "}
                                                <span>Reset Transcript</span>
                                            </button>
                                        </div>
                                        <div>
                                            <div className="flex space-x-5 mt-4 mb-4 items-center">
                                                <h1 className="text-2xl font-bold">
                                                    Regions List
                                                </h1>
                                                <button
                                                    className="btn flex items-center space-x-1 bg-red-500 focus:bg-red-500 hover:bg-red-300 text-white"
                                                    onClick={undoAction}
                                                    disabled={
                                                        undoActions.length === 0
                                                    }
                                                >
                                                    <BiUndo /> <span>UNDO</span>
                                                </button>
                                                <button
                                                    className="btn flex items-center space-x-1 bg-red-500 focus:bg-red-500 hover:bg-red-300 text-white"
                                                    onClick={redoAction}
                                                    disabled={
                                                        useCut ||
                                                        useReplace ||
                                                        redoActions.length === 0
                                                    }
                                                >
                                                    <BiRedo /> <span>REDO</span>
                                                </button>
                                            </div>

                                            {/* Render the list of regions */}
                                            <ul className="space-y-4">
                                                {regions.map(
                                                    (region, index) => (
                                                        <li
                                                            key={region.id}
                                                            className="flex items-center"
                                                        >
                                                            <div
                                                                style={{
                                                                    backgroundColor:
                                                                        region.color,
                                                                    width: "60px",
                                                                    height: "30px",
                                                                    display:
                                                                        "inline-block",
                                                                    marginRight:
                                                                        "5px",
                                                                }}
                                                            ></div>
                                                            <span>
                                                                {region.label}
                                                            </span>
                                                            <span className="space-x-2">
                                                                <button
                                                                    className="btn bg-[#E09F3e] focus:bg-[#E09F3e] hover:bg-[#E09F3e]"
                                                                    onClick={() =>
                                                                        handlePlayRegion(
                                                                            region
                                                                        )
                                                                    }
                                                                >
                                                                    Play
                                                                </button>
                                                                <button
                                                                    className="btn btn-secondary"
                                                                    onClick={() =>
                                                                        deleteRegion(
                                                                            region
                                                                        )
                                                                    }
                                                                >
                                                                    Delete
                                                                </button>
                                                                <button
                                                                    className="btn btn-secondary"
                                                                    onClick={() =>
                                                                        cutRegion(
                                                                            region
                                                                        )
                                                                    }
                                                                >
                                                                    Cut
                                                                </button>
                                                                <button
                                                                    className="btn bg-[#E09F3e] focus:bg-[#e09f3e86] hover:bg-[#E09F3e]"
                                                                    onClick={() =>
                                                                        handleReplaceFunction(
                                                                            region
                                                                        )
                                                                    }
                                                                >
                                                                    Replace
                                                                </button>
                                                                {isReplacing &&
                                                                    selectedRegion ===
                                                                        region && (
                                                                        <>
                                                                            <button
                                                                                className="btn bg-[#E09F3e] focus:bg-[#E09F3e] hover:bg-[#E09F3e]"
                                                                                onClick={() =>
                                                                                    replaceRecord(
                                                                                        region,
                                                                                        stream
                                                                                    )
                                                                                }
                                                                            >
                                                                                Record
                                                                            </button>
                                                                            {isReplaceRecording ? (
                                                                                <button
                                                                                    className="btn bg-red-500 focus:bg-red-500 hover:bg-red-300"
                                                                                    onClick={() =>
                                                                                        handleReplaceRecordStop()
                                                                                    }
                                                                                >
                                                                                    Stop
                                                                                    Recording
                                                                                </button>
                                                                            ) : (
                                                                                <button
                                                                                    className="btn bg-red-500 focus:bg-red-500 hover:bg-red-300 text-white"
                                                                                    onClick={() =>
                                                                                        replaceImport(
                                                                                            region
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    Import
                                                                                </button>
                                                                            )}{" "}
                                                                            <button
                                                                                className="btn btn-secondary"
                                                                                onClick={() =>
                                                                                    setIsReplacing(
                                                                                        false
                                                                                    )
                                                                                }
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                        </>
                                                                    )}
                                                            </span>
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        </div>{" "}
                                    </>
                                ) : (
                                    <div className="text-center">
                                        Start Recording or Upload an audio to
                                        start editing.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>{" "}
                </>
            ) : (
                <>
                    <NotFound
                        title={"Not Authorized"}
                        body={"Please sign in to access Script features."}
                        status="401"
                    />
                </>
            )}
        </>
    );
}

export default SpeechToText;
