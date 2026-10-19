import { createBrowserRouter, RouterProvider } from "react-router";

import SiteLayout from "./layouts/SiteLayouts/SiteLayouts";
import Home from "./pages/Home";
import EditorPage from "./pages/EditorPage/EditorPage";
import NotFoundPage from "./pages/NotFoundPage";

const router = createBrowserRouter([
  {
    element: <SiteLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  { path: "editor", element: <EditorPage /> },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
