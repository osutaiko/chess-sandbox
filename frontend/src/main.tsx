import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { MultiBackend, TouchTransition } from 'dnd-multi-backend';
import "./index.css";

import Layout from "./components/Layout";
import Home from "./routes/Home";
import Create from "./routes/Create";
import BrowseCatalog from "./routes/BrowseCatalog";
import BrowseVariantInfo from "./routes/BrowseVariantInfo";
import Play from "./routes/Play";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/create",
        element: <Create />,
      },
      {
        path: "/browse",
        element: <BrowseCatalog />,
      },
      {
        path: "/browse/:variantId",
        element: <BrowseVariantInfo />,
      },
      {
        path: "/play",
        element: <Play />,
      },
    ],
  },
]);

const HTML5toTouch = {
  backends: [
    {
      backend: HTML5Backend,
      preview: true,
    },
    {
      backend: TouchBackend,
      options: { enableMouseEvents: true },
      preview: true,
      transition: TouchTransition,
    },
  ],
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DndProvider backend={MultiBackend} options={HTML5toTouch}>
      <RouterProvider router={router} />
    </DndProvider>
  </StrictMode>,
);
