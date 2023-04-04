import { useState, useRef, useEffect } from "react";

import { useSelector } from "react-redux";

import {
    BsFillPlayFill,
    BsFillStopFill,
    BsDownload,
    BsSignTurnRight,
} from "react-icons/bs";

import {
    recordStart,
    recordStop,
    handleLabelClick,
    handleFileChange,
} from "../js/audioFunctions";

import NotFound from "./NotFound";

const mimeType = "audio/mpeg";

const audioHistory = [];
const regionHistory = [];
const redoAudioHistory = [];
const redoRegionHistory = [];

function TrimMerge() {
    const { user } = useSelector((state) => state.auth);

    //* INTIALIZING THE MEDIARECORDER API
    const mediaRecorder = useRef(null);

    const [isRecording, setIsRecording] = useState(false);

    //* STATES FOR THE MEDIARECORDER API
    const [stream, setStream] = useState(null);

    const [audioChunks, setAudioChunks] = useState([]);

    const [audioURL, setAudioURL] = useState(null);

    const inputRef = useRef(null);

    const [importedAudioList, setImportedAudioList] = useState([]);

    const [waveSurfer, setWaveSurfer] = useState(null);

    const [playing, setPlaying] = useState(false);

    const sliderRef = useRef(null);

    const [regions, setRegions] = useState([]);

    const [currentRegion, setCurrentRegion] = useState(null);

    const [canRedo, setCanRedo] = useState(false);

    //* MICROPHONE ACCESS
    // let constraints = {
    //     audio: false,
    //     video: false,
    // };

    // async function getMedia(constraints) {
    //     try {
    //         let streamData = await navigator.mediaDevices.getUserMedia(
    //             constraints
    //         );
    //         setStream(streamData);
    //     } catch (err) {
    //         console.log(err);
    //     }
    // }

    // getMedia(constraints);

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

    const handleDeleteRegion = async (region) => {
        // Store the current state in the history arrays
        audioHistory.push(waveSurfer.backend.buffer.getChannelData(0).slice());
        regionHistory.push([...regions]);
        console.log("delete audioHistory: ", audioHistory);
        console.log("delete regionHistory: ", regionHistory);
        if (currentRegion && currentRegion.id === region.id) {
            waveSurfer.pause();
            setCurrentRegion(null);
        }
        await waveSurfer.regions.list[region.id].remove();
    };

    const handleCutRegion = (region) => {
        // Store the current state in the history arrays
        audioHistory.push(waveSurfer.backend.buffer.getChannelData(0).slice());
        regionHistory.push([...regions]);

        console.log("cut audioHistory: ", audioHistory);
        console.log("cut regionHistory: ", regionHistory);

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

        // Remove the cut region from the list and the waveform
        const index = regions.findIndex((reg) => reg.id === region.id);
        regions.splice(index, 1);
        waveSurfer.regions.list[region.id].remove();

        waveSurfer.drawBuffer();
        waveSurfer.clearRegions();
        regions.forEach((reg) => {
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
                drag: true,
                resize: true,
            });
        });
    };
    const handleUndo = () => {
        console.log("undo audioHistory: ", audioHistory);
        console.log("undo regionHistory: ", regionHistory);

        // Check if there are any previous actions in the history arrays
        if (audioHistory.length < 1 || regionHistory.length < 1) return;

        // Restore the previous state and actions
        const prevAudioState = audioHistory.pop();
        const prevAudioFloat32Array = new Float32Array(prevAudioState);
        const prevRegionState = regionHistory.pop();

        waveSurfer.backend.buffer.copyToChannel(prevAudioFloat32Array, 0);

        // Remove all existing regions on the waveform
        waveSurfer.clearRegions();

        // Add the previous regions to the waveform
        prevRegionState.forEach((region, index) => {
            const prevColor = prevRegionState[index].color;
            const newRegion = waveSurfer.addRegion(region);
            newRegion.update({
                color: prevColor,
            });
        });
        // Update the state with the previous region state
        setRegions(prevRegionState);

        // Add the previous state and actions to redo history
        redoAudioHistory.push(prevAudioState);
        redoRegionHistory.push(prevRegionState);

        setCanRedo(true);
    };

    const handleRedo = () => {
        console.log("redo audioHistory: ", audioHistory);
        console.log("redo regionHistory: ", regionHistory);
        if (!canRedo) return;
        if (redoAudioHistory.length < 1 || redoRegionHistory.length < 1) return;

        // Restore the next state and actions
        const nextAudioState = redoAudioHistory.pop();
        const nextAudioFloat32Array = new Float32Array(nextAudioState);
        const nextRegionState = redoRegionHistory.pop();

        waveSurfer.backend.buffer.copyToChannel(nextAudioFloat32Array, 0);

        // Remove all existing regions on the waveform
        waveSurfer.clearRegions();

        // Add the next regions to the waveform
        nextRegionState.forEach((region, index) => {
            const nextColor = nextRegionState[index].color;
            const newRegion = waveSurfer.addRegion(region);
            newRegion.update({
                color: nextColor,
            });
        });

        // Update the state with the next region state
        setRegions(nextRegionState);

        // Add the current state and actions to undo history
        audioHistory.push(nextAudioState);
        regionHistory.push(nextRegionState);

        setCanRedo(redoAudioHistory.length > 0 && redoRegionHistory.length > 0);
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
                                    <div className="flex">
                                        <button
                                            className="btn bg-[#E09F3e] hover:bg-[#e09f3e83] w-50 me-4 space-x-2 flex justify-center items-center"
                                            onClick={() => handleUndo()}
                                            disabled={audioHistory.length === 0}
                                        >
                                            Undo
                                        </button>
                                        <button
                                            className="btn bg-[#E09F3e] hover:bg-[#e09f3e83] w-50 me-4 space-x-2 flex justify-center items-center"
                                            onClick={() => handleRedo()}
                                            disabled={!canRedo}
                                        >
                                            Redo
                                        </button>
                                    </div>

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

export default TrimMerge;
