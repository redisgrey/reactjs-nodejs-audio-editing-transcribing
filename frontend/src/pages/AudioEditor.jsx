import React from "react";

import AudioWaveform from "../components/Waveform";

function AudioEditor() {
    return (
        <>
            <h1 style={{ textAlign: "center", margin: "1em 0" }}>
                Edit Your Audio File
            </h1>
            <AudioWaveform />
        </>
    );
}

export default AudioEditor;
