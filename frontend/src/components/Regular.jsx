import React, { useState } from "react";

import axios from "axios";

import { BsDownload } from "react-icons/bs";

import Spinner from "./Spinner";

const Regular = () => {
    const [file, setFile] = useState(null);

    const [inputContainsFile, setInputContainsFile] = useState(false);

    const [currentlyUploading, setCurrentlyUploading] = useState(false);

    const [audioId, setAudioId] = useState(null);

    const [progress, setProgress] = useState(null);

    const onChange = (event) => {
        setFile(event.target.files[0]);
        setInputContainsFile(true);
    };

    const fileUploadHandler = () => {
        const fd = new FormData();

        fd.append("audio", file, file.name);

        axios
            .post("http://localhost:5000/api/audio/upload", fd)
            .then(({ data }) => {
                setAudioId(data);
                setFile(null);
                setInputContainsFile(false);
                setCurrentlyUploading(false);
            })
            .catch((err) => {
                if (err.response.status === 400) {
                    const errMsg = err.response.data;
                    if (errMsg) {
                        console.log(errMsg);
                        alert(errMsg);
                    } else {
                        console.log("other error", err);
                        setInputContainsFile(false);
                        setCurrentlyUploading(false);
                    }
                }
            });
    };

    const onLabelClick = () => {
        if (file) {
            setCurrentlyUploading(true);
            fileUploadHandler();
        } else {
            console.log("upload successful");
        }
    };

    return (
        <>
            <div>
                {/* {audioId ? (
                    <audio
                        src={`http://localhost:5000/api/audio/${audioId}`}
                        controls
                    ></audio>
                ) : null} */}
                <div>
                    {currentlyUploading ? (
                        <label
                            htmlFor="file"
                            className="btn btn-secondary w-[270px] me-4 flex space-x-2 text-white justify-center items-center"
                            onClick={onLabelClick}
                        >
                            <>
                                <BsDownload /> <span>Uploading Audio</span>
                            </>
                        </label>
                    ) : (
                        <>
                            <input
                                type="file"
                                name="file"
                                id="file"
                                onChange={onChange}
                                className="hidden"
                            />
                            <label
                                htmlFor="file"
                                className="btn btn-secondary w-[270px] me-4 flex space-x-2 text-white justify-center items-center"
                                onClick={onLabelClick}
                            >
                                {file ? (
                                    <>
                                        <BsDownload /> <span>Upload Audio</span>
                                    </>
                                ) : (
                                    <>
                                        <BsDownload /> <span>Import Audio</span>
                                    </>
                                )}
                            </label>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default Regular;
