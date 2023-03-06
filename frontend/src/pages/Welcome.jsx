import React from "react";

import TypeWriterEffect from "react-typewriter-effect";
import LandingFeat from "./parts/LandingFeat";
import LandingNewsletter from "./parts/LandingNewsletter";
import LandingPricing from "./parts/LandingPricing";
import LandingStats from "./parts/LandingStats";
import LandingTestimonial from "./parts/LandingTestimonial";

function Welcome() {
    return (
        <>
            <main className="h-[100vh] mt-20 bg-gray-200 font-[Poppins]">
                <div className="relative md:grid md:grid-cols-3 md:gap-72">
                    <div className=" pl-10 py-12 md:py-48">
                        <div className="space-y-12 w-[400px] md:w-[700px]">
                            <div className="mx-auto md:hidden">
                                <div
                                    id="carousel_images"
                                    className="carousel slide"
                                    data-bs-ride="carousel"
                                >
                                    <div className="carousel-inner">
                                        <div className="carousel-item active">
                                            <img
                                                src="./images/hero1.jpg"
                                                className="max-w-[400px] rounded-xl shadow-xl ring-1 ring-gray-400/10"
                                                alt="Landing 1"
                                                width={2432}
                                                height={1442}
                                            />
                                        </div>
                                        <div className="carousel-item">
                                            <img
                                                src="./images/hero2.jpg"
                                                className="max-w-[400px] rounded-xl shadow-xl ring-1 ring-gray-400/10"
                                                alt="Landing 2"
                                                width={2432}
                                                height={1442}
                                            />
                                        </div>
                                        <div className="carousel-item">
                                            <img
                                                src="./images/hero3.jpg"
                                                className="max-w-[400px] rounded-xl shadow-xl ring-1 ring-gray-400/10"
                                                alt="Landing 3"
                                                width={2432}
                                                height={1442}
                                            />
                                        </div>
                                        <div className="carousel-item">
                                            <img
                                                src="./images/hero4.jpg"
                                                className="max-w-[400px] rounded-xl shadow-xl ring-1 ring-gray-400/10"
                                                alt="Landing 4"
                                                width={2432}
                                                height={1442}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        className="carousel-control-prev"
                                        type="button"
                                        data-bs-target="#carousel_images"
                                        data-bs-slide="prev"
                                    >
                                        <span
                                            className="carousel-control-prev-icon"
                                            aria-hidden="true"
                                        ></span>
                                        <span className="visually-hidden">
                                            Previous
                                        </span>
                                    </button>
                                    <button
                                        className="carousel-control-next"
                                        type="button"
                                        data-bs-target="#carousel_images"
                                        data-bs-slide="next"
                                    >
                                        <span
                                            className="carousel-control-next-icon"
                                            aria-hidden="true"
                                        ></span>
                                        <span className="visually-hidden">
                                            Next
                                        </span>
                                    </button>
                                </div>
                            </div>
                            <div className=" w-[400px] md:w-[700px] md:h-[210px]">
                                <h1 className="hidden text-[100px] font-bold tracking-tight text-gray-900 md:block">
                                    Transcription made
                                    <TypeWriterEffect
                                        textStyle={{
                                            fontFamily: "Poppins",
                                            color: "#2081C3",
                                            fontWeight: 500,
                                            fontSize: "100px",
                                            position: "relative",
                                            top: -120,
                                            left: 310,
                                        }}
                                        startDelay={1000}
                                        cursorColor="#00000"
                                        multiText={[
                                            "easy.",
                                            "enjoyable.",
                                            "affordable.",
                                        ]}
                                        multiTextDelay={5000}
                                        typeSpeed={100}
                                        multiTextLoop
                                    />
                                </h1>

                                <h1 className=" font-[Poppins] font-bold text-6xl md:hidden">
                                    Transcription{" "}
                                    <span className="block text-center mt-3">
                                        made
                                    </span>
                                    <TypeWriterEffect
                                        textStyle={{
                                            fontFamily: "Poppins",
                                            color: "#2081C3",
                                            fontWeight: 700,
                                            textAlign: "center",
                                            position: "relative",
                                            top: 0,
                                            left: 10,
                                        }}
                                        startDelay={1000}
                                        cursorColor="#00000"
                                        multiText={[
                                            "easy.",
                                            "enjoyable.",
                                            "affordable.",
                                        ]}
                                        multiTextDelay={5000}
                                        typeSpeed={100}
                                        multiTextLoop
                                    />
                                </h1>
                            </div>

                            <p className="mt-6 px-2 text-lg leading-8 text-gray-600">
                                Script is the simplest, most powerful, and fun
                                way to edit your audios.
                            </p>
                            <div className="mt-10 flex items-center justify-center gap-x-6">
                                <a
                                    href="/sign-in"
                                    className="rounded-md bg-[#E09F3E] px-3.5 py-2.5 text-sm font-semibold shadow-sm hover:bg-[#e09f3e93] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E09F3E] hover:text-black"
                                >
                                    Get started
                                </a>
                                <a
                                    href="/features"
                                    className="text-sm font-semibold leading-6 text-gray-600 hover:text-[#00000080]"
                                >
                                    Learn more <span aria-hidden="true">→</span>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="hidden mx-48 col-span-2 py-28 xl:block">
                        <div
                            id="carousel_images2"
                            className="carousel slide"
                            data-bs-ride="carousel"
                        >
                            <div className="carousel-inner">
                                <div className="carousel-item active">
                                    <img
                                        src="./images/hero1.jpg"
                                        className=" w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem] md:-ml-4 lg:-ml-0"
                                        alt="Landing 1"
                                        width={2432}
                                        height={1442}
                                    />
                                </div>
                                <div className="carousel-item">
                                    <img
                                        src="./images/hero2.jpg"
                                        className=" w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem] md:-ml-4 lg:-ml-0"
                                        alt="Landing 2"
                                        width={2432}
                                        height={1442}
                                    />
                                </div>
                                <div className="carousel-item">
                                    <img
                                        src="./images/hero3.jpg"
                                        className=" w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem] md:-ml-4 lg:-ml-0"
                                        alt="Landing 3"
                                        width={2432}
                                        height={1442}
                                    />
                                </div>
                                <div className="carousel-item">
                                    <img
                                        src="./images/hero4.jpg"
                                        className=" w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem] md:-ml-4 lg:-ml-0"
                                        alt="Landing 4"
                                        width={2432}
                                        height={1442}
                                    />
                                </div>
                            </div>
                            <button
                                className="carousel-control-prev"
                                type="button"
                                data-bs-target="#carousel_images2"
                                data-bs-slide="prev"
                            >
                                <span
                                    className="carousel-control-prev-icon"
                                    aria-hidden="true"
                                ></span>
                                <span className="visually-hidden">
                                    Previous
                                </span>
                            </button>
                            <button
                                className="carousel-control-next"
                                type="button"
                                data-bs-target="#carousel_images2"
                                data-bs-slide="next"
                            >
                                <span
                                    className="carousel-control-next-icon"
                                    aria-hidden="true"
                                ></span>
                                <span className="visually-hidden">Next</span>
                            </button>
                        </div>
                    </div>
                </div>

                <LandingFeat />
                <LandingStats />
                <LandingPricing />
                <LandingTestimonial />
                <LandingNewsletter />
            </main>
        </>
    );
}

export default Welcome;
