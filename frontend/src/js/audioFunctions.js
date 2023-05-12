import WaveSurfer from "wavesurfer.js";

import TimelinePlugin from "wavesurfer.js/dist/plugin/wavesurfer.timeline.min.js";

import RegionsPlugin from "wavesurfer.js/dist/plugin/wavesurfer.regions.min.js";

// *Function for automatically saving the audio after recording/importing/editing of audio in the waveform
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

// * Function for accessing the IndexedDB for every logged in user
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

// *Function for loading the audio saved in the IndexedDB to the waveform in the client side
export const loadAudioFromIndexedDB = (
    setWaveSurfer,
    setPlaying,
    setRegions,
    sliderRef,
    userId,
    setAudioFile
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
                        regionsMinLength: 1,
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
            });

            sliderRef.current.oninput = function () {
                waveSurfer.zoom(Number(this.value));
            };

            // Load the audio buffer into WaveSurfer
            waveSurfer.loadBlob(audioFile);
            console.log("waveSurfer: ", waveSurfer);

            // Set the WaveSurfer instance to state
            setWaveSurfer(waveSurfer);

            setAudioFile(audioFile);

            // Set initial playing state to false
            setPlaying(false);
            console.log("load called");
        };
    };
};

//* RECORDING START FUNCTION
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

//* RECORDING STOP FUNCTION
export const recordStop = (
    mediaRecorder,
    setIsRecording,
    audioChunks,
    mimeType,
    setWaveSurfer,
    setPlaying,
    sliderRef,
    setRegions
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
                            regionsMinLength: 1,
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

// * IMPORT AUDIO BUTTON CLICK FUNCTION
export const handleLabelClick = (inputRef) => {
    inputRef.current.click();
};

// * Function for generating random color for the regions created in the waveform
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

// * IMPORT AUDIO FUNCTION
export const handleFileChange = (
    event,
    setAudioChunks,
    setWaveSurfer,
    setPlaying,
    sliderRef,
    setRegions
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
                        regionsMinLength: 1,
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

//* TRANSCRIBE AUDIO FUNCTION
export const transcribeAudio = async (
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
) => {
    const transcriptDivToClear = document.getElementById("transcript");
    transcriptDivToClear.innerHTML = ""; // Remove all the child elements of transcriptDiv
    setTranscription(null); // Reset the transcription state to null
    setTimestamps([]); // Reset the timestamps state to an empty array

    setIsTranscribing(true);
    // Create a FormData object with the audio file
    const formData = new FormData();

    console.log("transcribe audioFile: ", audioFile);
    formData.append("audio", audioFile);

    // Send a POST request to the /transcribe endpoint on the backend
    const response = await fetch("/api/speech-to-text", {
        method: "POST",
        body: formData,
    });

    // Get the result as JSON
    const result = await response.json();
    console.log("result: ", result);

    // Set the transcription and timestamps in the state
    setTranscription(result.transcription);
    setTimestamps(result.timestamps);
    setIsTranscribing(false);
    const transcriptDiv = document.getElementById("transcript");
    const words = result.transcription.split(" "); // split the transcription into words

    let openRegionId = null; // Track the ID of the currently open word

    words.forEach((word, index) => {
        const wordSpan = document.createElement("span");
        wordSpan.textContent = word + " "; // add space after each word to separate them

        // set data attribute with region id
        const regionId = `region-${index}`;
        wordSpan.setAttribute("data-region-id", regionId);

        // set up event listener to trigger corresponding region

        wordSpan.addEventListener("click", function handleClick() {
            setTranscriptWordOpen(true);

            let start = result.timestamps[index].start;
            let end = result.timestamps[index].end;
            if (end - start !== 1) {
                end = start + 1;
            }
            // trigger region with start and end timestamps
            console.log("start: ", start);
            console.log("end: ", end);

            if (openRegionId !== null) {
                // Close the previously open word
                const previousRegion = waveSurfer.regions.list[openRegionId];
                if (previousRegion) {
                    handleDeleteRegion(
                        previousRegion,
                        currentRegion,
                        waveSurfer,
                        setCurrentRegion,
                        setUndoActions,
                        undoActions
                    );
                }
            }

            openRegionId = regionId; // Update the openRegionId with the new word's region ID

            const region = waveSurfer.addRegion({
                start: start,
                end: end,
                color: "rgba(255, 0, 0, 0.3)",
                id: regionId,
            });

            waveSurfer.on("region-updated", (region) => {
                const newEnd = region.end;
                setTimestamps((timestamps) => {
                    const newTimestamps = [...timestamps];
                    newTimestamps[index].end = newEnd;
                    return newTimestamps;
                });
                console.log("newEnd: ", newEnd);

                const newStart = region.start;
                setTimestamps((timestamps) => {
                    const newTimestamps = [...timestamps];
                    newTimestamps[index].start = newStart;
                    return newTimestamps;
                });
                console.log("newStart: ", newStart);
            });

            // style the clicked word with a background color
            wordSpan.style.backgroundColor = region.color;

            // add edit button to word span
            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.classList.add("edit-button");
            editButton.addEventListener("click", (event) => {
                event.stopPropagation(); // prevent click event from triggering word click event
                const currentWord = wordSpan.textContent.split(" ", 1);
                const input = document.createElement("input");
                input.type = "text";
                input.value = currentWord;
                input.addEventListener("blur", () => {
                    const editedWord = input.value.trim();
                    if (editedWord !== currentWord) {
                        const newTranscription = result.transcription.replace(
                            currentWord,
                            editedWord
                        );
                        setTranscription(newTranscription);
                        wordSpan.textContent = editedWord + " ";
                        wordSpan.appendChild(editButton);
                        wordSpan.appendChild(replaceButton);
                        wordSpan.appendChild(deleteButton);
                        wordSpan.appendChild(closeButton);
                    }
                    transcriptDiv.replaceChild(wordSpan, input);
                });
                transcriptDiv.replaceChild(input, wordSpan);
            });
            wordSpan.appendChild(editButton);

            // add replace button to word span
            const replaceButton = document.createElement("button");
            replaceButton.textContent = "Replace";
            replaceButton.classList.add("replace-button");
            replaceButton.addEventListener("click", (event) => {
                event.stopPropagation(); // prevent click event from triggering word click event
                const region = waveSurfer.regions.list[regionId];
                if (region) {
                    navigator.mediaDevices
                        .getUserMedia({ audio: true })
                        .then((stream) => {
                            handleReplaceRecordFunctionUsingTrancript(
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
                        })
                        .catch((error) => {
                            console.error("error ", error);
                        });
                }
            });
            wordSpan.appendChild(replaceButton);

            // add delete button to word span
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Cut";
            deleteButton.classList.add("delete-button");
            deleteButton.addEventListener("click", (event) => {
                event.stopPropagation(); // prevent click event from triggering word click event
                const region = waveSurfer.regions.list[regionId];
                if (region) {
                    handleCutRegion(
                        region,
                        waveSurfer,
                        regions,
                        setUndoActions,
                        undoActions,
                        setAudioFile
                    );
                }
            });
            wordSpan.appendChild(deleteButton);

            // add close button to word span
            const closeButton = document.createElement("button");
            closeButton.textContent = "Close";
            closeButton.classList.add("close-button");
            closeButton.addEventListener("click", (event) => {
                event.stopPropagation(); // prevent click event from triggering word click event
                const region = waveSurfer.regions.list[regionId];
                if (region) {
                    handleDeleteRegion(
                        region,
                        currentRegion,
                        waveSurfer,
                        setCurrentRegion,
                        setUndoActions,
                        undoActions
                    );
                }
            });
            wordSpan.appendChild(closeButton);

            if (transcriptWordOpen) {
                wordSpan.removeEventListener("click", handleClick);
            }
        });

        transcriptDiv.appendChild(wordSpan); // add word element to transcript container
    });
};

//* REMOVE WAVEFORM FUNCTION
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

//* UNDO FUNCTION
export const undo = (
    undoActions,
    regions,
    waveSurfer,
    setRegions,
    redoActions,
    setAudioFile
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

                // Restore background color of corresponding word
                const word = document.querySelector(
                    `[data-region-id="${lastAction.region.id}"]`
                );
                if (word) {
                    word.style.backgroundColor = lastAction.wordBgColor;
                    word.appendChild(lastAction.editButton);
                    word.appendChild(lastAction.replaceButton);
                    word.appendChild(lastAction.deleteButton);
                    word.appendChild(lastAction.closeButton);
                }

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

                const audioBlob = bufferToWave(newBuffer);

                saveAudioToIndexedDB(audioBlob);

                setAudioFile(audioBlob);

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

                // Restore background color of corresponding word
                const wordCut = document.querySelector(
                    `[data-region-id="${lastAction.region.id}"]`
                );
                if (wordCut) {
                    wordCut.textContent = lastAction.wordContent + " ";
                    wordCut.style.backgroundColor = lastAction.wordBgColor;
                    wordCut.appendChild(lastAction.editButton);
                    wordCut.appendChild(lastAction.replaceButton);
                    wordCut.appendChild(lastAction.deleteButton);
                    wordCut.appendChild(lastAction.closeButton);
                }

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

                const replaceAudioBlob = bufferToWave(replaceOriginalBuffer);

                saveAudioToIndexedDB(replaceAudioBlob);

                setAudioFile(replaceAudioBlob);

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

                // Restore original color of region
                waveSurfer.regions.list[lastAction.region.id].update({
                    color: lastAction.color,
                });

                // Restore background color of corresponding word
                const wordReplace = document.querySelector(
                    `[data-region-id="${lastAction.region.id}"]`
                );
                if (wordReplace) {
                    wordReplace.textContent = lastAction.wordContent + " ";
                    wordReplace.style.backgroundColor = lastAction.wordBgColor;
                    wordReplace.appendChild(lastAction.editButton);
                    wordReplace.appendChild(lastAction.replaceButton);
                    wordReplace.appendChild(lastAction.deleteButton);
                    wordReplace.appendChild(lastAction.closeButton);
                }

                break;

            default:
                break;
        }
    }
};

// * REDO FUNCTION
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

                // Restore background color of corresponding word
                const word = document.querySelector(
                    `[data-region-id="${lastAction.region.id}"]`
                );
                const deleteButton = document.querySelector(".delete-button");
                const editButton = document.querySelector(".edit-button");
                const replaceButton = document.querySelector(".replace-button");
                const closeButton = document.querySelector(".close-button");
                if (word) {
                    word.style.backgroundColor = "";
                    word.removeChild(deleteButton);
                    word.removeChild(editButton);
                    word.removeChild(replaceButton);
                    word.removeChild(closeButton);
                }

                break;
            default:
                break;
        }

        undoActions.push(lastAction);
    }
};

// * DELETE REGION IN THE WAVEFORM FUNCTION
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

    // Store previous background color of corresponding word
    const word = document.querySelector(`[data-region-id="${region.id}"]`);
    const wordBgColor = word
        ? window.getComputedStyle(word).backgroundColor
        : "";

    await waveSurfer.regions.list[region.id].remove();

    const deleteButton = document.querySelector(".delete-button");
    const editButton = document.querySelector(".edit-button");
    const replaceButton = document.querySelector(".replace-button");
    const closeButton = document.querySelector(".close-button");
    // reset background color of corresponding word
    if (word) {
        word.style.backgroundColor = "";
        word.removeChild(deleteButton);
        word.removeChild(editButton);
        word.removeChild(replaceButton);
        word.removeChild(closeButton);
    }
    // Add delete action to undoActions array
    const action = {
        type: "DELETE_REGION",
        region,
        color: originalColor,
        wordBgColor,
        deleteButton,
        editButton,
        replaceButton,
        closeButton,
    };
    setUndoActions([...undoActions, action]);
};

// * CUT REGION IN THE WAVEFORM FUNCTION
export const handleCutRegion = async (
    region,
    waveSurfer,
    regions,
    setUndoActions,
    undoActions,
    setAudioFile
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

    const audioBlob = bufferToWave(newBuffer);

    saveAudioToIndexedDB(audioBlob);

    setAudioFile(audioBlob);

    // Store previous background color of corresponding word
    const word = document.querySelector(`[data-region-id="${region.id}"]`);
    const wordContent = word ? word.textContent.split(" ", 1) : "";
    const wordBgColor = word
        ? window.getComputedStyle(word).backgroundColor
        : "";

    const deleteButton = document.querySelector(".delete-button");
    const editButton = document.querySelector(".edit-button");
    const replaceButton = document.querySelector(".replace-button");
    const closeButton = document.querySelector(".close-button");
    // reset background color of corresponding word
    if (word) {
        word.textContent = "";
    }

    // Add cut action to undoActions array
    const action = {
        type: "CUT_REGION",
        region,
        index,
        color: region.color,
        originalBuffer: originalBuffer,
        wordContent,
        wordBgColor,
        deleteButton,
        editButton,
        replaceButton,
        closeButton,
    };
    setUndoActions([...undoActions, action]);
};

// * REPLACE REGION IN THE WAVEFORM WITH IMPORTED AUDIO FUNCTION
export const handleReplaceImportFunction = (
    region,
    waveSurfer,
    regions,
    setIsReplacing,
    setRedoActions,
    setUndoActions,
    undoActions,
    setAudioFile
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

                    const audioBlob = bufferToWave(newBuffer);

                    saveAudioToIndexedDB(audioBlob);

                    setAudioFile(audioBlob);

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

// * REPLACE REGION IN THE WAVEFORM WITH RECORDED AUDIO FUNCTION
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
    undoActions,
    setAudioFile
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

            const audioBlob = bufferToWave(newBuffer);

            saveAudioToIndexedDB(audioBlob);

            setAudioFile(audioBlob);

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

        console.log(mediaRecorder);
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

// * REPLACE REGION IN THE WAVEFORM WITH RECORDED AUDIO THROUGH THE TRANSCRIPT FUNCTION
export const handleReplaceRecordFunctionUsingTrancript = (
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
) => {
    const replaceFrom = region.start;
    const replaceTo = region.end;

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

            const audioBlob = bufferToWave(newBuffer);

            saveAudioToIndexedDB(audioBlob);

            setAudioFile(audioBlob);

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

        console.log(mediaRecorder);

        // Pass the newMediaRecorder state variable to handleReplaceRecordStop function
        const stopRecording = () => handleReplaceRecordStop(mediaRecorder);

        setTimeout(() => {
            stopRecording();
            setIsReplaceRecording(false);
        }, 1000);
    }

    console.log("replace record start");

    // Store previous background color of corresponding word
    const word = document.querySelector(`[data-region-id="${region.id}"]`);
    const wordContent = word ? word.textContent.split(" ", 1) : "";
    const wordBgColor = word
        ? window.getComputedStyle(word).backgroundColor
        : "";

    const deleteButton = document.querySelector(".delete-button");
    const editButton = document.querySelector(".edit-button");
    const replaceButton = document.querySelector(".replace-button");
    const closeButton = document.querySelector(".close-button");
    // reset background color of corresponding word
    if (word) {
        word.textContent = "";
    }

    // Add replace action to undoActions array
    const action = {
        type: "REPLACE_REGION",
        region,
        color: region.color,
        originalBuffer: originalBuffer,
        wordContent,
        wordBgColor,
        deleteButton,
        editButton,
        replaceButton,
        closeButton,
    };
    setUndoActions([...undoActions, action]);
};

// * REPLACE REGION IN THE WAVEFORM WITH RECORDED AUDIO STOP FUNCTION
export const handleReplaceRecordStop = (newMediaRecorder) => {
    newMediaRecorder.stop();
};

// * Function for converting audio buffer to WAV file type
export function bufferToWave(abuffer) {
    var numOfChan = abuffer.numberOfChannels,
        length = abuffer.length * numOfChan * 2 + 44,
        buffer = new ArrayBuffer(length),
        view = new DataView(buffer),
        channels = [],
        i,
        sample,
        offset = 0,
        pos = 0;

    // write WAVE header
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"

    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit (hardcoded in this demo)

    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length

    // write interleaved data
    for (i = 0; i < abuffer.numberOfChannels; i++)
        channels.push(abuffer.getChannelData(i));
    while (pos < length) {
        for (i = 0; i < numOfChan; i++) {
            // interleave channels
            sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // convert to 16-bit integer
            view.setInt16(pos, sample, true); // write 16-bit sample
            pos += 2;
        }
        offset++; // next source sample
    }

    // helper functions
    function setUint16(data) {
        view.setUint16(pos, data, true);
        pos += 2;
    }

    function setUint32(data) {
        view.setUint32(pos, data, true);
        pos += 4;
    }

    return new Blob([buffer], { type: "audio/wav" });
}
