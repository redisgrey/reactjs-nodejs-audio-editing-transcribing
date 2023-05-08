const express = require("express");

const mongoose = require("mongoose");

const app = express();

const cors = require("cors");

const dotenv = require("dotenv").config();

const PORT = process.env.PORT || 5000;

// DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error: "));

db.once("open", () => console.log("Connected to the database"));

// * MIDDLEWARE
app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// * ROUTES
app.use("/api/users", require("./backend/routes/userRoutes"));

app.use("/api/text-to-speech", require("./backend/routes/textToSpeech"));

app.use("/api/speech-to-text", require("./backend/routes/speechToText"));

// // Imports the Google Cloud client library
// const speech = require("@google-cloud/speech");

// // Creates a client
// const client = new speech.SpeechClient();

// async function quickstart() {
//     // The path to the remote LINEAR16 file
//     const gcsUri = "gs://cloud-samples-data/speech/brooklyn_bridge.raw";

//     // The audio file's encoding, sample rate in hertz, and BCP-47 language code
//     const audio = {
//         uri: gcsUri,
//     };
//     const config = {
//         encoding: "LINEAR16",
//         sampleRateHertz: 16000,
//         languageCode: "en-US",
//         enableWordTimeOffsets: true, // Add this line to enable word time offsets
//     };
//     const request = {
//         audio: audio,
//         config: config,
//     };

//     // Detects speech in the audio file
//     const [response] = await client.recognize(request);
//     const transcription = response.results
//         .map((result) => result.alternatives[0])
//         .map((alternative) => {
//             // Extract the transcript and word time offsets from the alternative
//             const transcript = alternative.transcript;
//             const wordTimeOffsets = alternative.words.map((word) => ({
//                 startTime:
//                     `${word.startTime.seconds}` +
//                     `.` +
//                     `${(word.startTime.nanos / 1e6)
//                         .toFixed(0)
//                         .padStart(3, "0")}`,
//                 endTime:
//                     `${word.endTime.seconds}` +
//                     `.` +
//                     `${(word.endTime.nanos / 1e6).toFixed(0).padStart(3, "0")}`,
//                 word: word.word,
//             }));

//             // Return the transcript and word time offsets as an object
//             return { transcript, wordTimeOffsets };
//         });

//     // Extract the transcript and timestamps from the response
//     const transcript = transcription
//         .map((result) => result.transcript)
//         .join("\n");
//     const timestamps = transcription.map((result) => result.wordTimeOffsets);

//     console.log(`Transcription: \n${transcript}`);
//     console.log(`Timestamps: \n${JSON.stringify(timestamps, null, 2)}`);
// }

// quickstart();

app.listen(PORT, () => console.log(`Server running at PORT ${PORT}`));
