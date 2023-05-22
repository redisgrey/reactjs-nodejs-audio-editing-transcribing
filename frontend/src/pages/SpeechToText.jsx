import { useState, useRef, useEffect } from "react";

import { useSelector } from "react-redux";

import { BsFillPlayFill, BsFillStopFill, BsDownload } from "react-icons/bs";

import { CgTranscript } from "react-icons/cg";

import { BiUndo, BiRedo } from "react-icons/bi";

import {
    AiOutlineZoomIn,
    AiOutlineZoomOut,
    AiOutlineClear,
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
    transcribeAudio,
    handleReplaceRecordStop,
} from "../js/audioFunctions";

import NotFound from "./NotFound";

const mimeType = "audio/wav";

function SpeechToText() {
    const { user } = useSelector((state) => state.auth);

    //* INTIALIZING THE MEDIARECORDER API
    const mediaRecorder = useRef(null);

    const [isRecording, setIsRecording] = useState(false);

    const recorderRef = useRef(null);

    const [recordedBlob, setRecordedBlob] = useState(null);

    //* STATES FOR THE MEDIARECORDER API
    const [stream, setStream] = useState(null);

    const [audioChunks, setAudioChunks] = useState([]);

    const inputRef = useRef(null);

    //* STATES FOR THE WAVESURFERJS
    const [waveSurfer, setWaveSurfer] = useState(null);

    const [playing, setPlaying] = useState(false);

    // const sliderRef = useRef(null);

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

    const [audioFile, setAudioFile] = useState(null);

    const [transcription, setTranscription] = useState(null);

    const [timestamps, setTimestamps] = useState(null);

    const [transcriptWordOpen, setTranscriptWordOpen] = useState(false);

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
                            // sliderRef,
                            userId,
                            setIsTranscribing,
                            setAudioFile
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
        recordStart(
            recorderRef,
            setIsRecording,
            mimeType,
            setRegions,
            setRecordedBlob,
            setWaveSurfer,
            setPlaying
            // sliderRef
        );
    };

    //*  RECORDING STOP BUTTON
    const stopRecording = () => {
        recordStop(
            recorderRef,
            setRecordedBlob,
            setIsRecording,
            setWaveSurfer,
            setPlaying,
            // sliderRef,
            setRegions,
            setAudioFile
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
            // sliderRef,
            setRegions,
            setIsTranscribing
        );
        setAudioImported(true);
    };

    // * DOWNLOAD TRANSCRIPT FUNCTION
    const downloadTranscript = () => {
        if (transcription === null) {
            alert("Transcript is empty!");
            return;
        }
        const element = document.createElement("a");
        const file = new Blob([transcription], { type: "text/plain" });
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

    // * RESET TRANSCRIPT FUNCTION
    const resetTranscript = () => {
        const transcriptDiv = document.getElementById("transcript");
        transcriptDiv.innerHTML = ""; // Remove all the child elements of transcriptDiv
        setTranscription(null); // Reset the transcription state to null
        setTimestamps([]); // Reset the timestamps state to an empty array
    };

    // * START NEW PROJECT FUNCTION
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

    // * PLAY AUDIO IN THE WAVEFORM FUNCTION
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

    // * PLAY REGION IN THE WAVEFORM FUNCTION
    const handlePlayRegion = (region) => {
        if (currentRegion) {
            waveSurfer.pause();
        }
        waveSurfer.play(region.start, region.end);
        setCurrentRegion(region);
        setPlaying(true);
    };

    // * RESTART THE AUDIO IN THE WAVEFORM FUNCTION
    const handleRestart = () => {
        waveSurfer.seekTo(0);
        waveSurfer.play();
        setCurrentRegion(null);
        setPlaying(true);
    };

    // * UNDO FUNCTION
    const undoAction = () => {
        undo(
            undoActions,
            regions,
            waveSurfer,
            setRegions,
            redoActions,
            setAudioFile
        );
        if (useCut || useReplace) {
            setUseCut(false);
            setUseReplace(false);
        }
    };

    // * REDO FUNCTION
    const redoAction = () => {
        redo(redoActions, regions, waveSurfer, undoActions);
    };

    // * DELETE REGION IN THE WAVEFORM FUNCTION
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

    // * CUT REGION IN THE WAVEFORM FUNCTION
    const cutRegion = (region) => {
        handleCutRegion(
            region,
            waveSurfer,
            regions,
            setUndoActions,
            undoActions,
            setAudioFile
        );
        setUseCut(true);
    };

    // * REPLACE BUTTON CLICK FUNCTION
    const handleReplaceFunction = (region) => {
        setIsReplacing(true);
        setSelectedRegion(region);
    };

    // * REPLACE REGION WITH IMPORTED AUDIO FUNCTION
    const replaceImport = (region) => {
        handleReplaceImportFunction(
            region,
            waveSurfer,
            regions,
            setIsReplacing,
            setRedoActions,
            setUndoActions,
            undoActions,
            setAudioFile
        );
        setUseReplace(true);
    };

    // * REPLACE REGION WITH RECORDED AUDIO FUNCTION
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
                    undoActions,
                    setAudioFile
                );
                setUseReplace(true);
            })
            .catch((error) => {
                console.error("error ", error);
            });
    };

    // * DOWNLOAD BUTTON CLICK FUNCTION
    const handleDownload = (waveSurfer) => {
        console.log("wavesurfer download: ", waveSurfer);
        if (waveSurfer) {
            downloadAudio(waveSurfer);
        } else {
            console.error("WaveSurfer object is undefined.");
        }
    };

    // * DOWNLOAD AUDIO IN THE WAVEFORM FUNCTION
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

                                {recording ||
                                (audioImported && waveSurfer !== null) ? (
                                    <>
                                        {" "}
                                        <div className="flex space-x-4">
                                            <button
                                                className="btn mt-5 bg-[#E09F3e] hover:bg-[#e09f3e83] focus:bg-[#E09F3e] w-50 me-4 space-x-2 flex justify-center items-center"
                                                onClick={handlePlayPause}
                                                disabled={
                                                    isTranscribing
                                                        ? true
                                                        : false
                                                }
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
                                                disabled={
                                                    isTranscribing
                                                        ? true
                                                        : false
                                                }
                                            >
                                                <VscDebugRestart />{" "}
                                                <span>Restart</span>
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
                                                disabled={
                                                    isTranscribing
                                                        ? true
                                                        : false
                                                }
                                            >
                                                <AiOutlineClear />{" "}
                                                <span>Start New Project</span>
                                            </button>
                                        </div>
                                        {/* <div className="flex space-x-3">
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
                                        </div> */}
                                        <div className="mt-2 flex justify-center">
                                            <button
                                                className="btn  bg-[#E09F3e] hover:bg-[#e09f3e83] focus:bg-[#E09F3e] w-50 me-4 space-x-2 flex justify-center items-center"
                                                disabled={
                                                    isTranscribing
                                                        ? true
                                                        : false
                                                }
                                                onClick={() =>
                                                    transcribeAudio(
                                                        audioFile,
                                                        setTranscription,
                                                        setTimestamps,
                                                        waveSurfer,
                                                        currentRegion,
                                                        setCurrentRegion,
                                                        regions,
                                                        setUndoActions,
                                                        undoActions,
                                                        setAudioFile,
                                                        setIsTranscribing,
                                                        setIsReplaceRecording,
                                                        setIsReplacing,
                                                        setRedoActions,
                                                        setNewMediaRecorder,
                                                        setTranscriptWordOpen,
                                                        transcriptWordOpen
                                                    )
                                                }
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
                                                onClick={resetTranscript}
                                                disabled={
                                                    isTranscribing
                                                        ? true
                                                        : false
                                                }
                                            >
                                                <AiOutlineClear />{" "}
                                                <span>Clear Transcript</span>
                                            </button>
                                        </div>
                                        <div
                                            id="transcript"
                                            className="form-group mt-5"
                                        ></div>
                                        <div className="flex space-x-3 mt-3">
                                            <button
                                                className="btn  bg-[#E09F3e] hover:bg-[#e09f3e83] focus:bg-[#E09F3e] w-50 me-4 space-x-2 flex justify-center items-center"
                                                onClick={downloadTranscript}
                                                disabled={
                                                    isTranscribing
                                                        ? true
                                                        : false
                                                }
                                            >
                                                <BsDownload />{" "}
                                                <span>Download Transcript</span>
                                            </button>

                                            <button
                                                className="btn  bg-[#E09F3e] hover:bg-[#e09f3e83] focus:bg-[#E09F3e] w-50 me-4 space-x-2 flex justify-center items-center"
                                                onClick={() =>
                                                    handleDownload(waveSurfer)
                                                }
                                                disabled={
                                                    isTranscribing
                                                        ? true
                                                        : false
                                                }
                                            >
                                                <BsDownload />{" "}
                                                <span>Download Audio</span>
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
                                                                                        handleReplaceRecordStop(
                                                                                            newMediaRecorder
                                                                                        )
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
