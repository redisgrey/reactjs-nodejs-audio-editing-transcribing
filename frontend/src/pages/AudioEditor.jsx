import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { Howler, Howl } from "howler";

function AudioEditor() {
    const [file, setFile] = useState(null);
    const [start, setStart] = useState(0);
    const [end, setEnd] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [trimmedSrc, setTrimmedSrc] = useState("");
    const [howlLoaded, setHowlLoaded] = useState(false);

    const handleFileInputChange = (event) => {
        const file = event.target.files[0];
        const fileType = file.type;
        const fileName = file.name;
        const fileExtension = fileName.split(".").pop();
        // Explicitly specify the file format
        const blob = new Blob([file], {
            type: fileType,
            format: fileExtension,
        });

        setFile(blob);
    };

    const handlePlayButtonClick = () => {
        const sound = new Howl({
            src: [URL.createObjectURL(file)],
            format: ["mp3", "wav", "ogg"],
            html5: true,
            sprite: {
                slice: [start * 1000, (end - start) * 1000],
            },
            onplay: () => {
                setPlaying(true);
            },
            onstop: () => {
                setPlaying(false);
            },
            onend: () => {
                setPlaying(false);
            },
        });
        sound.play("slice");
    };

    const handleStopButtonClick = () => {
        Howler.stop();
        setPlaying(false);
    };

    const handleRangeChange = (event) => {
        const { name, value } = event.target;
        if (name === "start") {
            setStart(value);
            if (value >= end) {
                setEnd(value);
            }
        } else if (name === "end") {
            setEnd(value);
            if (value <= start) {
                setStart(value);
            }
        }
    };

    const handleTrimButtonClick = () => {
        const sound = new Howl({
            src: [URL.createObjectURL(file)],
            format: ["mp3", "wav", "ogg"],
            html5: true,
            preload: "auto",
            sprite: {
                slice: [start * 1000, (end - start) * 1000],
            },
            onload: () => {
                // Create a new blob URL for the trimmed audio
                const trimmedBlob = new Blob([sound._src], { type: file.type });
                console.log(trimmedBlob.type);
                const trimmedUrl = URL.createObjectURL(trimmedBlob);
                console.log(trimmedUrl);

                setTrimmedSrc(trimmedUrl);
                setStart(0);
                setEnd(100);
                setHowlLoaded(true);
            },
        });
        sound.load();
        console.log("handleTrimButtonClick executed");
    };

    useEffect(() => {
        if (file && trimmedSrc && howlLoaded) {
            setPlaying(false);
            const sound = new Howl({
                src: [trimmedSrc],
                format: ["mp3", "wav", "ogg"],
                html5: true,
            });

            sound.play();

            return () => {
                sound.unload();
            };
        }
        console.log("trimmedSrc updated:", trimmedSrc);
    }, [file, trimmedSrc, playing, setTrimmedSrc]);

    // const handleAudioError = (event) => {
    //     console.log("Audio error:", event.target.error);
    // };

    // const handleAudioEvent = (event) => {
    //     console.log("Audio event:", event.type);
    // };

    return (
        <div className="mt-56">
            <input
                type="file"
                accept=".mp3,.wav"
                onChange={handleFileInputChange}
            />
            <br />
            <input
                type="range"
                name="start"
                min="0"
                max="100"
                value={start}
                onChange={handleRangeChange}
                className="appearance-none w-full h-2 bg-gray-300 rounded-lg outline-none"
            />
            <input
                type="range"
                name="end"
                min="0"
                max="100"
                value={end}
                onChange={handleRangeChange}
                className="appearance-none w-full h-2 bg-gray-300 rounded-lg outline-none"
            />
            <br />
            <Button onClick={handlePlayButtonClick} disabled={!file}>
                {playing ? "Pause" : "Play"}
            </Button>{" "}
            <Button onClick={handleStopButtonClick} disabled={!playing}>
                Stop
            </Button>
            <Button onClick={handleTrimButtonClick} disabled={!file}>
                Trim
            </Button>
            {/* {trimmedSrc && (
                <audio
                    key={trimmedSrc}
                    src={trimmedSrc}
                    onError={handleAudioError}
                    onPlay={handleAudioEvent}
                    onPause={handleAudioEvent}
                    controls
                ></audio>
            )} */}
            {trimmedSrc && <audio key={trimmedSrc} src={trimmedSrc} controls />}
        </div>
    );
}

export default AudioEditor;
