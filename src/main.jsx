import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import CampaignHome from "./pages/CampaignHome.jsx";
import ViewCampaigns from "./pages/ViewCampaigns.jsx";
import CreateCampaign from "./pages/CreateCampaign.jsx";
import ViewCampaign from "./pages/ViewCampaign.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    //loader: "rootLoader",
    children: [
      {
        path: "",
        element: <CampaignHome />,
        // loader: teamLoader,
      },
      {
        path: "/view",
        element: <ViewCampaigns />,
        // loader: teamLoader,
      },
      {
        path: "/create",
        element: <CreateCampaign />,
        // loader: teamLoader,
      },
      {
        path: "/view/:index/:contract",
        element: <ViewCampaign />,
        // loader: teamLoader,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
