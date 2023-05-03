import WaveSurfer from "wavesurfer.js";

import TimelinePlugin from "wavesurfer.js/dist/plugin/wavesurfer.timeline.min.js";

import RegionsPlugin from "wavesurfer.js/dist/plugin/wavesurfer.regions.min.js";

export const saveAudioToIndexedDB = async (audioBlob) => {
    console.log("audioBlob: ", audioBlob);

    const userId = JSON.parse(localStorage.getItem("user")).id;
    console.log(userId);
    const db = await openDatabase(userId); // pass in the user ID
    const tx = db.transaction("audio", "readwrite");
    const store = tx.objectStore("audio");
    const id = "audio-to-edit";
    store.put(audioBlob, id);
    await tx.complete;
    console.log("Audio saved to IndexedDB with id:", id);
};

export const openDatabase = (userId) => {
    return new Promise((resolve, reject) => {
        const request = window.indexedDB.open(`myDatabase-${userId}`, 2); // include the user ID in the database name
        request.onerror = () => {
            console.log("Failed to open database");
            reject();
        };
        request.onsuccess = () => {
            console.log("Database opened successfully");
            resolve(request.result);
        };
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            const objectStore = db.createObjectStore("audio");
        };
    });
};

export const loadAudioFromIndexedDB = (
    setWaveSurfer,
    setPlaying,
    setRegions,
    sliderRef,
    userId,
    setIsTranscribing,
    handleStopTranscription
) => {
    // Open the database
    const request = indexedDB.open(`myDatabase-${userId}`); // include the user ID in the database name

    request.onerror = (event) => {
        console.log("Error opening database:", event.target.error);
    };

    request.onsuccess = (event) => {
        const db = event.target.result;

        // Retrieve the audio file from the object store
        const transaction = db.transaction(["audio"], "readonly");
        const objectStore = transaction.objectStore("audio");
        const request = objectStore.get("audio-to-edit");

        request.onsuccess = (event) => {
            const audioFile = event.target.result;

            console.log("audioFile: ", audioFile);

            // Create a new instance of WaveSurfer
            const waveSurfer = WaveSurfer.create({
                container: "#waveform",
                waveColor: "violet",
                progressColor: "purple",
                plugins: [
                    TimelinePlugin.create({
                        container: "#timeline",
                    }),
                    RegionsPlugin.create({
                        regionsMinLength: 0.5,
                        dragSelection: {
                            slop: 5,
                        },
                        // Use the color property to set the fill color of the region
                        color: getRandomColor,
                    }),
                ],
            });

            // Add event listeners to the WaveSurfer instance
            waveSurfer.on("region-created", (region) => {
                setRegions((prevRegions) => [...prevRegions, region]);
                // console.log("Region created:", region);
                region.update({ color: getRandomColor()() });
                // Perform any necessary processing or actions here
            });

            waveSurfer.on("region-updated", (region) => {
                // Stop playback if a region is currently playing
                if (waveSurfer.isPlaying()) {
                    waveSurfer.pause();
                }
                setRegions((prevRegions) => {
                    const index = prevRegions.findIndex(
                        (r) => r.id === region.id
                    );
                    if (index === -1) return prevRegions;
                    const updatedRegions = [...prevRegions];
                    updatedRegions[index] = region;
                    return updatedRegions;
                });
            });

            waveSurfer.on("region-removed", (region) => {
                setRegions((prevRegions) =>
                    prevRegions.filter((r) => r.id !== region.id)
                );
            });

            waveSurfer.on("finish", function () {
                console.log("finished playing");
                setPlaying(false);
                setIsTranscribing(false);
                handleStopTranscription();
            });

            sliderRef.current.oninput = function () {
                waveSurfer.zoom(Number(this.value));
            };

            // Load the audio buffer into WaveSurfer
            waveSurfer.loadBlob(audioFile);
            console.log("waveSurfer: ", waveSurfer);

            // Set the WaveSurfer instance to state
            setWaveSurfer(waveSurfer);

            // Set initial playing state to false
            setPlaying(false);
            console.log("load called");
        };
    };
};

//* RECORDING START BUTTON
export const recordStart = (
    stream,
    setIsRecording,
    mediaRecorder,
    setAudioChunks,
    audioChunks,
    mimeType
) => {
    setIsRecording(true);

    const media = new MediaRecorder(stream, { type: mimeType });

    console.log("media: ", media);

    mediaRecorder.current = media;

    mediaRecorder.current.start();

    let localAudioChunks = [];

    mediaRecorder.current.ondataavailable = (event) => {
        if (typeof event.data === "undefined") return;

        if (event.data.size === 0) return;

        localAudioChunks.push(event.data);
    };

    console.log("localAudioChunks: ", localAudioChunks);

    setAudioChunks(localAudioChunks);

    console.log("audioChunks: ", audioChunks);

    console.log("recording start");
};

export const recordStop = (
    mediaRecorder,
    setIsRecording,
    audioChunks,
    mimeType,
    setWaveSurfer,
    setPlaying,
    sliderRef,
    setRegions,
    setIsTranscribing,
    handleStopTranscription
) => {
    setIsRecording(false);

    mediaRecorder.current.stop();

    mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: mimeType });

        saveAudioToIndexedDB(audioBlob);
        const reader = new FileReader();
        reader.onload = (event) => {
            const arrayBuffer = event.target.result;
            const audioContext = new AudioContext();
            audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
                const audio = {
                    name: "Recorded Audio",
                    url: URL.createObjectURL(audioBlob),
                    buffer: audioBuffer,
                };
                // Create a new instance of WaveSurfer
                const waveSurfer = WaveSurfer.create({
                    container: "#waveform",
                    waveColor: "violet",
                    progressColor: "purple",
                    plugins: [
                        TimelinePlugin.create({
                            container: "#timeline",
                        }),
                        RegionsPlugin.create({
                            regionsMinLength: 0.5,
                            dragSelection: {
                                slop: 5,
                            },
                            // Use the color property to set the fill color of the region
                            color: getRandomColor,
                        }),
                    ],
                });

                // Add event listeners to the WaveSurfer instance
                waveSurfer.on("region-created", (region) => {
                    setRegions((prevRegions) => [...prevRegions, region]);
                    region.update({ color: getRandomColor()() });
                });

                waveSurfer.on("region-updated", (region) => {
                    // Stop playback if a region is currently playing
                    if (waveSurfer.isPlaying()) {
                        waveSurfer.pause();
                    }
                    setRegions((prevRegions) => {
                        const index = prevRegions.findIndex(
                            (r) => r.id === region.id
                        );
                        if (index === -1) return prevRegions;
                        const updatedRegions = [...prevRegions];
                        updatedRegions[index] = region;
                        return updatedRegions;
                    });
                });

                waveSurfer.on("region-removed", (region) => {
                    setRegions((prevRegions) =>
                        prevRegions.filter((r) => r.id !== region.id)
                    );
                });

                waveSurfer.on("finish", function () {
                    console.log("finished playing");
                    setPlaying(false);
                    setIsTranscribing(false);
                    handleStopTranscription();
                });

                sliderRef.current.oninput = function () {
                    waveSurfer.zoom(Number(this.value));
                };

                // Load the audio buffer into WaveSurfer
                waveSurfer.loadDecodedBuffer(audioBuffer);

                // Set the WaveSurfer instance to state
                setWaveSurfer(waveSurfer);

                // Set initial playing state to false
                setPlaying(false);
            });
        };

        reader.readAsArrayBuffer(audioBlob);
    };

    console.log("recording stop");
};

// * IMPORT AUDIO FUNCTION
export const handleLabelClick = (inputRef) => {
    inputRef.current.click();
};

function getRandomColor() {
    const letters = "0123456789ABCDEF";
    return function () {
        let color = "#";
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        const result = color + "80";
        return result;
    };
}
export const handleFileChange = (
    event,
    setAudioChunks,
    setWaveSurfer,
    setPlaying,
    sliderRef,
    setRegions,
    setIsTranscribing,
    handleStopTranscription
) => {
    const file = event.target.files[0];

    // Validate file type
    if (!file.type.startsWith("audio/")) {
        alert("Please select an audio file");
        return;
    }

    // Validate file size
    if (file.size > 10 * 1024 * 1024) {
        alert("File size exceeds the maximum limit of 10 MB.");
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        const audioBlob = new Blob([event.target.result], {
            type: file.type,
        });
        setAudioChunks([audioBlob]);
        console.log("audioBlob import: ", audioBlob);
        saveAudioToIndexedDB(audioBlob);
        const arrayBuffer = event.target.result;
        const audioContext = new AudioContext();
        audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
            const audio = {
                name: file.name,
                url: URL.createObjectURL(file),
                buffer: audioBuffer,
            };

            // Create a new instance of WaveSurfer
            const waveSurfer = WaveSurfer.create({
                container: "#waveform",
                waveColor: "violet",
                progressColor: "purple",
                plugins: [
                    TimelinePlugin.create({
                        container: "#timeline",
                    }),
                    RegionsPlugin.create({
                        regionsMinLength: 0.5,
                        dragSelection: {
                            slop: 5,
                        },
                        // Use the color property to set the fill color of the region
                        color: getRandomColor,
                    }),
                ],
            });

            // Add event listeners to the WaveSurfer instance
            waveSurfer.on("region-created", (region) => {
                setRegions((prevRegions) => [...prevRegions, region]);
                // console.log("Region created:", region);
                region.update({ color: getRandomColor()() });
                // Perform any necessary processing or actions here
            });

            waveSurfer.on("region-updated", (region) => {
                // Stop playback if a region is currently playing
                if (waveSurfer.isPlaying()) {
                    waveSurfer.pause();
                }
                setRegions((prevRegions) => {
                    const index = prevRegions.findIndex(
                        (r) => r.id === region.id
                    );
                    if (index === -1) return prevRegions;
                    const updatedRegions = [...prevRegions];
                    updatedRegions[index] = region;
                    return updatedRegions;
                });
            });

            waveSurfer.on("region-removed", (region) => {
                setRegions((prevRegions) =>
                    prevRegions.filter((r) => r.id !== region.id)
                );
            });

            waveSurfer.on("finish", function () {
                console.log("finished playing");
                setPlaying(false);
                setIsTranscribing(false);
                handleStopTranscription();
            });

            sliderRef.current.oninput = function () {
                waveSurfer.zoom(Number(this.value));
            };

            console.log("audioBuffer: ", audioBuffer);
            // Load the audio buffer into WaveSurfer
            waveSurfer.loadDecodedBuffer(audioBuffer);

            // Set the WaveSurfer instance to state
            setWaveSurfer(waveSurfer);

            // Set initial playing state to false
            setPlaying(false);
        });
    };

    reader.readAsArrayBuffer(file);
};

export const removeWaveform = (waveSurfer, setWaveSurfer, setRegions) => {
    if (waveSurfer) {
        waveSurfer.destroy();
        setWaveSurfer(null);
        setRegions([]);

        // Remove any residual elements from the container
        const container = document.querySelector("#waveform");
        container.innerHTML = "";
    }
};

export const undo = (
    undoActions,
    regions,
    waveSurfer,
    setRegions,
    redoActions
) => {
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
                    newBuffer.getChannelData(0).set(leftCutBuffer, startOffset);

                    if (numChannels > 1) {
                        newBuffer
                            .getChannelData(1)
                            .set(rightCutBuffer, startOffset);
                    }
                } catch (e) {
                    console.log("Error: ", e);
                    console.log("leftCutBuffer length: ", leftCutBuffer.length);
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

export const redo = (redoActions, regions, waveSurfer, undoActions) => {
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

export const handleDeleteRegion = async (
    region,
    currentRegion,
    waveSurfer,
    setCurrentRegion,
    setUndoActions,
    undoActions
) => {
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

export const handleCutRegion = async (
    region,
    waveSurfer,
    regions,
    setUndoActions,
    undoActions
) => {
    const cutFrom = region.start;
    const cutTo = region.end;
    const originalBuffer = waveSurfer.backend.buffer;
    const rate = originalBuffer.sampleRate;
    const originalDuration = originalBuffer.duration;
    const startOffset = parseInt(cutFrom * rate);
    const endOffset = parseInt(cutTo * rate);

    // Create a new buffer with the same number of channels and sample rate as the original buffer
    const newBuffer = waveSurfer.backend.ac.createBuffer(
        originalBuffer.numberOfChannels,
        originalBuffer.length - (endOffset - startOffset),
        rate
    );

    // Copy the original buffer's data to the new buffer
    for (let i = 0; i < originalBuffer.numberOfChannels; i++) {
        const channelData = originalBuffer.getChannelData(i);

        // Copy the part of the data before the cut
        const leftBuffer = channelData.slice(0, startOffset);
        newBuffer.getChannelData(i).set(leftBuffer);

        // Copy the part of the data after the cut
        const rightBuffer = channelData.slice(endOffset);
        newBuffer.getChannelData(i).set(rightBuffer, startOffset);
    }
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
        const newEnd = reg.end > cutTo ? reg.end - (cutTo - cutFrom) : reg.end;
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

export const handleReplaceImportFunction = (
    region,
    waveSurfer,
    regions,
    setIsReplacing,
    setRedoActions,
    setUndoActions,
    undoActions
) => {
    // Save original buffer state to a variable
    const originalBufferState = waveSurfer.backend.buffer;

    const replaceFrom = region.start;
    const replaceTo = region.end;

    // Check if the selected region is at least 5 seconds long
    if (replaceTo - replaceFrom < 5) {
        alert("Selected region must be at least 5 seconds long.");
        return;
    }

    const originalBuffer = waveSurfer.backend.buffer;
    const rate = originalBuffer.sampleRate;
    const originalDuration = originalBuffer.duration;
    const startOffset = parseInt(replaceFrom * rate);
    const endOffset = parseInt(replaceTo * rate);

    const leftBuffer = originalBuffer.getChannelData(0).slice(0, startOffset);
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
                    const importedLeftBuffer = importedBuffer.getChannelData(0);
                    const importedRightBuffer =
                        importedBuffer.numberOfChannels > 1
                            ? importedBuffer.getChannelData(1)
                            : new Float32Array(importedLeftBuffer.length).fill(
                                  0
                              );

                    const leftEndBuffer = originalBuffer
                        .getChannelData(0)
                        .slice(endOffset);
                    const rightEndBuffer =
                        originalBuffer.numberOfChannels > 1
                            ? originalBuffer.getChannelData(1).slice(endOffset)
                            : new Float32Array(leftEndBuffer.length).fill(0);

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

export const handleReplaceRecordFunction = (
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
) => {
    const replaceFrom = region.start;
    const replaceTo = region.end;

    // Check if the selected region is at least 5 seconds long
    if (replaceTo - replaceFrom < 5) {
        alert("Selected region must be at least 5 seconds long.");
        return;
    }

    const originalBuffer = waveSurfer.backend.buffer;
    const rate = originalBuffer.sampleRate;
    const originalDuration = originalBuffer.duration;
    const startOffset = parseInt(replaceFrom * rate);
    const endOffset = parseInt(replaceTo * rate);

    const leftBuffer = originalBuffer.getChannelData(0).slice(0, startOffset);
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
            const recordedBuffer = await waveSurfer.backend.ac.decodeAudioData(
                arrayBuffer
            );

            // Check if the length of the recorded buffer is longer than the selected region
            const recordedDuration = recordedBuffer.duration;
            const selectedDuration = replaceTo - replaceFrom;
            if (recordedDuration > selectedDuration) {
                alert("Recording is longer than selected region");
                return;
            }

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
                    newChannelData.set(channelData.subarray(0, startOffset));
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

    // Add replace action to undoActions array
    const action = {
        type: "REPLACE_REGION",
        region,

        color: region.color,
        originalBuffer: originalBuffer,
    };
    setUndoActions([...undoActions, action]);
};

export function bufferToWave(abuffer) {
    const numOfChan = abuffer.numberOfChannels;
    const length = abuffer.length * numOfChan * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);

    writeString(view, 0, "RIFF");
    view.setUint32(4, length - 8, true);
    writeString(view, 8, "WAVE");
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numOfChan, true);
    view.setUint32(24, abuffer.sampleRate, true);
    view.setUint32(28, abuffer.sampleRate * 4, true);
    view.setUint16(32, numOfChan * 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, "data");
    view.setUint32(40, length - 44, true);

    floatTo16BitPCM(view, 44, abuffer.getChannelData(0));

    if (numOfChan === 2) {
        floatTo16BitPCM(
            view,
            44 + abuffer.length * 2,
            abuffer.getChannelData(1)
        );
    }

    return new Blob([view], { type: "audio/wav" });
}

function floatTo16BitPCM(output, offset, input) {
    for (let i = 0; i < input.length; i++, offset += 2) {
        const s = Math.max(-1, Math.min(1, input[i]));
        output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
}

function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}
