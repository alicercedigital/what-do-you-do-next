import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./globals.css";
import { ThemeProvider } from "./shared/components/theme-provider";
import { HomePage } from "./pages/home";
import { PlayPage } from "./pages/play";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/play",
    element: <PlayPage />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="dark">
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>
);
