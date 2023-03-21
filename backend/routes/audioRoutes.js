const express = require("express");

const mongoose = require("mongoose");

const { GridFsStorage } = require("multer-gridfs-storage");

const multer = require("multer");

const crypto = require("crypto");

const path = require("path");

const dotenv = require("dotenv").config();

const router = express.Router();

const MONGO_URI = process.env.MONGO_URI;

const conn = mongoose.createConnection(MONGO_URI);

let gfs;

conn.once("open", () => {
    (gfs = new mongoose.mongo.GridFSBucket(conn.db)),
        {
            bucketName: "audios",
        };
    console.log("bucket created");
});

const storage = new GridFsStorage({
    url: MONGO_URI,
    options: { useUnifiedTopology: true },
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }

                const filename =
                    buf.toString("hex") + path.extname(file.originalname);

                const fileInfo = {
                    filename: filename,
                    bucketName: "audios",
                };

                resolve(fileInfo);
            });
        });
    },
});

const store = multer({
    storage,
    limits: { fileSize: 20000000 },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

function checkFileType(file, cb) {
    const filetypes = /webm|weba|mp3|aac|wav|flac|alac|dsd/;
    const extname = filetypes.test(
        path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb("filetype");
}

const uploadMiddleware = (req, res, next) => {
    const upload = store.single("audio");
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).send("File too Large");
        } else if (err) {
            if (err === "filetype")
                return res.status(400).send("Audio Files Only");
            return res.sendStatus(500);
        }

        next();
    });
};

const deleteAudio = (id) => {
    if (!id || id === "undefined") return res.status(400).send("No Audio ID");
    const _id = new mongoose.Types.ObjectId(id);

    gfs.delete(_id, (err) => {
        if (err) return res.status(500).send("Audio Deletion Error");
    });
};

//*ROUTES
// router.post("/upload", uploadMiddleware, async (req, res) => {
//     const { file } = req;
//     const { id } = file;
//     if (file.size > 5000000) {
//         deleteAudio(id);
//         return res.status(400).send("File may not exceed 5MB");
//     }

//     console.log("Uploaded File: ", file);
//     return res.send(file.id);
// });

router.post("/upload", async (req, res) => {
    const { file } = req;
    console.log("File received: ", file);
    if (!file) {
        return res.status(400).json({
            message: "No File Found",
        });
    }
    const { id } = file;
    if (file.size > 5000000) {
        deleteAudio(id);
        return res.status(400).send("File may not exceed 5MB");
    }

    try {
        const fileId = await handleSave(file);
        console.log("Uploaded File: ", file);
        return res.send(fileId);
    } catch (error) {
        console.log(error);
        return res.status(500).send("Error uploading file");
    }
});

router.get("/:id", ({ params: { id } }, res) => {
    try {
        var _id = new mongoose.Types.ObjectId(id);
    } catch (err) {
        return res.status(400).json({
            message:
                "Invalid trackID in URL parameter. Must be a single String of 12 bytes or a string of 24 hex characters",
        });
    }
    res.set("content-type", "audio/webm");
    res.set("accept-ranges", "bytes");

    (gfs = new mongoose.mongo.GridFSBucket(conn.db)),
        {
            bucketName: "audios",
        };
    let downloadStream = gfs.openDownloadStream(_id);

    downloadStream.on("data", (chunk) => {
        res.write(chunk);
    });

    downloadStream.on("error", () => {
        res.sendStatus(404);
    });

    downloadStream.on("end", () => {
        res.end();
    });
});

module.exports = router;
