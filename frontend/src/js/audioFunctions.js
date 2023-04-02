import WaveSurfer from "wavesurfer.js";

import TimelinePlugin from "wavesurfer.js/dist/plugin/wavesurfer.timeline.min.js";

import RegionsPlugin from "wavesurfer.js/dist/plugin/wavesurfer.regions.min.js";

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

function getRandomColor() {
    const letters = "0123456789ABCDEF";
    return function () {
        let color = "#";
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        const result = color + "80";
        // console.log("getRandomColor result:", result);
        return result;
    };
}
export const handleFileChange = (
    event,
    setAudioChunks,
    setImportedAudioList,
    importedAudioList,
    setWaveSurfer,
    setPlaying,
    sliderRef,
    setRegions
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
                // console.log("Region updated:", region);
                // Perform any necessary processing or actions here
            });

            waveSurfer.on("region-removed", (region) => {
                setRegions((prevRegions) =>
                    prevRegions.filter((r) => r.id !== region.id)
                );
                // console.log("Region removed:", region);
                // Perform any necessary processing or actions here
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

    reader.readAsArrayBuffer(file);
};
