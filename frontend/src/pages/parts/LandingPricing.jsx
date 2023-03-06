import React from "react";

import { CheckIcon } from "@heroicons/react/20/solid";

function LandingPricing() {
    const includedFeatures = [
        "30hr/month Transcription Hours",
        "Unlimited Overdub",
        "Unlimited Filler Word Removal",
        "High Audio Export Resolution",
    ];
    return (
        <>
            <div className="bg-gray-200 py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl sm:text-center">
                        <h1 className="text-6xl font-bold tracking-tight text-gray-900 ">
                            Get started for{" "}
                            <span className="text-[#2081C3]">FREE</span>
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-gray-600">
                            Our free plan shows you what Script can do — no
                            credit card required. When you need more horsepower,
                            full access is only $200 USD.
                        </p>
                    </div>
                    <div className="mx-auto mt-16 max-w-2xl rounded-3xl ring-1 ring-gray-200 sm:mt-20 lg:mx-0 lg:flex lg:max-w-none">
                        <div className="p-8 sm:p-10 lg:flex-auto">
                            <h3 className="text-2xl font-bold tracking-tight text-gray-900">
                                Lifetime membership
                            </h3>
                            <p className="mt-6 text-base leading-7 text-gray-600">
                                Access all our PRO features with just
                                One-Time-Payment
                            </p>
                            <div className="mt-10 flex items-center gap-x-4">
                                <h4 className="flex-none text-sm font-semibold leading-6 text-[#2081c3]">
                                    What’s included
                                </h4>
                                <div className="h-px flex-auto bg-gray-100" />
                            </div>
                            <ul
                                role="list"
                                className="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-gray-600 sm:grid-cols-2 sm:gap-6"
                            >
                                {includedFeatures.map((feature) => (
                                    <li key={feature} className="flex gap-x-3">
                                        <CheckIcon
                                            className="h-6 w-5 flex-none text-[#2081c3]"
                                            aria-hidden="true"
                                        />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
                            <div className="rounded-2xl bg-gray-50 py-10 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16">
                                <div className="mx-auto max-w-xs px-8">
                                    <p className="text-base font-semibold text-gray-600">
                                        One-Time-Payment
                                    </p>
                                    <p className="mt-6 flex items-baseline justify-center gap-x-2">
                                        <span className="text-5xl font-bold tracking-tight text-gray-900">
                                            $200
                                        </span>
                                        <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600">
                                            USD
                                        </span>
                                    </p>
                                    <a
                                        href="/sign-in"
                                        className="mt-10 block w-full rounded-md bg-[#e09f3e] px-3 py-2 text-center text-sm font-semibold text-black shadow-sm hover:bg-[#e09f3e81] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e09f3e]"
                                    >
                                        Get Full Acess
                                    </a>
                                    <p className="mt-6 text-xs leading-5 text-gray-600">
                                        Access all our PRO features with just
                                        One-Time-Payment
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default LandingPricing;
