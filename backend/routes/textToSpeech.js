const googleTTS = require("google-tts-api");

const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
    const text = req.query.text;

    googleTTS
        .getAllAudioBase64(text)
        .then((result) => {
            const buffers = result.map((result) =>
                Buffer.from(result.base64, "base64")
            );
            const finalBuffer = Buffer.concat(buffers);
            res.send(finalBuffer);
            console.log(finalBuffer);
        })
        .catch((err) => {
            console.error(err);
        });
});

module.exports = router;
