import React from "react";

function LandingStats() {
    const stats = [
        { id: 1, name: "New Users every month", value: "30,000+" },
        { id: 2, name: "Audios edited every month", value: "20,000+" },
        { id: 3, name: "Users for the year", value: "1 million+" },
    ];
    return (
        <>
            <div className="bg-white py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <dl className="grid grid-cols-1 gap-y-16 gap-x-8 text-center lg:grid-cols-3">
                        {stats.map((stat) => (
                            <div
                                key={stat.id}
                                className="mx-auto flex max-w-xs flex-col gap-y-4"
                            >
                                <dt className="text-base leading-7 text-gray-600">
                                    {stat.name}
                                </dt>
                                <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                                    {stat.value}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </>
    );
}

export default LandingStats;
