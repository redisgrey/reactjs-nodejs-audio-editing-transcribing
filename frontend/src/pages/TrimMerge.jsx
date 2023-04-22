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

    const [isReplacing, setIsReplacing] = useState(false);

    const [isReplaceRecording, setIsReplaceRecording] = useState(false);

    const [newMediaRecorder, setNewMediaRecorder] = useState(null);

    const [undoActions, setUndoActions] = useState([]);

    const [redoActions, setRedoActions] = useState([]);

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

    const handleRestart = () => {
        waveSurfer.seekTo(0);
        waveSurfer.play();
        setCurrentRegion(null);
    };

    const undo = () => {
        if (undoActions.length > 0) {
            const lastAction = undoActions.pop();
            redoActions.push(lastAction);

            switch (lastAction.type) {
                case "DELETE_REGION":
                    // Add back deleted region
                    regions.splice(lastAction.index, 0, lastAction.region);
                    waveSurfer.addRegion(lastAction.region);

                    // Restore original color of region
                    waveSurfer.regions.list[lastAction.region.id].update({
                        color: lastAction.color,
                    });

                    // Update keys for regions list
                    setRegions(
                        regions.map((region) => ({ ...region, key: region.id }))
                    );
                    break;

                case "CUT_REGION":
                    console.log(
                        "lastAction originalBuffer: ",
                        lastAction.originalBuffer
                    );
                    // Restore original buffer
                    const originalBuffer = lastAction.originalBuffer;
                    console.log("undo cut originalBuffer: ", originalBuffer);
                    waveSurfer.backend.buffer = originalBuffer;

                    const numChannels = originalBuffer.numberOfChannels;

                    const newBuffer = waveSurfer.backend.ac.createBuffer(
                        numChannels,
                        originalBuffer.length,
                        originalBuffer.sampleRate
                    );
                    console.log("undo cut newBuffer: ", newBuffer);
                    const leftChannel = originalBuffer.getChannelData(0);
                    const rightChannel =
                        originalBuffer.numberOfChannels > 1
                            ? originalBuffer.getChannelData(1)
                            : new Float32Array(leftChannel.length).fill(0);
                    console.log("undo cut leftChannel: ", leftChannel);
                    console.log("undo cut rightChannel: ", rightChannel);
                    const maxDataLength = Math.min(
                        leftChannel.length,
                        newBuffer.getChannelData(0).length
                    );
                    newBuffer
                        .getChannelData(0)
                        .set(leftChannel.subarray(0, maxDataLength));

                    if (numChannels > 1) {
                        newBuffer
                            .getChannelData(1)
                            .set(rightChannel.subarray(0, maxDataLength));
                    }

                    console.log(
                        "undo cut newBuffer getChannelData(0): ",
                        newBuffer.getChannelData(0)
                    );

                    // Restore cut region

                    const cutRegion = lastAction.region;
                    console.log("undo cut cutRegion: ", cutRegion);
                    const startOffset = parseInt(
                        cutRegion.start * originalBuffer.sampleRate
                    );
                    const endOffset = parseInt(
                        cutRegion.end * originalBuffer.sampleRate
                    );
                    console.log("undo cut startOffset: ", startOffset);
                    console.log("undo cut endoffset: ", endOffset);
                    const leftCutBuffer = originalBuffer
                        .getChannelData(0)
                        .slice(startOffset, endOffset);
                    const rightCutBuffer =
                        originalBuffer.numberOfChannels > 1
                            ? originalBuffer
                                  .getChannelData(1)
                                  .slice(startOffset, endOffset)
                            : new Float32Array(leftCutBuffer.length).fill(0);
                    console.log("undo cut leftCutBuffer: ", leftCutBuffer);
                    console.log("undo cut rightCutBuffer: ", rightCutBuffer);
                    try {
                        newBuffer
                            .getChannelData(0)
                            .set(leftCutBuffer, startOffset);

                        if (numChannels > 1) {
                            newBuffer
                                .getChannelData(1)
                                .set(rightCutBuffer, startOffset);
                        }
                    } catch (e) {
                        console.log("Error: ", e);
                        console.log(
                            "leftCutBuffer length: ",
                            leftCutBuffer.length
                        );
                        console.log(
                            "rightCutBuffer length: ",
                            rightCutBuffer.length
                        );
                        console.log("startOffset: ", startOffset);
                        console.log("endOffset: ", endOffset);
                    }
                    waveSurfer.backend.buffer = newBuffer;

                    // Add cut region back to WaveSurfer and update regions list
                    waveSurfer.addRegion(lastAction.region);
                    const newRegions = regions
                        .concat([lastAction.region])
                        .sort((a, b) => a.start - b.start);
                    setRegions(
                        newRegions.map((region) => ({
                            ...region,
                            key: region.id,
                        }))
                    );

                    // Restore original color of region
                    waveSurfer.regions.list[lastAction.region.id].update({
                        color: lastAction.color,
                    });

                    break;

                case "REPLACE_REGION":
                    // Get original buffer and region
                    const replaceOriginalBuffer = lastAction.originalBuffer;
                    console.log(
                        "undo replace originalbuffer: ",
                        replaceOriginalBuffer
                    );
                    const originalRegion = lastAction.originalRegion;

                    // Restore original buffer
                    waveSurfer.backend.buffer = replaceOriginalBuffer;

                    // Add cut region back to WaveSurfer and update regions list
                    waveSurfer.addRegion(lastAction.region);
                    const newReplaceRegions = regions
                        .concat([lastAction.region])
                        .sort((a, b) => a.start - b.start);
                    setRegions(
                        newReplaceRegions.map((region) => ({
                            ...region,
                            key: region.id,
                        }))
                    );

                    // Restore original color of region
                    waveSurfer.regions.list[lastAction.region.id].update({
                        color: lastAction.color,
                    });

                    break;

                default:
                    break;
            }
        }
    };

    const redo = () => {
        if (redoActions.length > 0) {
            const lastAction = redoActions.pop();

            switch (lastAction.type) {
                case "DELETE_REGION":
                    // Remove deleted region
                    const index = regions.findIndex(
                        (reg) => reg.id === lastAction.region.id
                    );
                    regions.splice(index, 1);
                    waveSurfer.regions.list[lastAction.region.id].remove();
                    break;

                    // case "REPLACE_REGION":
                    // Replace region with old region
                    const oldRegion = lastAction.oldRegion;
                    const newRegion = lastAction.newRegion;
                    regions.splice(regions.indexOf(newRegion), 1, oldRegion);
                    waveSurfer.regions.list[newRegion.id].update(oldRegion);
                    break;
                default:
                    break;
            }

            undoActions.push(lastAction);
        }
    };

    const handleDeleteRegion = async (region) => {
        // Store original color of deleted region
        const originalColor = region.color;

        if (currentRegion && currentRegion.id === region.id) {
            waveSurfer.pause();
            setCurrentRegion(null);
        }
        await waveSurfer.regions.list[region.id].remove();
        // Add delete action to undoActions array
        const action = { type: "DELETE_REGION", region, color: originalColor };
        setUndoActions([...undoActions, action]);
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

        // Add cut action to undoActions array
        const action = {
            type: "CUT_REGION",
            region,
            index,
            color: region.color,
            originalBuffer: originalBuffer,
        };
        setUndoActions([...undoActions, action]);
    };

    const handleReplaceFunction = () => {
        setIsReplacing(true);
    };

    const handleReplaceImportFunction = (region) => {
        // Save original buffer state to a variable
        const originalBufferState = waveSurfer.backend.buffer;

        const replaceFrom = region.start;
        const replaceTo = region.end;
        const originalBuffer = waveSurfer.backend.buffer;
        const rate = originalBuffer.sampleRate;
        const originalDuration = originalBuffer.duration;
        const startOffset = parseInt(replaceFrom * rate);
        const endOffset = parseInt(replaceTo * rate);

        const leftBuffer = originalBuffer
            .getChannelData(0)
            .slice(0, startOffset);
        const rightBuffer =
            originalBuffer.numberOfChannels > 1
                ? originalBuffer.getChannelData(1).slice(0, startOffset)
                : new Float32Array(leftBuffer.length).fill(0);

        // Create an input element to select the file
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "audio/*";
        fileInput.addEventListener("change", (event) => {
            const file = event.target.files[0];
            // Use FileReader API to read contents of imported file
            const reader = new FileReader();
            reader.onload = (event) => {
                const importedAudio = event.target.result;
                // Decode the imported audio and get its channel data
                waveSurfer.backend.ac.decodeAudioData(
                    importedAudio,
                    (importedBuffer) => {
                        const importedLeftBuffer =
                            importedBuffer.getChannelData(0);
                        const importedRightBuffer =
                            importedBuffer.numberOfChannels > 1
                                ? importedBuffer.getChannelData(1)
                                : new Float32Array(
                                      importedLeftBuffer.length
                                  ).fill(0);

                        const leftEndBuffer = originalBuffer
                            .getChannelData(0)
                            .slice(endOffset);
                        const rightEndBuffer =
                            originalBuffer.numberOfChannels > 1
                                ? originalBuffer
                                      .getChannelData(1)
                                      .slice(endOffset)
                                : new Float32Array(leftEndBuffer.length).fill(
                                      0
                                  );

                        // Create new buffer with contents of both audio before and after the selected region, as well as the imported audio
                        const newBuffer = waveSurfer.backend.ac.createBuffer(
                            2,
                            startOffset +
                                importedLeftBuffer.length +
                                leftEndBuffer.length,
                            rate
                        );
                        newBuffer.getChannelData(0).set(leftBuffer);
                        newBuffer.getChannelData(1).set(rightBuffer);
                        newBuffer
                            .getChannelData(0)
                            .set(importedLeftBuffer, startOffset);
                        newBuffer
                            .getChannelData(1)
                            .set(importedRightBuffer, startOffset);
                        newBuffer
                            .getChannelData(0)
                            .set(
                                leftEndBuffer,
                                startOffset + importedLeftBuffer.length
                            );

                        waveSurfer.backend.buffer = newBuffer;

                        // Remove the replaced region from the list and the waveform
                        const index = regions.findIndex(
                            (reg) => reg.id === region.id
                        );
                        regions.splice(index, 1);
                        waveSurfer.regions.list[region.id].remove();

                        waveSurfer.drawBuffer();
                        waveSurfer.clearRegions();

                        // Add new regions based on updated audio
                        let offset = 0;
                        regions.forEach((reg) => {
                            const newStart =
                                reg.start > replaceTo
                                    ? reg.start - (replaceTo - replaceFrom)
                                    : reg.start;
                            const newEnd =
                                reg.end > replaceTo
                                    ? reg.end - (replaceTo - replaceFrom)
                                    : reg.end;
                            waveSurfer.addRegion({
                                id: reg.id,
                                start: newStart,
                                end: newEnd,
                                color: reg.color,
                                label: reg.label,
                                drag: true,
                            });
                        });

                        // Clear the file input element
                        fileInput.value = "";
                    }
                );
            };
            reader.readAsArrayBuffer(file);
        });
        fileInput.click();

        setIsReplacing(false);

        // Clear redoActions array
        setRedoActions([]);

        // Add cut action to undoActions array
        const action = {
            type: "REPLACE_REGION",
            region,

            color: region.color,
            originalBuffer: originalBuffer,
        };
        setUndoActions([...undoActions, action]);
    };

    const handleReplaceRecordFunction = (region, stream) => {
        const replaceFrom = region.start;
        const replaceTo = region.end;
        const originalBuffer = waveSurfer.backend.buffer;
        const rate = originalBuffer.sampleRate;
        const originalDuration = originalBuffer.duration;
        const startOffset = parseInt(replaceFrom * rate);
        const endOffset = parseInt(replaceTo * rate);

        const leftBuffer = originalBuffer
            .getChannelData(0)
            .slice(0, startOffset);
        const rightBuffer =
            originalBuffer.numberOfChannels > 1
                ? originalBuffer.getChannelData(1).slice(0, startOffset)
                : new Float32Array(leftBuffer.length).fill(0);

        const mediaRecorder = new MediaRecorder(stream);
        const chunks = [];
        if (mediaRecorder) {
            console.log("mediaRecorder: ", mediaRecorder);
            mediaRecorder.addEventListener("dataavailable", (event) => {
                chunks.push(event.data);
            });
            mediaRecorder.addEventListener("stop", async () => {
                setIsReplaceRecording(false);
                // Convert recorded audio to buffer
                const blob = new Blob(chunks, {
                    type: "audio/ogg; codecs=opus",
                });
                const arrayBuffer = await blob.arrayBuffer();
                const recordedBuffer =
                    await waveSurfer.backend.ac.decodeAudioData(arrayBuffer);

                // Replace the selected region with the recorded audio
                const newBuffer = waveSurfer.backend.ac.createBuffer(
                    originalBuffer.numberOfChannels,
                    originalBuffer.length,
                    originalBuffer.sampleRate
                );
                const numChannels = originalBuffer.numberOfChannels;
                for (let i = 0; i < numChannels; i++) {
                    const channelData = originalBuffer.getChannelData(i);
                    const newChannelData = newBuffer.getChannelData(i);
                    if (i < recordedBuffer.numberOfChannels) {
                        newChannelData.set(
                            channelData.subarray(0, startOffset)
                        );
                        newChannelData.set(
                            recordedBuffer.getChannelData(i),
                            startOffset
                        );
                        newChannelData.set(
                            channelData.subarray(endOffset),
                            startOffset + recordedBuffer.length
                        );
                    } else {
                        newChannelData.set(channelData);
                    }
                }

                waveSurfer.backend.buffer = newBuffer;

                // Remove the replaced region from the list and the waveform
                const index = regions.findIndex((reg) => reg.id === region.id);
                regions.splice(index, 1);
                waveSurfer.regions.list[region.id].remove();

                waveSurfer.drawBuffer();
                waveSurfer.clearRegions();

                // Add new regions based on updated audio
                let offset = 0;
                regions.forEach((reg) => {
                    const newStart =
                        reg.start > replaceTo
                            ? reg.start - (replaceTo - replaceFrom)
                            : reg.start;
                    const newEnd =
                        reg.end > replaceTo
                            ? reg.end - (replaceTo - replaceFrom)
                            : reg.end;
                    waveSurfer.addRegion({
                        id: reg.id,
                        start: newStart,
                        end: newEnd,
                        color: reg.color,
                        label: reg.label,
                        drag: true,
                    });
                });

                setIsReplacing(false);

                // Clear redoActions array
                setRedoActions([]);
            });
            mediaRecorder.start();
            setIsReplaceRecording(true);

            // Set the newMediaRecorder object to state so it can be stopped later
            setNewMediaRecorder(mediaRecorder);
        }

        console.log("replace record start");

        // Add cut action to undoActions array
        const action = {
            type: "REPLACE_REGION",
            region,

            color: region.color,
            originalBuffer: originalBuffer,
        };
        setUndoActions([...undoActions, action]);
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
                                </div>

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
                                    <div className="flex space-x-5 mt-4 mb-2">
                                        <button
                                            className="btn bg-red-500 text-white"
                                            onClick={undo}
                                        >
                                            UNDO
                                        </button>
                                        <button
                                            className="btn bg-red-500 text-white"
                                            onClick={redo}
                                        >
                                            REDO
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
                                                <button
                                                    onClick={() =>
                                                        handleReplaceFunction()
                                                    }
                                                >
                                                    Replace
                                                </button>
                                                {isReplacing ? (
                                                    <>
                                                        {" "}
                                                        <button
                                                            onClick={() =>
                                                                handleReplaceRecordFunction(
                                                                    region,
                                                                    stream
                                                                )
                                                            }
                                                        >
                                                            Record
                                                        </button>{" "}
                                                        {isReplaceRecording ? (
                                                            <button
                                                                onClick={() =>
                                                                    handleReplaceRecordStop()
                                                                }
                                                            >
                                                                Stop Recording
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() =>
                                                                    handleReplaceImportFunction(
                                                                        region
                                                                    )
                                                                }
                                                            >
                                                                Import
                                                            </button>
                                                        )}{" "}
                                                        <button
                                                            onClick={() =>
                                                                setIsReplacing(
                                                                    false
                                                                )
                                                            }
                                                        >
                                                            Cancel
                                                        </button>{" "}
                                                    </>
                                                ) : null}
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
