import { useState, useRef, useEffect } from "react";

import { Howl } from "howler";

import { BsFillPlayFill, BsFillStopFill, BsDownload } from "react-icons/bs";

import { RxReset } from "react-icons/rx";

import NotFound from "./NotFound";

import SpeechRecognition, {
    useSpeechRecognition,
} from "react-speech-recognition";

import Uploader from "../components/Uploader";

const lamejs = require("lamejstmp");

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
    const [startTrim, setStartTrim] = useState(0);

    const [endTrim, setEndTrim] = useState(100);

    const [trimmedUrl, setTrimmedUrl] = useState("");

    // * FETCH AUDIO DATA FROM THE DATABASE
    const [audioList, setAudioList] = useState([]);

    const [audioListURL, setAudioListURL] = useState(null);

    useEffect(() => {
        console.log("audioUrl updated:", audioURL);
    }, [audioURL]);

    useEffect(() => {
        console.log("trimmedUrl updated:", trimmedUrl);
    }, [trimmedUrl]);

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
            // setAudioChunks([]);
        };

        console.log("recording stop");
        //setModalOpen(true);
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

        let start = startTrim;

        console.log("start Trim: ", start);

        let end = endTrim;

        console.log("end Trim: ", end);

        if (start < 0) {
            start = 0;
        }

        if (end > originalDuration) {
            end = originalDuration;
        }

        const sampleRate = audioBuffer.sampleRate;
        const numChannels = audioBuffer.numberOfChannels;
        const startFrame = start * sampleRate;
        const endFrame = end * sampleRate;
        const numberOfFrames = endFrame - startFrame;
        const trimmedBuffer = audioContext.createBuffer(
            audioBuffer.numberOfChannels,
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

        // Get the audio data as an array of float32 values
        const audioData = new Float32Array(trimmedBuffer.getChannelData(0));

        console.log("audioData: ", audioData);

        // Create a new LAME encoder instance
        const lame = new lamejs.Mp3Encoder(numChannels, sampleRate, 320);

        console.log("lame: ", lame);

        const samples = new Int16Array(sampleRate);

        const mp3Tmp = lame.encodeBuffer(audioData);

        // Create a buffer to hold the MP3 data
        const mp3Data = [];

        // Encode the audio data into MP3 format
        mp3Data.push(mp3Tmp);
        console.log("mp3Data: ", mp3Data);

        const finalChunk = lame.flush();
        if (finalChunk.length > 0) {
            mp3Data.push(new Int8Array(finalChunk));
        }

        console.log("finalChunk: ", finalChunk);

        // Convert the array of Int8Arrays to a single Uint8Array
        const finalData = new Uint8Array(
            mp3Data.reduce((acc, curr) => [...acc, ...curr], [])
        );

        console.log("finalData: ", finalData);

        // Create a Blob from the MP3 data
        const blob = new Blob([finalData], { type: "audio/mp3" });

        console.log("blob: ", blob);

        // Create a URL for the Blob
        const url = URL.createObjectURL(blob);

        console.log("url: ", url);

        setTrimmedUrl(url);
    };

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
                        <h1 className="text-2xl font-bold">
                            Recorded Audio Preview
                        </h1>

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
                        <input
                            type="range"
                            name="end"
                            id="endTrim"
                            min="0"
                            max="100"
                            value={endTrim}
                            onChange={(e) => setEndTrim(e.target.value)}
                            className="appearance-none w-full h-2 bg-gray-300 rounded-lg outline-none"
                        />
                        <audio
                            src={trimmedUrl}
                            controls
                            className="w-[80%]"
                        ></audio>
                        <div className="flex justify-center">
                            <button
                                id="trimBtn"
                                className="btn btn-primary w-50 me-4 space-x-2 flex justify-center items-center"
                                onClick={handleTrimButtonClick}
                            >
                                <RxReset /> <span>Trim Audio</span>
                            </button>
                            <a
                                className="flex items-center justify-center  space-x-2 btn btn-danger px-5 py-2 rounded-lg"
                                href={trimmedUrl}
                                download
                            >
                                <BsDownload />{" "}
                                <span>Download Trimmed Audio</span>
                            </a>
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

                        {/* <div>
                            {audioListExample.map((audio) => (
                                <audio src={audio} controls></audio>
                            ))}
                        </div> */}
                        {/* <div className="flex items-center justify-between">
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
                        </div> */}
                    </div>
                </div>
            </div>
        </>
    );
}

export default SpeechToText;
