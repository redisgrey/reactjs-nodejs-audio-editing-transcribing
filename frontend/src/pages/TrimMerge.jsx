import { useState, useRef, useEffect, useContext } from "react";

import { useSelector } from "react-redux";

import { BsFillPlayFill, BsFillStopFill, BsDownload } from "react-icons/bs";

import { FaUndoAlt, FaRedoAlt } from "react-icons/fa";

import { AiFillDelete } from "react-icons/ai";

import { CgMergeVertical } from "react-icons/cg";

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

    const [waveSurfer, setWaveSurfer] = useState(null);

    const [playing, setPlaying] = useState(false);

    const sliderRef = useRef(null);

    const [regions, setRegions] = useState([]);

    const [currentRegion, setCurrentRegion] = useState(null);

    // * RENDERING THE TRIMMED AUDIO LIST FROM LOCALSTORAGE TO BROWSER
    useEffect(() => {
        const savedTrimmedAudioList = localStorage.getItem("trimmedAudioList");
        if (savedTrimmedAudioList) {
            setTrimmedAudioList(JSON.parse(savedTrimmedAudioList));
        }
    }, []);

    useEffect(() => {
        if (waveSurfer) {
            // Update the waveform when the audio list changes
            waveSurfer.empty();
            importedAudioList.forEach((audio) => {
                waveSurfer.load(audio.url);
            });
        }
    }, [importedAudioList]);

    //* MICROPHONE ACCESS
    let constraints = {
        audio: false,
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
            importedAudioList,
            setWaveSurfer,
            setPlaying,
            sliderRef,
            setRegions
        );
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

    const handleVolumeUp = (waveSurfer) => {
        const currentVolume = waveSurfer.getVolume();
        waveSurfer.setVolume(Math.min(currentVolume + 0.1, 1));
    };

    const handleVolumeDown = (waveSurfer) => {
        const currentVolume = waveSurfer.getVolume();
        waveSurfer.setVolume(Math.max(currentVolume - 0.1, 0));
    };

    const handlePlayRegion = (region) => {
        if (currentRegion) {
            waveSurfer.pause();
        }
        waveSurfer.play(region.start, region.end);
        setCurrentRegion(region);
    };

    const handleDeleteRegion = (region) => {
        if (currentRegion && currentRegion.id === region.id) {
            waveSurfer.pause();
            setCurrentRegion(null);
        }
        waveSurfer.regions.list[region.id].remove();
    };

    const handleCutRegion = (region) => {
        const cutFrom = region.start;
        const cutTo = region.end;
        const originalBuffer = waveSurfer.backend.buffer;
        const rate = originalBuffer.sampleRate;
        const originalDuration = originalBuffer.duration;
        const startOffset = parseInt(cutFrom * rate);
        const endOffset = parseInt(cutTo * rate);
        const leftBuffer = originalBuffer
            .getChannelData(0)
            .slice(0, startOffset);
        const rightBuffer = originalBuffer
            .getChannelData(1)
            .slice(0, startOffset);
        const newBuffer = waveSurfer.backend.ac.createBuffer(
            2,
            startOffset + originalBuffer.length - endOffset,
            rate
        );
        newBuffer.getChannelData(0).set(leftBuffer);
        newBuffer.getChannelData(1).set(rightBuffer);
        const leftEndBuffer = originalBuffer.getChannelData(0).slice(endOffset);
        const rightEndBuffer = originalBuffer
            .getChannelData(1)
            .slice(endOffset);
        newBuffer.getChannelData(0).set(leftEndBuffer, startOffset);
        newBuffer.getChannelData(1).set(rightEndBuffer, startOffset);
        waveSurfer.backend.buffer = newBuffer;
        waveSurfer.drawBuffer();
        waveSurfer.clearRegions();
        regions.forEach((reg) => {
            if (reg.id === region.id) return;
            const newStart =
                reg.start > cutTo ? reg.start - (cutTo - cutFrom) : reg.start;
            const newEnd =
                reg.end > cutTo ? reg.end - (cutTo - cutFrom) : reg.end;
            waveSurfer.addRegion({
                id: reg.id,
                start: newStart,
                end: newEnd,
                color: reg.color,
                label: reg.label,
                drag: false,
                resize: false,
            });
        });
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
                                <div id="waveform"></div>
                                <div id="timeline"></div>
                                <button
                                    className="btn mt-5 bg-[#E09F3e] hover:bg-[#e09f3e83] w-50 me-4 space-x-2 flex justify-center items-center"
                                    onClick={handlePlayPause}
                                >
                                    {playing ? "Pause" : "Play"}
                                </button>{" "}
                                <input
                                    type="range"
                                    id="slider"
                                    ref={sliderRef}
                                    min="0.5"
                                    max="100"
                                    step="0.01"
                                    defaultValue="1"
                                />
                                <button
                                    onClick={() => handleVolumeUp(waveSurfer)}
                                >
                                    Volume Up
                                </button>
                                <button
                                    onClick={() => handleVolumeDown(waveSurfer)}
                                >
                                    Volume Down
                                </button>
                                <div>
                                    {/* Render the list of regions */}
                                    <ul>
                                        {regions.map((region, index) => (
                                            <li key={region.id}>
                                                <div
                                                    style={{
                                                        backgroundColor:
                                                            region.color,
                                                        width: "50px",
                                                        height: "20px",
                                                        display: "inline-block",
                                                        marginRight: "5px",
                                                    }}
                                                ></div>
                                                <span>{region.label}</span>
                                                <button
                                                    onClick={() =>
                                                        handlePlayRegion(region)
                                                    }
                                                >
                                                    Play
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDeleteRegion(
                                                            region
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleCutRegion(region)
                                                    }
                                                >
                                                    Cut
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                    {/* Render the waveform and plugins */}
                                    <div id="waveform"></div>
                                    <div id="timeline"></div>
                                </div>
                                {/** AUDIO RECORDED PREVIEW */}
                                <div className="container space-y-5 mt-5">
                                    <div className="flex items-center">
                                        <h1 className="text-2xl font-medium">
                                            Recorded Audio Preview:{" "}
                                        </h1>
                                        <span className="text-2xl font-medium">
                                            {originalAudioDuration} seconds
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <audio
                                            src={audioURL}
                                            controls
                                            className="w-[70%]"
                                        ></audio>
                                        <a
                                            className="flex items-center space-x-2 btn text-white bg-red-500 hover:bg-red-300 px-5 py-2 rounded-lg"
                                            href={audioURL}
                                            download
                                        >
                                            <BsDownload />{" "}
                                            <span>Download Audio</span>
                                        </a>
                                    </div>
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

                                <div className="flex justify-between">
                                    <button
                                        id="trimBtn"
                                        className="btn bg-[#E09F3e] hover:bg-[#e09f3e83] w-50 me-4 space-x-2 flex justify-center items-center"
                                        onClick={trimButtonHandler}
                                    >
                                        <RxReset /> <span>Trim Audio</span>
                                    </button>
                                    <button
                                        className="flex items-center w-50 justify-center  space-x-2 btn text-white bg-red-500 hover:bg-red-300 px-5 py-2 rounded-lg"
                                        onClick={trimmedAudioDownload}
                                    >
                                        <BsDownload />{" "}
                                        <span>Download Trimmed Audio</span>
                                    </button>
                                </div>

                                <div className="flex justify-between">
                                    <button
                                        className="btn bg-[#E09F3e] hover:bg-[#e09f3e83] w-50 me-4 space-x-2 flex justify-center items-center"
                                        onClick={trimmedAudioPlay}
                                        disabled={isPlaying}
                                    >
                                        {isPlaying ? (
                                            "Playing Audio..."
                                        ) : (
                                            <>
                                                {" "}
                                                <BsFillPlayFill /> Play Trimmed
                                                Audio
                                            </>
                                        )}
                                    </button>
                                    <button
                                        className="flex items-center w-50 justify-center  space-x-2 btn text-white bg-red-500 hover:bg-red-300 px-5 py-2 rounded-lg"
                                        onClick={trimmedAudioSave}
                                    >
                                        <BsDownload />{" "}
                                        <span>Save Trimmed Audio</span>
                                    </button>
                                </div>
                            </div>

                            <div className="container space-y-5 mt-5 bg-gray-300 p-3 px-4 rounded-lg">
                                <div className="flex justify-between">
                                    <h1 className="text-2xl font-medium">
                                        Audio List
                                    </h1>

                                    <div className="flex space-x-5 ">
                                        <button
                                            className="flex items-center justify-center  space-x-2 btn text-white bg-red-500 hover:bg-red-300 px-5 py-2 rounded-lg"
                                            onClick={undoTrimmedAudioDelete}
                                        >
                                            <FaUndoAlt /> <span> Undo</span>
                                        </button>
                                        <button
                                            className="flex items-center justify-center  space-x-2 btn bg-[#E09F3e] hover:bg-[#e09f3e83] px-5 py-2 rounded-lg"
                                            onClick={redoTrimmedAudioDelete}
                                        >
                                            <FaRedoAlt /> <span> Redo</span>
                                        </button>
                                    </div>
                                </div>

                                {trimmedAudioListWithChecked.length >= 1 ? (
                                    trimmedAudioListWithChecked.map(
                                        (audio, index) => (
                                            <div
                                                key={index}
                                                className="flex w-[100%] justify-between"
                                            >
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

                                                <audio
                                                    src={audio.url}
                                                    controls
                                                    className="w-[75%]"
                                                ></audio>
                                                <button
                                                    className="flex items-center justify-center  space-x-2 btn btn-secondary px-5 py-2 rounded-lg"
                                                    onClick={trimmedAudioDelete}
                                                >
                                                    <AiFillDelete />{" "}
                                                    <span>Delete </span>
                                                </button>
                                            </div>
                                        )
                                    )
                                ) : (
                                    <>
                                        <div>
                                            Saved Trimmed Audios will be listed
                                            here
                                        </div>
                                    </>
                                )}

                                {trimmedAudioListWithChecked.length > 1 ? (
                                    <>
                                        {" "}
                                        <div className="flex justify-center">
                                            <button
                                                className="flex items-center justify-center  space-x-2 btn bg-[#E09F3e] hover:bg-[#e09f3e83] px-5 py-2 rounded-lg"
                                                onClick={audioMergeHandler}
                                            >
                                                <CgMergeVertical />{" "}
                                                <span>Merge Audios</span>
                                            </button>
                                        </div>
                                        <audio
                                            src={mergedAudioUrl}
                                            controls
                                            className="w-[100%]"
                                        ></audio>
                                        <div className="flex justify-center">
                                            <a
                                                className="flex items-center space-x-2 btn text-white bg-red-500 hover:bg-red-300 px-5 py-2 rounded-lg"
                                                href={mergedAudioUrl}
                                                download
                                            >
                                                <BsDownload />{" "}
                                                <span>
                                                    Download Merged Audio
                                                </span>
                                            </a>
                                        </div>
                                    </>
                                ) : null}
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
