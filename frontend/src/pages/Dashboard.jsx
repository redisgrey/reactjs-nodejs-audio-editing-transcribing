import React from "react";

import { useSelector } from "react-redux";

import NotFound from "./NotFound";

function Dashboard() {
    const { user } = useSelector((state) => state.auth);
    return (
        <>
            {user ? (
                <>
                    <main className="h-[100vh] mt-20 bg-gray-200 font-[Poppins]">
                        <div>Hello Dashboard!</div>
                    </main>
                </>
            ) : (
                <>
                    <NotFound
                        title={"Not Authorized"}
                        body={"Please sign in to access the dashboard."}
                        status="401"
                    />
                </>
            )}
        </>
    );
}

export default Dashboard;
