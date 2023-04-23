import { useState, useRef } from "react";

import { useSelector } from "react-redux";

import SpeechRecognition, {
    useSpeechRecognition,
} from "react-speech-recognition";

import { BsFillPlayFill, BsFillStopFill, BsDownload } from "react-icons/bs";

import { AiOutlineZoomIn, AiOutlineZoomOut } from "react-icons/ai";

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
} from "../js/audioFunctions";

import NotFound from "./NotFound";

const mimeType = "audio/mpeg";

function AudioEditor() {
    const { user } = useSelector((state) => state.auth);

    //* INTIALIZING THE MEDIARECORDER API
    const mediaRecorder = useRef(null);

    const [isRecording, setIsRecording] = useState(false);

    //* STATES FOR THE MEDIARECORDER API
    const [stream, setStream] = useState(null);

    const [audioChunks, setAudioChunks] = useState([]);

    const inputRef = useRef(null);

    const [importedAudioList, setImportedAudioList] = useState([]);

    const [waveSurfer, setWaveSurfer] = useState(null);

    const [playing, setPlaying] = useState(false);

    const sliderRef = useRef(null);

    const [regions, setRegions] = useState([]);

    const [currentRegion, setCurrentRegion] = useState(null);

    const [isReplacing, setIsReplacing] = useState(false);

    const [selectedRegion, setSelectedRegion] = useState(null);

    const [isReplaceRecording, setIsReplaceRecording] = useState(false);

    const [newMediaRecorder, setNewMediaRecorder] = useState(null);

    const [undoActions, setUndoActions] = useState([]);

    const [redoActions, setRedoActions] = useState([]);

    //* INITIALIZING THE SPEECHRECOGNITION API
    const { transcript, resetTranscript } = useSpeechRecognition();

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
                SpeechRecognition.startListening({
                    continuous: true,
                });
            })
            .catch((error) => {
                console.error("Failed to get access to microphone: ", error);
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
        SpeechRecognition.stopListening();
    };

    const refreshTranscript = () => {
        resetTranscript();
        SpeechRecognition.stopListening();
        SpeechRecognition.startListening({
            continuous: true,
        });
    };

    // * IMPORT AUDIO FUNCTION
    const fileLabelClick = () => {
        handleLabelClick(inputRef);
    };

    const fileChangeHandler = (event) => {
        handleFileChange(
            event,
            setAudioChunks,
            setImportedAudioList,
            importedAudioList,
            setWaveSurfer,
            setPlaying,
            sliderRef,
            setRegions
        );
    };

    const resetWaveform = (waveSurfer, setWaveSurfer, setRegions) => {
        removeWaveform(waveSurfer, setWaveSurfer, setRegions);
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
    };

    const handleRestart = () => {
        waveSurfer.seekTo(0);
        waveSurfer.play();
        setCurrentRegion(null);
        setPlaying(true);
    };

    const undoAction = () => {
        undo(undoActions, regions, waveSurfer, setRegions, redoActions);
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
            })
            .catch((error) => {
                console.error("Failed to get access to microphone: ", error);
            });
    };

    const handleReplaceRecordStop = () => {
        newMediaRecorder.stop();
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
                                        className="btn bg-[#E09F3e] hover:bg-[#e09f3e83] w-50 me-4 space-x-2 flex justify-center items-center"
                                        onClick={
                                            isRecording
                                                ? stopRecording
                                                : startRecording
                                        }
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

                                <div className="flex space-x-4">
                                    <button
                                        className="btn mt-5 bg-[#E09F3e] hover:bg-[#e09f3e83] w-50 me-4 space-x-2 flex justify-center items-center"
                                        onClick={handlePlayPause}
                                    >
                                        {playing ? "Pause" : "Play"}
                                    </button>{" "}
                                    <button
                                        className="btn mt-5 bg-[#E09F3e] hover:bg-[#e09f3e83] w-50 me-4 space-x-2 flex justify-center items-center"
                                        onClick={handleRestart}
                                    >
                                        Restart
                                    </button>
                                    <button
                                        className="btn mt-5 bg-red-500 text-white hover:bg-red-300 w-50 me-4 space-x-2 flex justify-center items-center"
                                        onClick={() =>
                                            resetWaveform(
                                                waveSurfer,
                                                setWaveSurfer,
                                                setRegions
                                            )
                                        }
                                    >
                                        Remove Waveform
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

                                <div className="form-group mt-5">
                                    <textarea
                                        id="textarea"
                                        rows="6"
                                        className="form-control"
                                        value={transcript}
                                        readOnly
                                    ></textarea>
                                </div>

                                <button onClick={refreshTranscript}>
                                    Refresh Transcript
                                </button>

                                <div>
                                    <div className="flex space-x-5 mt-4 mb-4 items-center">
                                        <h1 className="text-2xl font-bold">
                                            Regions List
                                        </h1>
                                        <button
                                            className="btn bg-red-500 focus:bg-red-500 hover:bg-red-300 text-white"
                                            onClick={undoAction}
                                        >
                                            UNDO
                                        </button>
                                        <button
                                            className="btn bg-red-500 focus:bg-red-500 hover:bg-red-300 text-white"
                                            onClick={redoAction}
                                        >
                                            REDO
                                        </button>
                                    </div>

                                    {/* Render the list of regions */}
                                    <ul className="space-y-4">
                                        {regions.map((region, index) => (
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
                                                        display: "inline-block",
                                                        marginRight: "5px",
                                                    }}
                                                ></div>
                                                <span>{region.label}</span>
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
                                                            deleteRegion(region)
                                                        }
                                                    >
                                                        Delete
                                                    </button>
                                                    <button
                                                        className="btn btn-secondary"
                                                        onClick={() =>
                                                            cutRegion(region)
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
                                        ))}
                                    </ul>
                                </div>
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

export default AudioEditor;
