import React from "react";

function NotFound({
    title = "Page Not Found",
    body = "Sorry, we couldn’t find the page you’re looking for.",
    status = "404",
}) {
    return (
        <>
            <main className="grid w-[100%] h-[100vh] place-items-center bg-white py-24 px-6 sm:py-32 lg:px-8">
                <div className="text-center">
                    <p className="text-6xl font-semibold text-[#2081C3]">
                        {status}
                    </p>
                    <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                        {title}
                    </h1>
                    <p className="mt-6 text-base leading-7 text-gray-600">
                        {body}
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        <a
                            href="/"
                            className="rounded-md bg-[#E09F3E] px-3.5 py-2.5 text-sm font-semibold text-black shadow-sm hover:bg-[#e09f3e83] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E09F3E]"
                        >
                            Go back home
                        </a>
                        <a
                            href="/"
                            className="text-sm font-semibold text-gray-900 visited:text-gray-900 hover:text-gray-600"
                        >
                            Contact support{" "}
                            <span aria-hidden="true">&rarr;</span>
                        </a>
                    </div>
                </div>
            </main>
        </>
    );
}

export default NotFound;
