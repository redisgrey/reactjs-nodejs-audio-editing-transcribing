import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import "./index.css";
import App from "./App";
import { store } from "./app/store";
import { FileContextProvider } from "./contexts/fileContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <FileContextProvider>
            <Provider store={store}>
                <App />
            </Provider>
        </FileContextProvider>
    </React.StrictMode>
);
