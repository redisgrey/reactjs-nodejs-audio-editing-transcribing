import React from "react";

import { useSelector } from "react-redux";

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
                    <div className="mt-56">Sign in to access the dashboard</div>
                </>
            )}
        </>
    );
}

export default Dashboard;
