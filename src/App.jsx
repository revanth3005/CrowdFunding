import React from "react";
// import viteLogo from "/vite.svg";
import "./App.css";
import Header from "./components/Header";
import WagmiConfiguration from "./configurations/wagmi/WagmiConfiguration";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <React.Fragment>
      <WagmiConfiguration>
        <Header />
        <Outlet />
        <ToastContainer />
      </WagmiConfiguration>
    </React.Fragment>
  );
}

export default App;
