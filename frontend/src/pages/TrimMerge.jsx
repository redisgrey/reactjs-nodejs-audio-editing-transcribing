import { useState, useRef, useEffect } from "react";

import { useSelector } from "react-redux";

import { BsFillPlayFill, BsFillStopFill, BsDownload } from "react-icons/bs";

import { RxReset } from "react-icons/rx";

import {
    recordStart,
    recordStop,
    handleTrimButtonClick,
    loadAudioBuffer,
    handlePlay,
    handleSave,
    handleDelete,
    handleUndo,
    handleRedo,
    fetchAudio,
    mergeAudio,
    handleCheckboxChange,
    handleMerge,
    addCheckedPropertyToAudioList,
    handleDownload,
    bufferToWave,
    handleLabelClick,
    handleFileChange,
} from "../js/audioFunctions";

import NotFound from "./NotFound";

const mimeType = "audio/mpeg";

function TrimMerge() {
    const { user } = useSelector((state) => state.auth);

    //* INTIALIZING THE MEDIARECORDER API
    const mediaRecorder = useRef(null);

    const [isRecording, setIsRecording] = useState(false);

    //* STATES FOR THE MEDIARECORDER API
    const [stream, setStream] = useState(null);

    const [audioChunks, setAudioChunks] = useState([]);

    const [audioURL, setAudioURL] = useState(null);

    // * STATES FOR THE TRIM FUNCTION
    const [originalAudioDuration, setOriginalAudioDuration] = useState(0);

    const [startTrim, setStartTrim] = useState(0);

    const [endTrim, setEndTrim] = useState(0);

    const [audioBufferSource, setAudioBufferSource] = useState(null);

    const [isPlaying, setIsPlaying] = useState(false);

    const [trimmedAudioList, setTrimmedAudioList] = useState([]);

    // * STATES FOR THE UNDO/REDO FUNCTION
    const [undoStack, setUndoStack] = useState([]);

    const [redoStack, setRedoStack] = useState([]);

    // * STATES FOR THE MERGE FUNCTION
    const [selectedAudios, setSelectedAudios] = useState([]);

    const [mergedAudioUrl, setMergedAudioUrl] = useState(null);

    const inputRef = useRef(null);

    const [importedAudioList, setImportedAudioList] = useState([]);

    // * RENDERING THE TRIMMED AUDIO LIST FROM LOCALSTORAGE TO BROWSER
    useEffect(() => {
        const savedTrimmedAudioList = localStorage.getItem("trimmedAudioList");
        if (savedTrimmedAudioList) {
            setTrimmedAudioList(JSON.parse(savedTrimmedAudioList));
        }
    }, []);

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

    //* RECORDING START BUTTON
    const startRecording = () => {
        recordStart(
            stream,
            setIsRecording,
            mediaRecorder,
            setAudioChunks,
            mimeType
        );
    };

    //*  RECORDING STOP BUTTON
    const stopRecording = () => {
        recordStop(
            mediaRecorder,
            setIsRecording,
            audioChunks,
            setAudioURL,
            mimeType
        );
    };

    // * TRIMMING AUDIO FUNCTION
    const audioBufferLoad = async (audioBuffer) => {
        loadAudioBuffer(audioBuffer, setAudioBufferSource);
    };

    const trimButtonHandler = async () => {
        handleTrimButtonClick(
            audioChunks,
            mimeType,
            startTrim,
            endTrim,
            setOriginalAudioDuration,
            audioBufferLoad
        );
    };

    // * PLAY THE TRIMMED AUDIO FUNCTION
    const trimmedAudioPlay = () => {
        handlePlay(audioBufferSource, setIsPlaying);
    };

    // * SAVE THE TRIMMED AUDIO FUNCTION
    const trimmedAudioSave = async () => {
        handleSave(
            audioBufferSource,
            setTrimmedAudioList,
            trimmedAudioList,
            bufferToWave,
            setUndoStack,
            undoStack
        );
    };

    // * DELETE THE TRIMMED AUDIO FUNCTION IN THE LIST
    const trimmedAudioDelete = (index) => {
        handleDelete(
            index,
            trimmedAudioList,
            setTrimmedAudioList,
            setUndoStack,
            undoStack
        );
    };

    // * UNDO AND REDO FUNCTION
    const undoTrimmedAudioDelete = () => {
        handleUndo(
            setRedoStack,
            redoStack,
            setTrimmedAudioList,
            trimmedAudioList,
            setUndoStack,
            undoStack
        );
    };

    const redoTrimmedAudioDelete = () => {
        handleRedo(
            setUndoStack,
            undoStack,
            trimmedAudioList,
            setTrimmedAudioList,
            setRedoStack,
            redoStack
        );
    };

    // * MERGE FUNCTION
    const mergeAudioFetch = (urls) => {
        fetchAudio(urls);
    };

    const audioListCheckboxChange = (e, index) => {
        handleCheckboxChange(
            e,
            index,
            selectedAudios,
            setSelectedAudios,
            trimmedAudioList
        );
    };

    const trimmedAudioListWithChecked = addCheckedPropertyToAudioList(
        selectedAudios,
        trimmedAudioList
    );

    const audioMergeFunction = async (audioBuffers) => {
        mergeAudio(audioBuffers, setMergedAudioUrl);
    };

    const audioMergeHandler = async () => {
        handleMerge(
            selectedAudios,
            trimmedAudioBufferToWave,
            setMergedAudioUrl,
            mergedAudioUrl
        );
    };
    // * DOWNLOAD THE TRIMMED AUDIO FUNCTION
    const trimmedAudioDownload = () => {
        handleDownload(audioBufferSource);
    };

    function trimmedAudioBufferToWave(abuffer) {
        return bufferToWave(abuffer);
    }

    // * IMPORT AUDIO FUNCTION
    const fileLabelClick = () => {
        handleLabelClick(inputRef);
    };

    const fileChangeHandler = (event) => {
        handleFileChange(
            event,
            setAudioChunks,
            setImportedAudioList,
            importedAudioList
        );
    };

    return (
        <>
            {user ? (
                <>
                    {" "}
                    <div className="h-[100vh] font-[Poppins]">
                        <div className="container mt-48">
                            <h1 className="text-center font-bold text-4xl mb-3">
                                Trim and Merge Audio
                            </h1>

                            <div className="form-group w-[80%] m-auto d-flex justify-content-around text-center mt-3">
                                <button
                                    id="recordBtn"
                                    className="btn btn-danger w-50 me-4 space-x-2 flex justify-center items-center"
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
                                    className="btn btn-secondary w-[270px] me-4 flex space-x-2 text-white justify-center items-center"
                                    onClick={fileLabelClick}
                                >
                                    Import Audio
                                </label>
                            </div>

                            {/** IMPORTED AUDIO PREVIEW */}
                            <div className="container space-y-5 mt-5">
                                <div className="flex items-center">
                                    <h1 className="text-2xl font-bold">
                                        Imported Audio Preview:
                                    </h1>
                                </div>

                                {importedAudioList.map((audio, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-around"
                                    >
                                        <h3>{audio.name}</h3>
                                        <audio src={audio.url} controls />
                                    </div>
                                ))}
                            </div>

                            {/** AUDIO RECORDED PREVIEW */}
                            <div className="container space-y-5 mt-5">
                                <div className="flex items-center">
                                    <h1 className="text-2xl font-bold">
                                        Recorded Audio Preview:
                                    </h1>
                                    <span className="text-2xl font-bold">
                                        {originalAudioDuration} seconds
                                    </span>
                                </div>

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
                            <div className="w-[100%] mx-auto mt-5 space-y-3">
                                <label htmlFor="startTrim">
                                    Set Start of Trim:
                                </label>
                                <span> {startTrim} seconds</span>
                                <input
                                    type="range"
                                    name="start"
                                    id="startTrim"
                                    min="0"
                                    max="100"
                                    value={startTrim}
                                    onChange={(e) =>
                                        setStartTrim(e.target.value)
                                    }
                                    className="appearance-none w-full h-2 bg-gray-300 rounded-lg outline-none"
                                />
                                <label htmlFor="endTrim">
                                    Set End of Trim:
                                </label>
                                <span> {endTrim} seconds</span>
                                <input
                                    type="range"
                                    name="end"
                                    id="endTrim"
                                    min="0"
                                    max={
                                        audioBufferSource
                                            ? audioBufferSource.duration
                                            : 100
                                    }
                                    value={endTrim}
                                    onChange={(e) => setEndTrim(e.target.value)}
                                    className="appearance-none w-full h-2 bg-gray-300 rounded-lg outline-none"
                                />

                                <div className="flex justify-center">
                                    <button
                                        id="trimBtn"
                                        className="btn btn-primary w-50 me-4 space-x-2 flex justify-center items-center"
                                        onClick={trimButtonHandler}
                                    >
                                        <RxReset /> <span>Trim Audio</span>
                                    </button>
                                    <button
                                        className="flex items-center justify-center  space-x-2 btn btn-danger px-5 py-2 rounded-lg"
                                        onClick={trimmedAudioDownload}
                                    >
                                        <BsDownload />{" "}
                                        <span>Download Trimmed Audio</span>
                                    </button>
                                </div>

                                <div className="flex justify-center">
                                    <button
                                        className="btn btn-primary w-50 me-4 space-x-2 flex justify-center items-center"
                                        onClick={trimmedAudioPlay}
                                        disabled={isPlaying}
                                    >
                                        {isPlaying
                                            ? "Playing Audio..."
                                            : "Play Trimmed Audio"}
                                    </button>
                                    <button
                                        className="flex items-center justify-center  space-x-2 btn btn-danger px-5 py-2 rounded-lg"
                                        onClick={trimmedAudioSave}
                                    >
                                        <BsDownload />{" "}
                                        <span>Save Trimmed Audio</span>
                                    </button>
                                </div>
                            </div>

                            <div className="container space-y-5 mt-5">
                                <h1 className="text-2xl font-bold">
                                    Audio List
                                </h1>

                                <button
                                    className="flex items-center justify-center  space-x-2 btn btn-danger px-5 py-2 rounded-lg"
                                    onClick={undoTrimmedAudioDelete}
                                >
                                    Undo
                                </button>
                                <button
                                    className="flex items-center justify-center  space-x-2 btn btn-danger px-5 py-2 rounded-lg"
                                    onClick={redoTrimmedAudioDelete}
                                >
                                    Redo
                                </button>

                                {trimmedAudioListWithChecked.map(
                                    (audio, index) => (
                                        <div key={index}>
                                            <input
                                                type="checkbox"
                                                checked={audio.checked}
                                                onChange={(e) =>
                                                    audioListCheckboxChange(
                                                        e,
                                                        index
                                                    )
                                                }
                                            />
                                            <label>{audio.name}</label>
                                            <audio
                                                src={audio.url}
                                                controls
                                            ></audio>
                                            <button
                                                className="flex items-center justify-center  space-x-2 btn btn-danger px-5 py-2 rounded-lg"
                                                onClick={trimmedAudioDelete}
                                            >
                                                <BsDownload />{" "}
                                                <span>Delete </span>
                                            </button>
                                        </div>
                                    )
                                )}

                                <button
                                    className="flex items-center justify-center  space-x-2 btn btn-danger px-5 py-2 rounded-lg"
                                    onClick={audioMergeHandler}
                                >
                                    <BsDownload /> <span>Merge Audios</span>
                                </button>
                                <audio src={mergedAudioUrl} controls></audio>
                                <a
                                    className="flex items-center space-x-2 btn btn-danger px-5 py-2 rounded-lg"
                                    href={mergedAudioUrl}
                                    download
                                >
                                    <BsDownload />{" "}
                                    <span>Download Merged Audio</span>
                                </a>
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

export default TrimMerge;
