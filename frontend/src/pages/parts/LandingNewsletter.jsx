import React from "react";

import { CalendarDaysIcon, HandRaisedIcon } from "@heroicons/react/24/outline";

function LandingNewsletter() {
    return (
        <>
            <div className="relative isolate overflow-hidden bg-gray-900 py-5 sm:py-24 lg:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto grid max-w-2xl grid-cols-1 gap-y-16 gap-x-24 lg:max-w-none lg:grid-cols-2">
                        <div className="max-w-xl lg:max-w-lg">
                            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                Subscribe to our newsletter.
                            </h2>
                            <p className="mt-4 text-lg leading-8 text-gray-300">
                                Be our priority for our upcoming updates.
                            </p>
                            <div className="mt-6 flex max-w-md gap-x-4">
                                <label
                                    htmlFor="email-address"
                                    className="sr-only"
                                >
                                    Email address
                                </label>
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="min-w-0 flex-auto rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                    placeholder="Enter your email"
                                />
                                <a
                                    href="mailto:tmq.dahlt@gmail.com"
                                    className="flex-none rounded-md bg-[#E09F68] py-2.5 px-3.5 text-sm font-semibold text-black shadow-sm hover:bg-[#e09e6873] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E09F68]"
                                >
                                    Subscribe
                                </a>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:pt-2">
                            <div className="flex flex-col items-start">
                                <h2 className="mt-4 font-semibold text-white">
                                    Features
                                </h2>
                                <h3 className="mt-2 leading-7 text-gray-400">
                                    <a
                                        href="/features"
                                        className="hover:text-gray-200 visited:text-gray-400"
                                    >
                                        Transcription
                                    </a>
                                </h3>

                                <h3 className="mt-2 leading-7 text-gray-400">
                                    <a
                                        href="/features"
                                        className="hover:text-gray-200 visited:text-gray-400"
                                    >
                                        Podcasting
                                    </a>
                                </h3>

                                <h3 className="mt-2 leading-7 text-gray-400">
                                    <a
                                        href="/features"
                                        className="hover:text-gray-200 visited:text-gray-400"
                                    >
                                        Overdub
                                    </a>
                                </h3>

                                <h3 className="mt-2 leading-7 text-gray-400">
                                    <a
                                        href="/features"
                                        className="hover:text-gray-200 visited:text-gray-400"
                                    >
                                        Captioning
                                    </a>
                                </h3>
                            </div>
                            <div className="flex flex-col items-start">
                                <h2 className="mt-4 font-semibold text-white">
                                    Company
                                </h2>
                                <h3 className="mt-2 leading-7 text-gray-400">
                                    <a
                                        href="/about-us"
                                        className="hover:text-gray-200 visited:text-gray-400"
                                    >
                                        About
                                    </a>
                                </h3>

                                <h3 className="mt-2 leading-7 text-gray-400">
                                    <a
                                        href="/careers"
                                        className="hover:text-gray-200 visited:text-gray-400"
                                    >
                                        Careers
                                    </a>
                                </h3>

                                <h3 className="mt-2 leading-7 text-gray-400">
                                    <a
                                        href="/privacy"
                                        className="hover:text-gray-200 visited:text-gray-400"
                                    >
                                        Privacy
                                    </a>
                                </h3>

                                <h3 className="mt-2 leading-7 text-gray-400">
                                    <a
                                        href="/terms"
                                        className="hover:text-gray-200 visited:text-gray-400"
                                    >
                                        Terms
                                    </a>
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="text-center text-white mt-24">
                    <p>© 2023 Script. All rights reserved.</p>
                </div>
            </div>
        </>
    );
}

export default LandingNewsletter;
