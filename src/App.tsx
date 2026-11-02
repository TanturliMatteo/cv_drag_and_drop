import { createBrowserRouter, RouterProvider } from "react-router";
import SiteLayout from "./layouts/SiteLayout/SiteLayout";
import Home from "./pages/Home/Home";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage";

const router = createBrowserRouter([
  {
    element: <SiteLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  {
    // L'editor (Tiptap, font, griglia) è la parte pesante: si scarica solo
    // quando serve, così home e 404 restano leggere.
    path: "editor",
    lazy: async () => ({
      Component: (await import("./pages/EditorPage/EditorPage")).default,
    }),
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
