import WaveSurfer from "wavesurfer.js";

import TimelinePlugin from "wavesurfer.js/dist/plugin/wavesurfer.timeline.min.js";

import RegionsPlugin from "wavesurfer.js/dist/plugin/wavesurfer.regions.min.js";

import RecordRTC from "recordrtc";

export const saveAudioToIndexedDB = async (audioBlob) => {
    const userId = JSON.parse(localStorage.getItem("user")).id;
    const db = await openDatabase(userId);
    const tx = db.transaction("audio", "readwrite");
    const store = tx.objectStore("audio");
    const id = "audio-to-edit";
    store.put(audioBlob, id);
    await tx.complete;
};

export const openDatabase = (userId) => {
    return new Promise((resolve, reject) => {
        const request = window.indexedDB.open(`myDatabase-${userId}`, 2);
        request.onerror = () => {
            reject();
        };
        request.onsuccess = () => {
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
    setAudioFile
) => {
    const request = indexedDB.open(`myDatabase-${userId}`);

    request.onerror = (event) => {
        console.log("Error opening database:", event.target.error);
    };

    request.onsuccess = (event) => {
        const db = event.target.result;

        const transaction = db.transaction(["audio"], "readonly");
        const objectStore = transaction.objectStore("audio");
        const request = objectStore.get("audio-to-edit");

        request.onsuccess = (event) => {
            const audioFile = event.target.result;

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
                        color: getRandomColor,
                    }),
                ],
            });

            waveSurfer.on("region-created", (region) => {
                setRegions((prevRegions) => [...prevRegions, region]);
                region.update({ color: getRandomColor()() });
            });

            waveSurfer.on("region-updated", (region) => {
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
                setPlaying(false);
            });

            sliderRef.current.oninput = function () {
                waveSurfer.zoom(Number(this.value));
            };

            waveSurfer.loadBlob(audioFile);

            setWaveSurfer(waveSurfer);

            setAudioFile(audioFile);

            setPlaying(false);
        };
    };
};

export const recordStart = (recorderRef, setIsRecording, mimeType) => {
    setIsRecording(true);

    navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
            const options = {
                type: "audio",
                mimeType: mimeType,
                recorderType: RecordRTC.StereoAudioRecorder,
                numberOfAudioChannels: 1,
                desiredSampRate: 48000,
            };
            const recorder = RecordRTC(stream, options);
            recorderRef.current = recorder;
            recorder.startRecording();
        })
        .catch((error) => {
            console.error("Error accessing media devices:", error);
        });
};

export const recordStop = (
    recorderRef,
    setRecordedBlob,
    setIsRecording,
    setWaveSurfer,
    setPlaying,
    setRegions,
    setAudioFile
) => {
    setIsRecording(false);

    const recorder = recorderRef.current;

    if (recorder) {
        recorder.stopRecording(() => {
            const blob = recorder.getBlob();
            setRecordedBlob(blob);
            saveAudioToIndexedDB(blob);
            setAudioFile(blob);

            const reader = new FileReader();
            reader.onload = (event) => {
                const arrayBuffer = event.target.result;
                const audioContext = new AudioContext();
                audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
                    const audio = {
                        name: "Recorded Audio",
                        url: URL.createObjectURL(blob),
                        buffer: audioBuffer,
                    };
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
                                color: getRandomColor,
                            }),
                        ],
                    });

                    waveSurfer.on("region-created", (region) => {
                        setRegions((prevRegions) => [...prevRegions, region]);
                        region.update({ color: getRandomColor()() });
                    });

                    waveSurfer.on("region-updated", (region) => {
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
                        setPlaying(false);
                    });

                    waveSurfer.loadDecodedBuffer(audioBuffer);

                    setWaveSurfer(waveSurfer);

                    setPlaying(false);
                });
            };
            reader.readAsArrayBuffer(blob);
        });
    }
};

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
    setRegions
) => {
    const file = event.target.files[0];

    if (!file.type.startsWith("audio/")) {
        alert("Please select an audio file");
        return;
    }

    const audio = document.createElement("audio");
    audio.src = URL.createObjectURL(file);

    audio.addEventListener("loadedmetadata", function () {
        const duration = audio.duration;
        URL.revokeObjectURL(audio.src);
        if (duration > 60) {
            alert("Audio duration exceeds the maximum limit of 60 seconds.");
            return;
        } else {
            const reader = new FileReader();
            reader.onload = (event) => {
                const audioBlob = new Blob([event.target.result], {
                    type: file.type,
                });
                setAudioChunks([audioBlob]);

                const arrayBuffer = event.target.result;
                const audioContext = new AudioContext();
                audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
                    const audio = {
                        name: file.name,
                        url: URL.createObjectURL(file),
                        buffer: audioBuffer,
                    };

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
                                color: getRandomColor,
                            }),
                        ],
                    });

                    waveSurfer.on("region-created", (region) => {
                        setRegions((prevRegions) => [...prevRegions, region]);
                        region.update({ color: getRandomColor()() });
                    });

                    waveSurfer.on("region-updated", (region) => {
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
                        setPlaying(false);
                    });

                    sliderRef.current.oninput = function () {
                        waveSurfer.zoom(Number(this.value));
                    };

                    waveSurfer.loadDecodedBuffer(audioBuffer);
                    const audioBlob = bufferToWave(audioBuffer);

                    saveAudioToIndexedDB(audioBlob);

                    setWaveSurfer(waveSurfer);

                    setPlaying(false);
                });
            };

            reader.readAsArrayBuffer(file);
        }
    });
};

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
    transcriptDivToClear.innerHTML = "";
    setTranscription(null);
    setTimestamps([]);

    const audio = document.createElement("audio");
    audio.src = URL.createObjectURL(audioFile);

    audio.addEventListener("loadedmetadata", async () => {
        const duration = audio.duration;
        URL.revokeObjectURL(audio.src);
        if (duration > 60) {
            alert(
                "You can only transcribe an audio less than 60 seconds. Edit your audio and try again. Thank you!"
            );
            return;
        } else {
            setIsTranscribing(true);
            const formData = new FormData();

            formData.append("audio", audioFile);

            const response = await fetch("/api/speech-to-text", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            setTranscription(result.transcription);
            setTimestamps(result.timestamps);
            setIsTranscribing(false);
            const transcriptDiv = document.getElementById("transcript");
            const words = result.transcription.split(" ");

            let openRegionId = null;

            words.forEach((word, index) => {
                const wordSpan = document.createElement("span");
                wordSpan.textContent = word + " ";

                const regionId = `region-${index}`;
                wordSpan.setAttribute("data-region-id", regionId);

                wordSpan.addEventListener("click", function handleClick() {
                    setTranscriptWordOpen(true);

                    let start = result.timestamps[index].start;
                    let end = result.timestamps[index].end;
                    if (end - start !== 1) {
                        end = start + 1;
                    }

                    if (openRegionId !== null) {
                        const previousRegion =
                            waveSurfer.regions.list[openRegionId];
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

                    openRegionId = regionId;
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

                        const newStart = region.start;
                        setTimestamps((timestamps) => {
                            const newTimestamps = [...timestamps];
                            newTimestamps[index].start = newStart;
                            return newTimestamps;
                        });
                    });

                    wordSpan.style.backgroundColor = region.color;

                    const editButton = document.createElement("button");
                    editButton.textContent = "Edit";
                    editButton.classList.add("edit-button");
                    editButton.addEventListener("click", (event) => {
                        event.stopPropagation();
                        const currentWord = wordSpan.textContent.split(" ", 1);
                        const input = document.createElement("input");
                        input.type = "text";
                        input.value = currentWord;
                        input.addEventListener("blur", () => {
                            const editedWord = input.value.trim();
                            if (editedWord !== currentWord) {
                                const newTranscription =
                                    result.transcription.replace(
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

                    const replaceButton = document.createElement("button");
                    replaceButton.textContent = "Replace";
                    replaceButton.classList.add("replace-button");
                    replaceButton.addEventListener("click", (event) => {
                        event.stopPropagation();
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

                    const deleteButton = document.createElement("button");
                    deleteButton.textContent = "Cut";
                    deleteButton.classList.add("delete-button");
                    deleteButton.addEventListener("click", (event) => {
                        event.stopPropagation();
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

                    const closeButton = document.createElement("button");
                    closeButton.textContent = "Close";
                    closeButton.classList.add("close-button");
                    closeButton.addEventListener("click", (event) => {
                        event.stopPropagation();
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

                transcriptDiv.appendChild(wordSpan);
            });
        }
    });
};

export const removeWaveform = (waveSurfer, setWaveSurfer, setRegions) => {
    if (waveSurfer) {
        waveSurfer.destroy();
        setWaveSurfer(null);
        setRegions([]);

        const container = document.querySelector("#waveform");
        container.innerHTML = "";
    }
};

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
                regions.splice(lastAction.index, 0, lastAction.region);
                waveSurfer.addRegion(lastAction.region);

                waveSurfer.regions.list[lastAction.region.id].update({
                    color: lastAction.color,
                });

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

                setRegions(
                    regions.map((region) => ({ ...region, key: region.id }))
                );
                break;

            case "CUT_REGION":
                const originalBuffer = lastAction.originalBuffer;

                waveSurfer.backend.buffer = originalBuffer;

                const numChannels = originalBuffer.numberOfChannels;

                const newBuffer = waveSurfer.backend.ac.createBuffer(
                    numChannels,
                    originalBuffer.length,
                    originalBuffer.sampleRate
                );

                const leftChannel = originalBuffer.getChannelData(0);
                const rightChannel =
                    originalBuffer.numberOfChannels > 1
                        ? originalBuffer.getChannelData(1)
                        : new Float32Array(leftChannel.length).fill(0);

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

                const cutRegion = lastAction.region;

                const startOffset = parseInt(
                    cutRegion.start * originalBuffer.sampleRate
                );
                const endOffset = parseInt(
                    cutRegion.end * originalBuffer.sampleRate
                );

                const leftCutBuffer = originalBuffer
                    .getChannelData(0)
                    .slice(startOffset, endOffset);
                const rightCutBuffer =
                    originalBuffer.numberOfChannels > 1
                        ? originalBuffer
                              .getChannelData(1)
                              .slice(startOffset, endOffset)
                        : new Float32Array(leftCutBuffer.length).fill(0);

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

                waveSurfer.regions.list[lastAction.region.id].update({
                    color: lastAction.color,
                });

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
                const replaceOriginalBuffer = lastAction.originalBuffer;

                const originalRegion = lastAction.originalRegion;

                // Restore original buffer
                waveSurfer.backend.buffer = replaceOriginalBuffer;

                const replaceAudioBlob = bufferToWave(replaceOriginalBuffer);

                saveAudioToIndexedDB(replaceAudioBlob);

                setAudioFile(replaceAudioBlob);

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

                waveSurfer.regions.list[lastAction.region.id].update({
                    color: lastAction.color,
                });

                waveSurfer.regions.list[lastAction.region.id].update({
                    color: lastAction.color,
                });

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

export const redo = (redoActions, regions, waveSurfer, undoActions) => {
    if (redoActions.length > 0) {
        const lastAction = redoActions.pop();

        switch (lastAction.type) {
            case "DELETE_REGION":
                const index = regions.findIndex(
                    (reg) => reg.id === lastAction.region.id
                );
                regions.splice(index, 1);
                waveSurfer.regions.list[lastAction.region.id].remove();

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

export const handleDeleteRegion = async (
    region,
    currentRegion,
    waveSurfer,
    setCurrentRegion,
    setUndoActions,
    undoActions
) => {
    const originalColor = region.color;

    if (currentRegion && currentRegion.id === region.id) {
        waveSurfer.pause();
        setCurrentRegion(null);
    }

    const word = document.querySelector(`[data-region-id="${region.id}"]`);
    const wordBgColor = word
        ? window.getComputedStyle(word).backgroundColor
        : "";

    await waveSurfer.regions.list[region.id].remove();

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

    const newBuffer = waveSurfer.backend.ac.createBuffer(
        originalBuffer.numberOfChannels,
        originalBuffer.length - (endOffset - startOffset),
        rate
    );

    for (let i = 0; i < originalBuffer.numberOfChannels; i++) {
        const channelData = originalBuffer.getChannelData(i);

        const leftBuffer = channelData.slice(0, startOffset);
        newBuffer.getChannelData(i).set(leftBuffer);

        const rightBuffer = channelData.slice(endOffset);
        newBuffer.getChannelData(i).set(rightBuffer, startOffset);
    }
    waveSurfer.backend.buffer = newBuffer;

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

    if (audioBlob) {
        alert("Cut Region Successful!");
    }

    const word = document.querySelector(`[data-region-id="${region.id}"]`);
    const wordContent = word ? word.textContent.split(" ", 1) : "";
    const wordBgColor = word
        ? window.getComputedStyle(word).backgroundColor
        : "";

    const deleteButton = document.querySelector(".delete-button");
    const editButton = document.querySelector(".edit-button");
    const replaceButton = document.querySelector(".replace-button");
    const closeButton = document.querySelector(".close-button");
    if (word) {
        word.textContent = "";
    }

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
    const originalBufferState = waveSurfer.backend.buffer;

    const replaceFrom = region.start;
    const replaceTo = region.end;

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

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "audio/*";
    fileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];

        const reader = new FileReader();
        reader.onload = (event) => {
            const importedAudio = event.target.result;

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

                    if (audioBlob) {
                        alert("Replace Region Successful!");
                    }

                    const index = regions.findIndex(
                        (reg) => reg.id === region.id
                    );
                    regions.splice(index, 1);
                    waveSurfer.regions.list[region.id].remove();

                    waveSurfer.drawBuffer();
                    waveSurfer.clearRegions();

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

                    fileInput.value = "";
                }
            );
        };
        reader.readAsArrayBuffer(file);
    });
    fileInput.click();

    setIsReplacing(false);

    setRedoActions([]);

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
    undoActions,
    setAudioFile
) => {
    const replaceFrom = region.start;
    const replaceTo = region.end;

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
            const blob = new Blob(chunks, {
                type: "audio/ogg; codecs=opus",
            });
            const arrayBuffer = await blob.arrayBuffer();
            const recordedBuffer = await waveSurfer.backend.ac.decodeAudioData(
                arrayBuffer
            );

            const recordedDuration = recordedBuffer.duration;
            const selectedDuration = replaceTo - replaceFrom;
            if (recordedDuration > selectedDuration) {
                alert("Recording is longer than selected region");
                return;
            }

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

            if (audioBlob) {
                alert("Replace Region Successful!");
            }

            const index = regions.findIndex((reg) => reg.id === region.id);
            regions.splice(index, 1);
            waveSurfer.regions.list[region.id].remove();

            waveSurfer.drawBuffer();
            waveSurfer.clearRegions();

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

            setRedoActions([]);
        });
        mediaRecorder.start();
        setIsReplaceRecording(true);

        setNewMediaRecorder(mediaRecorder);
    }

    const action = {
        type: "REPLACE_REGION",
        region,

        color: region.color,
        originalBuffer: originalBuffer,
    };
    setUndoActions([...undoActions, action]);
};

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
            const blob = new Blob(chunks, {
                type: "audio/ogg; codecs=opus",
            });
            const arrayBuffer = await blob.arrayBuffer();
            const recordedBuffer = await waveSurfer.backend.ac.decodeAudioData(
                arrayBuffer
            );

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

            if (audioBlob) {
                alert("Replace Region Successful!");
            }

            const index = regions.findIndex((reg) => reg.id === region.id);
            regions.splice(index, 1);
            waveSurfer.regions.list[region.id].remove();

            waveSurfer.drawBuffer();
            waveSurfer.clearRegions();

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

            setRedoActions([]);
        });
        mediaRecorder.start();
        setIsReplaceRecording(true);

        const stopRecording = () => handleReplaceRecordStop(mediaRecorder);

        setTimeout(() => {
            stopRecording();
            setIsReplaceRecording(false);
        }, 1000);
    }

    const word = document.querySelector(`[data-region-id="${region.id}"]`);
    const wordContent = word ? word.textContent.split(" ", 1) : "";
    const wordBgColor = word
        ? window.getComputedStyle(word).backgroundColor
        : "";

    const deleteButton = document.querySelector(".delete-button");
    const editButton = document.querySelector(".edit-button");
    const replaceButton = document.querySelector(".replace-button");
    const closeButton = document.querySelector(".close-button");
    if (word) {
        word.textContent = "";
    }

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

export const handleReplaceRecordStop = (newMediaRecorder) => {
    newMediaRecorder.stop();
};

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

    setUint32(0x46464952);
    setUint32(length - 8);
    setUint32(0x45564157);

    setUint32(0x20746d66);
    setUint32(16);
    setUint16(1);
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16);

    setUint32(0x61746164);
    setUint32(length - pos - 4);

    for (i = 0; i < abuffer.numberOfChannels; i++)
        channels.push(abuffer.getChannelData(i));
    while (pos < length) {
        for (i = 0; i < numOfChan; i++) {
            sample = Math.max(-1, Math.min(1, channels[i][offset]));
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
            view.setInt16(pos, sample, true);
            pos += 2;
        }
        offset++;
    }

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
