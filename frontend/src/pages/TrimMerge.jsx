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

    const replaceMediaRecorder = useRef(null);

    const [showReplaceOptions, setShowReplaceOptions] = useState(false);

    const [isReplaceRecording, setIsReplaceRecording] = useState(false);

    const [replaceAudioChunks, setReplaceAudioChunks] = useState([]);

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
            mimeType,
            setWaveSurfer,
            setPlaying,
            sliderRef,
            setRegions
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
        const rightBuffer =
            originalBuffer.numberOfChannels > 1
                ? originalBuffer.getChannelData(1).slice(0, startOffset)
                : new Float32Array(leftBuffer.length).fill(0);
        const newBuffer = waveSurfer.backend.ac.createBuffer(
            2,
            startOffset + originalBuffer.length - endOffset,
            rate
        );
        newBuffer.getChannelData(0).set(leftBuffer);
        newBuffer.getChannelData(1).set(rightBuffer);

        const leftEndBuffer = originalBuffer.getChannelData(0).slice(endOffset);
        const rightEndBuffer =
            originalBuffer.numberOfChannels > 1
                ? originalBuffer.getChannelData(1).slice(endOffset)
                : new Float32Array(leftEndBuffer.length).fill(0);
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

    const handleReplaceButtonClick = () => {
        setShowReplaceOptions(true);
    };

    const handleCancelReplace = () => {
        setShowReplaceOptions(false);
    };

    const handleRecord = (
        region,
        replaceMediaRecorder,
        setReplaceAudioChunks,
        waveSurfer
    ) => {
        setIsReplaceRecording(true);
        console.log("stream: ", stream);
        console.log("mimeType: ", mimeType);
        const media = new MediaRecorder(stream, { type: mimeType });
        console.log("media: ", media);

        replaceMediaRecorder.current = media;

        replaceMediaRecorder.current.start();

        let localAudioChunks = [];

        replaceMediaRecorder.current.ondataavailable = (event) => {
            if (typeof event.data === "undefined") return;
            if (event.data.size === 0) return;

            localAudioChunks.push(event.data);
        };

        setReplaceAudioChunks(localAudioChunks);

        console.log("replace replaceAudioChunks: ", replaceAudioChunks);

        console.log("replace recording start");
    };
    function getRandomColor() {
        const letters = "0123456789ABCDEF";
        return function () {
            let color = "#";
            for (let i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            const result = color + "80";
            // console.log("getRandomColor result:", result);
            return result;
        };
    }

    const handleRecordStop = (region, waveSurfer) => {
        setIsReplaceRecording(false);

        replaceMediaRecorder.current.stop();

        replaceMediaRecorder.current.onstop = () => {
            const audioBlob = new Blob(replaceAudioChunks, { type: mimeType });
            console.log("replace audioBlob: ", audioBlob);

            const reader = new FileReader();
            reader.onload = (event) => {
                const arrayBuffer = event.target.result;
                console.log("replace arrayBuffer: ", arrayBuffer);
                const audioContext = new AudioContext();
                audioContext.decodeAudioData(
                    arrayBuffer,
                    (audioBuffer) => {
                        const audio = {
                            name: "Recorded Audio",
                            url: URL.createObjectURL(audioBlob),
                            buffer: audioBuffer,
                        };

                        console.log("audioBuffer: ", audioBuffer);

                        // Get the start and end time of the selected region
                        const start = region.start;
                        const end = region.end;

                        // Remove the selected region from the waveform
                        region.remove();

                        // Add the recorded audio as a new region at the same start time
                        console.log("waveSurfer: ", waveSurfer);
                        const newRegion = waveSurfer.regions.add({
                            start: start,
                            end: start + audioBuffer.duration,
                            color: getRandomColor(),
                        });

                        console.log("newRegion: ", newRegion);
                        // Set the audio buffer of the new region to the recorded audio buffer
                        newRegion.update({
                            data: audioBuffer,
                        });

                        console.log("newRegion update: ", newRegion);

                        // Set initial playing state to false
                        setPlaying(false);
                    },
                    (error) => {
                        console.error("Error decoding audio data", error);
                    }
                );
            };

            reader.readAsArrayBuffer(audioBlob);

            setAudioURL(URL.createObjectURL(audioBlob));
        };

        console.log("replace recording stop");
    };

    const handleImport = (region) => {
        // logic for importing new audio to replace the selected region
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

                                                <button
                                                    onClick={() =>
                                                        handleReplaceButtonClick()
                                                    }
                                                >
                                                    Replace
                                                </button>
                                                {showReplaceOptions && (
                                                    <div>
                                                        <button
                                                            onClick={() =>
                                                                handleRecord(
                                                                    region,
                                                                    replaceMediaRecorder,
                                                                    setReplaceAudioChunks
                                                                )
                                                            }
                                                        >
                                                            Record
                                                        </button>
                                                        {isReplaceRecording ? (
                                                            <>
                                                                <button
                                                                    onClick={() =>
                                                                        handleRecordStop(
                                                                            region,
                                                                            waveSurfer
                                                                        )
                                                                    }
                                                                >
                                                                    Stop
                                                                    Recording
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <button
                                                                onClick={() =>
                                                                    handleImport(
                                                                        region
                                                                    )
                                                                }
                                                            >
                                                                Import
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={
                                                                handleCancelReplace
                                                            }
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                )}
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
