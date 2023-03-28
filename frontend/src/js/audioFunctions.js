import WaveSurfer from "wavesurfer.js";

import TimelinePlugin from "wavesurfer.js/dist/plugin/wavesurfer.timeline.min.js";

//* RECORDING START BUTTON
export const recordStart = (
    stream,
    setIsRecording,
    mediaRecorder,
    setAudioChunks,
    mimeType
) => {
    setIsRecording(true);

    const media = new MediaRecorder(stream, { type: mimeType });

    mediaRecorder.current = media;

    mediaRecorder.current.start();

    let localAudioChunks = [];

    mediaRecorder.current.ondataavailable = (event) => {
        if (typeof event.data === "undefined") return;

        if (event.data.size === 0) return;

        localAudioChunks.push(event.data);
    };

    setAudioChunks(localAudioChunks);

    console.log("recording start");
};

//*  RECORDING STOP BUTTON
export const recordStop = (
    mediaRecorder,
    setIsRecording,
    audioChunks,
    setAudioURL,
    mimeType
) => {
    setIsRecording(false);

    mediaRecorder.current.stop();

    mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: mimeType });

        console.log("mediaRecorder audioBlob: ", audioBlob);

        const audioUrl = URL.createObjectURL(audioBlob);

        setAudioURL(audioUrl);

        console.log(audioChunks);
    };

    console.log("recording stop");
};

// * IMPORT AUDIO FUNCTION
export const handleLabelClick = (inputRef) => {
    inputRef.current.click();
};

export const handleFileChange = (
    event,
    setAudioChunks,
    setImportedAudioList,
    importedAudioList,
    setWaveSurfer,
    setPlaying
) => {
    const file = event.target.files[0];
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
            setImportedAudioList([...importedAudioList, audio]);

            // Create a new instance of WaveSurfer
            const waveSurfer = WaveSurfer.create({
                container: "#waveform",
                waveColor: "violet",
                progressColor: "purple",
                plugins: [
                    TimelinePlugin.create({
                        container: "#timeline",
                    }),
                ],
            });

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

// * TRIMMING FUNCTION
export const loadAudioBuffer = async (audioBuffer, setAudioBufferSource) => {
    const audioContext = new AudioContext();
    const audioBufferSource = audioContext.createBufferSource();
    audioBufferSource.buffer = audioBuffer;
    audioBufferSource.connect(audioContext.destination);
    setAudioBufferSource(audioBufferSource);
};

export const handleTrimButtonClick = async (
    audioChunks,
    mimeType,
    startTrim,
    endTrim,
    setOriginalAudioDuration,
    loadAudioBuffer
) => {
    console.log(audioChunks);

    const audioBlob = new Blob(audioChunks, { type: mimeType });

    const audioContext = new AudioContext();

    const audioUrl = URL.createObjectURL(audioBlob);

    const audioBuffer = await audioContext.decodeAudioData(
        await fetch(audioUrl).then((response) => response.arrayBuffer())
    );

    console.log(audioBuffer);

    const originalDuration = audioBuffer.duration;

    setOriginalAudioDuration(originalDuration);

    let start = startTrim;

    let end = endTrim;

    console.log("end Trim: ", end);

    if (start < 0) {
        start = 0;
    }

    if (end > originalDuration) {
        end = originalDuration;
    }

    console.log("start Trim: ", start);

    console.log("end Trim: ", end);

    const sampleRate = audioBuffer.sampleRate;

    const numChannels = audioBuffer.numberOfChannels;

    const startFrame = start * sampleRate;

    const endFrame = end * sampleRate;

    const numberOfFrames = endFrame - startFrame;

    const trimmedBuffer = audioContext.createBuffer(
        numChannels,
        numberOfFrames,
        sampleRate
    );

    console.log("numberOfFrames: ", numberOfFrames);

    console.log("trimmedBuffer: ", trimmedBuffer);

    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
        const channelData = audioBuffer.getChannelData(i);
        const trimmedChannelData = new Float32Array(numberOfFrames);
        for (let j = 0; j < numberOfFrames; j++) {
            const index = startFrame + j;
            if (index < channelData.length) {
                trimmedChannelData[j] = channelData[index];
            } else {
                trimmedChannelData[j] = channelData[channelData.length - 1];
            }
        }
        trimmedBuffer.copyToChannel(trimmedChannelData, i, 0);
    }

    await loadAudioBuffer(trimmedBuffer);
};

// * PLAY THE TRIMMED AUDIO FUNCTION
export const handlePlay = (audioBufferSource, setIsPlaying) => {
    if (audioBufferSource) {
        const audioContext = new AudioContext();
        const newAudioBufferSource = audioContext.createBufferSource();
        newAudioBufferSource.buffer = audioBufferSource.buffer;
        newAudioBufferSource.connect(audioContext.destination);
        newAudioBufferSource.start();

        setIsPlaying(true);

        newAudioBufferSource.onended = () => {
            setIsPlaying(false);
        };
    }
};

// * SAVE THE TRIMMED AUDIO FUNCTION
export const handleSave = async (
    audioBufferSource,
    setTrimmedAudioList,
    trimmedAudioList,
    bufferToWave,
    setUndoStack,
    undoStack
) => {
    if (audioBufferSource) {
        const audioContext = new AudioContext();

        const newAudioBufferSource = audioContext.createBufferSource();

        newAudioBufferSource.buffer = audioBufferSource.buffer;

        const audioBlob = bufferToWave(newAudioBufferSource.buffer);

        const audioBlobUrl = URL.createObjectURL(audioBlob);

        const dataURL = audioBlobUrl;

        console.log("dataURL: ", dataURL);

        const trimmedAudio = {
            name: "myTrimmedAudio.mp3", // replace with actual file name
            url: dataURL,
        };

        console.log("trimmedAudio: ", trimmedAudio);

        const newTrimmedAudioList = [...trimmedAudioList, trimmedAudio];

        console.log("newTrimmedAudioList: ", newTrimmedAudioList);

        setTrimmedAudioList((prevState) => {
            setUndoStack([...undoStack, prevState]);
            return newTrimmedAudioList;
        });
        localStorage.setItem(
            "trimmedAudioList",
            JSON.stringify(newTrimmedAudioList)
        );

        console.log("trimmedAudioList: ", trimmedAudioList);
    }
};

// * DELETE THE TRIMMED AUDIO FUNCTION IN THE LIST
export const handleDelete = (
    index,
    trimmedAudioList,
    setTrimmedAudioList,
    setUndoStack,
    undoStack
) => {
    const newList = [...trimmedAudioList];

    newList.splice(index, 1);

    setTrimmedAudioList((prevState) => {
        setUndoStack([...undoStack, prevState]);
        const newList = [...prevState];
        newList.splice(index, 1);
        return newList;
    });

    localStorage.setItem("trimmedAudioList", JSON.stringify(newList));

    console.log(trimmedAudioList);
};

// * UNDO AND REDO FUNCTION
export const handleUndo = (
    setRedoStack,
    redoStack,
    setTrimmedAudioList,
    trimmedAudioList,
    setUndoStack,
    undoStack
) => {
    setRedoStack([...redoStack, trimmedAudioList]);
    setTrimmedAudioList(undoStack.pop());
    setUndoStack([...undoStack]);
};

export const handleRedo = (
    setUndoStack,
    undoStack,
    trimmedAudioList,
    setTrimmedAudioList,
    setRedoStack,
    redoStack
) => {
    setUndoStack([...undoStack, trimmedAudioList]);
    setTrimmedAudioList(redoStack.pop());
    setRedoStack([...redoStack]);
};

// * DOWNLOAD THE TRIMMED AUDIO FUNCTION
export const handleDownload = (audioBufferSource) => {
    if (audioBufferSource) {
        const audioContext = new AudioContext();
        const newAudioBufferSource = audioContext.createBufferSource();
        newAudioBufferSource.buffer = audioBufferSource.buffer;

        const audioBlob = bufferToWave(newAudioBufferSource.buffer);
        const audioBlobUrl = URL.createObjectURL(audioBlob);

        const link = document.createElement("a");
        link.href = audioBlobUrl;
        link.download = "trimmed-audio.wav";
        link.click();

        URL.revokeObjectURL(audioBlobUrl);
    }
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

export function floatTo16BitPCM(output, offset, input) {
    for (let i = 0; i < input.length; i++, offset += 2) {
        const s = Math.max(-1, Math.min(1, input[i]));
        output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
}

export function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

// * MERGE FUNCTION
export const fetchAudio = (urls) => {
    console.log("fetchAudio urls: ", urls);

    const context = new AudioContext();

    return Promise.all(
        urls.map(async (url, index) => {
            console.log(`Fetching audio file ${index + 1}: ${url}`);

            return await fetch(url, {
                responseType: "arraybuffer",
            })
                .then((response) => response.arrayBuffer())
                .then((buffer) => {
                    console.log(`Decoding audio file ${index + 1}: ${url}`);
                    return context.decodeAudioData(buffer);
                })
                .catch((error) => console.error(error));
        })
    );
};

export const handleCheckboxChange = (
    e,
    index,
    selectedAudios,
    setSelectedAudios,
    trimmedAudioList
) => {
    const checked = e.target.checked;

    console.log("checked: ", checked);

    const newSelectedAudios = [...selectedAudios];
    if (checked) {
        newSelectedAudios.push(trimmedAudioList[index]);
    } else {
        const selectedIndex = newSelectedAudios.findIndex(
            (audio) => audio.url === trimmedAudioList[index].url
        );
        if (selectedIndex !== -1) {
            newSelectedAudios.splice(selectedIndex, 1);
        }
    }
    setSelectedAudios(newSelectedAudios);

    console.log("selectedAudios: ", selectedAudios);
};

export const addCheckedPropertyToAudioList = (
    selectedAudios,
    trimmedAudioList
) => {
    return trimmedAudioList.map((audio) => ({
        ...audio,
        checked: selectedAudios.some(
            (selectedAudio) => selectedAudio.url === audio.url
        ),
    }));
};

export const mergeAudio = async (audioBuffers, setMergedAudioUrl) => {
    console.log("mergeAudio audioBuffers: ", audioBuffers);
    const context = new AudioContext();

    const totalLength = audioBuffers.reduce(
        (acc, buffer) => acc + buffer.length,
        0
    );
    console.log("mergeAudio totalLength: ", totalLength);
    const mergedBuffer = context.createBuffer(
        audioBuffers[0].numberOfChannels,
        totalLength,
        audioBuffers[0].sampleRate
    );

    console.log("mergeAudio mergedBuffer: ", mergedBuffer);
    let offset = 0;
    audioBuffers.forEach((buffer) => {
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
            mergedBuffer.copyToChannel(
                buffer.getChannelData(channel),
                channel,
                offset
            );
        }
        offset += buffer.length;
    });

    const mergedBlob = bufferToWave(mergedBuffer);
    console.log("mergeAudio mergedBlob: ", mergedBlob);
    const mergedBlobUrl = URL.createObjectURL(mergedBlob);
    console.log("mergeAudio mergedBlobUrl: ", mergedBlobUrl);

    setMergedAudioUrl(mergedBlobUrl);
};

export const handleMerge = async (
    selectedAudios,
    bufferToWave,
    setMergedAudioUrl,
    mergedAudioUrl
) => {
    console.log("selectedAudios: ", selectedAudios);
    if (selectedAudios.length > 1) {
        try {
            const urls = selectedAudios.map((audio) => audio.url);

            console.log("urls: ", urls);

            const audioBuffers = await fetchAudio(urls);

            console.log("audioBuffers: ", audioBuffers);

            const mergedAudioBuffer = await mergeAudio(
                audioBuffers,
                setMergedAudioUrl
            );

            console.log("mergedAudioBuffer: ", mergedAudioBuffer);

            const mergedAudioBlob = bufferToWave(mergedAudioBuffer);

            console.log("mergedAudioBlob: ", mergedAudioBlob);

            const mergedAudioBlobUrl = URL.createObjectURL(mergedAudioBlob);

            console.log("mergedAudioBlobUrl: ", mergedAudioBlobUrl);

            setMergedAudioUrl(mergedAudioBlobUrl);

            console.log("mergedAudioUrl: ", mergedAudioUrl);
        } catch (error) {
            console.error(error);
        }
    } else {
        console.log("Select at least 2 audios to merge.");
    }
};
