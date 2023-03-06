import React from "react";

import { CgTranscript } from "react-icons/cg";

import { BsFillMicFill } from "react-icons/bs";

import { FaExchangeAlt, FaClosedCaptioning } from "react-icons/fa";

function LandingFeat() {
    return (
        <>
            <div className="bg-gray-200 font-[Poppins] md:h-[90vh]">
                <div className="mx-auto  grid max-w-2xl  items-center gap-y-16 gap-x-8 py-24 px-4 sm:px-6 sm:py-32 lg:max-w-7xl lg:px-8">
                    <div>
                        <h2 className="text-3xl text-center font-bold tracking-tight text-gray-900 sm:text-4xl">
                            <span className="font-bold text-[#2081c3]">
                                All-in-One Tool
                            </span>{" "}
                            for all your audio editing needs.
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-4 grid-rows-2 gap-4 sm:gap-6 lg:gap-8">
                        <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0 flex justify-center ">
                            <div className="rounded-2xl bg-gray-50 py-5 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16">
                                <div className="mx-auto max-w-xs px-8">
                                    <CgTranscript className="w-[200px] h-[100px] ms-4" />
                                    <p className="mt-3 flex items-baseline justify-center gap-x-2">
                                        <span className="text-3xl font-bold tracking-tight text-gray-900">
                                            Transcription
                                        </span>
                                    </p>
                                    <p className="mt-3 text-xs leading-5 text-gray-600">
                                        Industry-leading accuracy and speed,
                                        with powerful correction tools.
                                    </p>
                                    <a
                                        href="/features"
                                        className="mt-3 block w-full rounded-md bg-[#E09F3E] px-3 py-2 text-center text-sm font-semibold text-black shadow-sm hover:bg-[#e09f3e85]  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E09F3E]"
                                    >
                                        Learn More
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0 flex justify-center">
                            <div className="rounded-2xl bg-gray-50 py-5 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16">
                                <div className="mx-auto max-w-xs px-8">
                                    <BsFillMicFill className="w-[200px] h-[100px] ms-4" />
                                    <p className="mt-3 flex items-baseline justify-center gap-x-2">
                                        <span className="text-3xl font-bold tracking-tight text-gray-900">
                                            Podcasting
                                        </span>
                                    </p>
                                    <p className="mt-3 text-xs leading-5 text-gray-600">
                                        Multitrack audio editing, as easy as a
                                        doc.
                                    </p>
                                    <a
                                        href="/features"
                                        className="mt-[20px] block w-full rounded-md bg-[#E09F3E] px-3 py-2 text-center text-sm font-semibold text-black shadow-sm hover:bg-[#e09f3e85]  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E09F3E]"
                                    >
                                        Learn More
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0 flex justify-center">
                            <div className="rounded-2xl bg-gray-50 py-5 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16">
                                <div className="mx-auto max-w-xs px-8 ">
                                    <FaExchangeAlt className="w-[200px] h-[100px] ms-4" />
                                    <p className="mt-3 flex items-baseline justify-center gap-x-2">
                                        <span className="text-3xl font-bold tracking-tight text-gray-900">
                                            Overdub
                                        </span>
                                    </p>
                                    <p className="mt-3 text-xs leading-5 text-gray-600">
                                        Change/Replace parts of your audio with
                                        our Text-to-Speech easily.
                                    </p>
                                    <a
                                        href="/features"
                                        className="mt-3 block w-full rounded-md bg-[#E09F3E] px-3 py-2 text-center text-sm font-semibold text-black shadow-sm hover:bg-[#e09f3e85]  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E09F3E]"
                                    >
                                        Learn More
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0 flex justify-center">
                            <div className="rounded-2xl bg-gray-50 py-5 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16">
                                <div className="mx-auto max-w-xs px-8">
                                    <FaClosedCaptioning className="w-[200px] h-[100px] ms-4" />
                                    <p className="mt-3 flex items-baseline justify-center gap-x-2">
                                        <span className="text-3xl font-bold tracking-tight text-gray-900">
                                            Captioning
                                        </span>
                                    </p>
                                    <p className="mt-3 text-xs leading-5 text-gray-600">
                                        Make good subtitles/captions in minutes.
                                    </p>
                                    <a
                                        href="/features"
                                        className="mt-[20px] block w-full rounded-md bg-[#E09F3E] px-3 py-2 text-center text-sm font-semibold text-black shadow-sm hover:bg-[#e09f3e85]  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E09F3E]"
                                    >
                                        Learn More
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default LandingFeat;
