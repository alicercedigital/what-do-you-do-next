import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Pages
import Home from "./pages/home";
import Play from "./pages/play";
import Universes from "./pages/universes";
import UniverseNew from "./pages/universe-new";
import UniverseEdit from "./pages/universe-edit";

import "./globals.css";
import { ThemeProvider } from "./shared/components/theme-provider";

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/play", element: <Play /> },
  { path: "/universes", element: <Universes /> },
  { path: "/universes/new", element: <UniverseNew /> },
  { path: "/universes/:id", element: <UniverseEdit /> },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="dark">
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>
);
