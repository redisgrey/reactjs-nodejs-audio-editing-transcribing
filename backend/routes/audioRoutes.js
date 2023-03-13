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
router.post("/upload", uploadMiddleware, async (req, res) => {
    const { file } = req;
    const { id } = file;
    if (file.size > 5000000) {
        deleteAudio(id);
        return res.status(400).send("File may not exceed 5MB");
    }

    console.log("Uploaded File: ", file);
    return res.send(file.id);
});

router.get("/", async (req, res) => {
    (gfs = new mongoose.mongo.GridFSBucket(conn.db)),
        {
            bucketName: "audios",
        };

    // const { files } = req;
    // let file = await gfs.find({ files }).toArray();

    // if (!file || file.length === 0) {
    //     return res.status(404).send("No Files Exist");
    // }

    // return res.json(file);

    // const { files } = req;

    // gfs.find({ files }).toArray((err, files) => {
    //     if (!files || files.length === 0) {
    //         return res.status(400).send("No Files Exist");
    //     }
    //     console.log(res);
    // });

    const { files } = req;
    gfs.find({ files }).toArray((err, files) => {
        if (!files || files.length === 0) {
            return res.status(400).send("No Files Exist");
        }
        gfs.openDownloadStream(_id).pipe(res);
        //GridFSBucket.openDownloadStreamByName()

        //return res.json(files);
    });
});

module.exports = router;
