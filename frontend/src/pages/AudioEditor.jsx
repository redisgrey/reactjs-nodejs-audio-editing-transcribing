import React, { useState } from "react";
import { Button } from "react-bootstrap";
import { Howler, Howl } from "howler";

function AudioEditor() {
    const [file, setFile] = useState(null);
    const [start, setStart] = useState(0);
    const [end, setEnd] = useState(0);
    const [playing, setPlaying] = useState(false);

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

    const handleStartInputChange = (event) => {
        const value = Number(event.target.value);
        setStart(value);
    };

    const handleEndInputChange = (event) => {
        const value = Number(event.target.value);
        setEnd(value);
    };

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
                min="0"
                max="100"
                value={start}
                onChange={handleStartInputChange}
            />
            <br />
            <input
                type="range"
                min="0"
                max="100"
                value={end}
                onChange={handleEndInputChange}
            />
            <br />
            <Button onClick={handlePlayButtonClick} disabled={!file}>
                {playing ? "Pause" : "Play"}
            </Button>{" "}
            <Button onClick={handleStopButtonClick} disabled={!playing}>
                Stop
            </Button>
        </div>
    );
}

export default AudioEditor;
