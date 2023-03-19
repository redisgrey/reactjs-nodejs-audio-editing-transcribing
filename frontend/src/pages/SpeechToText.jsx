import { useState, useRef, useEffect } from "react";

import { BsFillPlayFill, BsFillStopFill, BsDownload } from "react-icons/bs";

import { RxReset } from "react-icons/rx";

import NotFound from "./NotFound";

import SpeechRecognition, {
    useSpeechRecognition,
} from "react-speech-recognition";

import Uploader from "../components/Uploader";

const mimeType = "audio/mpeg";

function SpeechToText() {
    //* INITIALIZING THE SPEECHRECOGNITION API
    const {
        transcript,
        resetTranscript,
        browserSupportsSpeechRecognition,
        isMicrophoneAvailable,
    } = useSpeechRecognition();

    const [isListening, setIsListening] = useState(false);

    const [isRecording, setIsRecording] = useState(false);

    //* INTIALIZING THE MEDIARECORDER API
    const mediaRecorder = useRef(null);

    const [stream, setStream] = useState(null);

    const [audioChunks, setAudioChunks] = useState([]);

    const [audioURL, setAudioURL] = useState(null);

    // * TRIM FUNCTION
    const [originalAudioDuration, setOriginalAudioDuration] = useState(0);

    const [startTrim, setStartTrim] = useState(0);

    const [endTrim, setEndTrim] = useState(100);

    const [audioBufferSource, setAudioBufferSource] = useState(null);

    const [isPlaying, setIsPlaying] = useState(false);

    const [trimmedAudioList, setTrimmedAudioList] = useState([]);

    useEffect(() => {
        const savedTrimmedAudioList = localStorage.getItem("trimmedAudioList");
        if (savedTrimmedAudioList) {
            setTrimmedAudioList(JSON.parse(savedTrimmedAudioList));
        }
    }, []);

    if (!browserSupportsSpeechRecognition) {
        return (
            <NotFound
                title={"Not Supported"}
                body={"Browser doesn't support speech recognition."}
                status="405"
            />
        );
    }

    if (!isMicrophoneAvailable) {
        return (
            <NotFound
                title={"Microphone Access Denied"}
                body={"Please allow access to the microphone to continue."}
                status="403"
            />
        );
    }

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

    //* TRANSCRIBING START BUTTON
    const start = () => {
        setIsListening(true);
        SpeechRecognition.startListening({
            continuous: true,
        });
    };

    //* RECORDING START BUTTON
    const recordStart = () => {
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

    //* TRANSCRIBING STOP BUTTON
    const stop = () => {
        setIsListening(false);
        SpeechRecognition.stopListening();
    };

    //*  RECORDING STOP BUTTON
    const recordStop = () => {
        setIsRecording(false);

        mediaRecorder.current.stop();

        mediaRecorder.current.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: mimeType });

            const audioUrl = URL.createObjectURL(audioBlob);

            setAudioURL(audioUrl);

            console.log(audioChunks);
        };

        console.log("recording stop");
    };

    // * TRIMMING AUDIO FUNCTION
    const loadAudioBuffer = async (audioBuffer) => {
        const audioContext = new AudioContext();
        const audioBufferSource = audioContext.createBufferSource();
        audioBufferSource.buffer = audioBuffer;
        audioBufferSource.connect(audioContext.destination);
        setAudioBufferSource(audioBufferSource);
    };

    const handleTrimButtonClick = async () => {
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
                    // handle case where index is out of bounds
                    trimmedChannelData[j] = channelData[channelData.length - 1];
                }
            }
            trimmedBuffer.copyToChannel(trimmedChannelData, i, 0);
        }

        // Call the function to load the trimmed audio into the player
        await loadAudioBuffer(trimmedBuffer);
    };

    // * PLAY THE TRIMMED AUDIO FUNCTION
    const handlePlay = () => {
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

    const handleSave = () => {
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

            setTrimmedAudioList(newTrimmedAudioList);
            localStorage.setItem(
                "trimmedAudioList",
                JSON.stringify(newTrimmedAudioList)
            );

            console.log("trimmedAudioList: ", trimmedAudioList);
        }
    };

    const handleDelete = (index) => {
        const newList = [...trimmedAudioList];
        newList.splice(index, 1);
        setTrimmedAudioList(newList);
        localStorage.setItem("trimmedAudioList", JSON.stringify(newList));
        console.log(trimmedAudioList);
    };

    // * DOWNLOAD THE TRIMMED AUDIO FUNCTION
    const handleDownload = () => {
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

    function bufferToWave(abuffer) {
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

    // *TRANSCRIPT RESET BUTTON
    const reset = () => {
        resetTranscript();
    };

    return (
        <>
            <div className="h-[100vh] font-[Poppins]">
                <div className="container mt-48">
                    <h1 className="text-center font-bold text-4xl mb-3">
                        Speech to Text in Javascript
                    </h1>

                    <div className="form-group w-[80%] m-auto d-flex justify-content-around text-center mt-3">
                        <button
                            id="recordBtn"
                            className="btn btn-danger w-50 me-4 space-x-2 flex justify-center items-center"
                            onClick={isRecording ? recordStop : recordStart}
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

                        <Uploader />

                        <button
                            id="transcribeBtn"
                            className="btn btn-success w-50 me-4 space-x-2 flex justify-center items-center"
                            onClick={isListening ? stop : start}
                        >
                            {isListening ? (
                                <>
                                    <BsFillStopFill />{" "}
                                    <span>Stop Transcribing</span>
                                </>
                            ) : (
                                <>
                                    <BsFillPlayFill />{" "}
                                    <span>Start Transcribing</span>
                                </>
                            )}
                        </button>
                        <button
                            id="resetBtn"
                            className="btn btn-primary w-50 me-4 space-x-2 flex justify-center items-center"
                            onClick={reset}
                        >
                            <RxReset /> <span>Reset Transcript</span>
                        </button>
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
                        <label htmlFor="startTrim">Set Start of Trim:</label>
                        <span> {startTrim} seconds</span>
                        <input
                            type="range"
                            name="start"
                            id="startTrim"
                            min="0"
                            max="100"
                            value={startTrim}
                            onChange={(e) => setStartTrim(e.target.value)}
                            className="appearance-none w-full h-2 bg-gray-300 rounded-lg outline-none"
                        />
                        <label htmlFor="endTrim">Set End of Trim:</label>
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
                                onClick={handleTrimButtonClick}
                            >
                                <RxReset /> <span>Trim Audio</span>
                            </button>
                            <button
                                className="flex items-center justify-center  space-x-2 btn btn-danger px-5 py-2 rounded-lg"
                                onClick={handleDownload}
                            >
                                <BsDownload />{" "}
                                <span>Download Trimmed Audio</span>
                            </button>
                        </div>

                        <div className="flex justify-center">
                            <button
                                className="btn btn-primary w-50 me-4 space-x-2 flex justify-center items-center"
                                onClick={handlePlay}
                                disabled={isPlaying}
                            >
                                {isPlaying
                                    ? "Playing Audio..."
                                    : "Play Trimmed Audio"}
                            </button>
                            <button
                                className="flex items-center justify-center  space-x-2 btn btn-danger px-5 py-2 rounded-lg"
                                onClick={handleSave}
                            >
                                <BsDownload /> <span>Save Trimmed Audio</span>
                            </button>
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

                    <div className="container space-y-5 mt-5">
                        <h1 className="text-2xl font-bold">Audio List</h1>
                        <ul>
                            {trimmedAudioList.map((trimmedAudio, index) => (
                                <li key={index}>
                                    <span>{trimmedAudio.name}</span>
                                    <audio
                                        src={trimmedAudio.url}
                                        controls
                                    ></audio>
                                    <button onClick={() => handleDelete(index)}>
                                        Delete
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
}

export default SpeechToText;
