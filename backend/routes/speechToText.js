const express = require("express");
const multer = require("multer");
const upload = multer();
const fs = require("fs");
const speech = require("@google-cloud/speech");
const router = express.Router();

const client = new speech.SpeechClient();

router.post("/", upload.single("audio"), async (req, res, next) => {
    try {
        const audioBuffer = req.file.buffer;

        const [response] = await client.recognize({
            audio: {
                content: audioBuffer,
            },
            config: {
                encoding: "LINEAR16",
                sampleRateHertz: 48000,
                languageCode: "en-US",
                enableWordTimeOffsets: true,
            },
        });

        const transcription = response.results
            .map((result) => result.alternatives[0].transcript)
            .join("\n");
        const timestamps = response.results
            .map((result) => result.alternatives[0].words)
            .flat()
            .map((word) => ({
                word: word.word,
                start: parseFloat(
                    word.startTime.seconds + "." + word.startTime.nanos
                ),
                end: parseFloat(
                    word.endTime.seconds + "." + word.endTime.nanos
                ),
            }));

        res.json({ transcription, timestamps });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
